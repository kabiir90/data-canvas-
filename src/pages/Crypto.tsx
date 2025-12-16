import { useState, useEffect, useTransition, useMemo } from 'react'
import { TrendingUp, TrendingDown, RefreshCw, Heart } from 'lucide-react'
import { CryptoCurrency } from '../types'
import { getCryptocurrencies, searchCryptocurrencies } from '../services/cryptoService'
import { useFavorites } from '../context/FavoritesContext'
import SearchBar from '../components/SearchBar'
import Card from '../components/Card'
import Button from '../components/Button'
import Skeleton from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import { formatNumber } from '../utils/helpers'

export default function Crypto() {
  const [cryptos, setCryptos] = useState<CryptoCurrency[]>([])
  const [filteredCryptos, setFilteredCryptos] = useState<CryptoCurrency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [sortBy, setSortBy] = useState<'price' | 'change'>('price')
  const [, startTransition] = useTransition()

  const { addFavorite, removeFavorite, isFavorite } = useFavorites()

  useEffect(() => {
    loadCryptos()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadCryptos()
      }, 30000) // Refresh every 30 seconds

      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  // Memoized sorting - non-blocking
  const sortedCryptos = useMemo(() => {
    return [...filteredCryptos].sort((a, b) => {
      if (sortBy === 'price') {
        return b.current_price - a.current_price
      } else {
        return b.price_change_percentage_24h - a.price_change_percentage_24h
      }
    })
  }, [filteredCryptos, sortBy])

  const loadCryptos = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCryptocurrencies(50)
      setCryptos(data)
      setFilteredCryptos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cryptocurrencies')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      startTransition(() => {
        setFilteredCryptos(cryptos)
      })
      return
    }

    try {
      startTransition(() => {
        setLoading(true)
      })
      
      const results = await searchCryptocurrencies(query)
      
      startTransition(() => {
        setFilteredCryptos(results)
        setLoading(false)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setLoading(false)
    }
  }

  const handleToggleFavorite = (crypto: CryptoCurrency) => {
    const id = `crypto-${crypto.id}`
    if (isFavorite(id)) {
      removeFavorite(id)
    } else {
      addFavorite({
        id,
        type: 'crypto',
        data: crypto,
      })
    }
  }

  if (error && !cryptos.length) {
    return <ErrorState message={error} onRetry={loadCryptos} />
  }

  return (
    <div className="w-full">
      <div className="mb-10 flex justify-between items-start gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">Cryptocurrency Markets</h1>
              <div className="w-20 h-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full"></div>
            </div>
          </div>
          <p className="text-xl text-gray-600 font-light ml-16">
            Track real-time cryptocurrency prices and market data
          </p>
        </div>
        <div>
          <Button
            variant={autoRefresh ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
            Auto Refresh
          </Button>
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-4">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search cryptocurrencies..."
          className="w-full"
        />
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600 font-medium">Sort by:</span>
          <Button
            variant={sortBy === 'price' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSortBy('price')}
          >
            Price
          </Button>
          <Button
            variant={sortBy === 'change' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSortBy('change')}
          >
            24h Change
          </Button>
        </div>
      </div>

      {loading && !cryptos.length ? (
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <Card key={i}>
              <Skeleton height="60px" />
            </Card>
          ))}
        </div>
      ) : sortedCryptos.length === 0 ? (
        <EmptyState
          title="No cryptocurrencies found"
          description="Try adjusting your search criteria"
        />
      ) : (
        <div className="space-y-4">
          {sortedCryptos.map((crypto) => {
            const favoriteId = `crypto-${crypto.id}`
            const isFav = isFavorite(favoriteId)
            const isPositive = crypto.price_change_percentage_24h >= 0

            return (
              <Card key={crypto.id} hover className="group transition-all duration-300 hover:shadow-xl border-2 hover:border-green-300">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-600 w-8 flex-shrink-0">{crypto.market_cap_rank}</div>
                    <img
                      src={crypto.image}
                      alt={crypto.name}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 truncate">{crypto.name}</h3>
                      <span className="text-sm text-gray-600 uppercase">{crypto.symbol.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-800">
                        ${formatNumber(crypto.current_price)}
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? (
                          <TrendingUp size={16} />
                        ) : (
                          <TrendingDown size={16} />
                        )}
                        <span>{Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%</span>
                      </div>
                    </div>
                    <button
                      className={`bg-transparent border-none cursor-pointer text-gray-600 p-1 flex items-center justify-center rounded-full transition-all duration-200 flex-shrink-0 hover:bg-gray-50 hover:text-red-500 ${isFav ? 'text-red-500' : ''}`}
                      onClick={() => handleToggleFavorite(crypto)}
                      aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

