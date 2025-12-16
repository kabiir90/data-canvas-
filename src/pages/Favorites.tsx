import { Heart, Globe, Newspaper, TrendingUp, Trophy, X } from 'lucide-react'
import { useFavorites } from '../context/FavoritesContext'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import { Favorite, Country, NewsArticle, CryptoCurrency, Match } from '../types'
import { formatNumber } from '../utils/helpers'

export default function Favorites() {
  const { favorites, removeFavorite, getFavoritesByType } = useFavorites()

  const countryFavorites = getFavoritesByType('country')
  const newsFavorites = getFavoritesByType('news')
  const cryptoFavorites = getFavoritesByType('crypto')
  const sportsFavorites = getFavoritesByType('sports')

  if (favorites.length === 0) {
    return (
      <div className="w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl mb-6 shadow-xl">
            <Heart className="text-white" size={48} />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">My Favorites</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-pink-600 mx-auto rounded-full mb-4"></div>
          <p className="text-xl text-gray-600 font-light">
            Your saved items will appear here
          </p>
        </div>
        <EmptyState
          title="No favorites yet"
          description="Start exploring and add items to your favorites!"
        />
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl mb-6 shadow-xl">
          <Heart className="text-white" size={48} />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">My Favorites</h1>
        <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-pink-600 mx-auto rounded-full mb-4"></div>
        <p className="text-xl text-gray-600 font-light">
          {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
        </p>
      </div>

      {countryFavorites.length > 0 && (
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <Globe size={20} className="text-white" />
            </div>
            Countries ({countryFavorites.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {countryFavorites.map((fav) => {
              const country = fav.data as Country
              return (
                <Card key={fav.id} className="group transition-all duration-300 hover:shadow-xl border-2 hover:border-red-300">
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{country.name.common}</h3>
                      <button
                        className="bg-transparent border-none cursor-pointer text-gray-400 p-2 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-red-50 hover:text-red-500"
                        onClick={() => removeFavorite(fav.id)}
                        aria-label="Remove from favorites"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      {country.capital && country.capital[0] && (
                        <span>Capital: {country.capital[0]}</span>
                      )}
                      <span>Population: {formatNumber(country.population)}</span>
                      {country.region && <span>Region: {country.region}</span>}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {newsFavorites.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Newspaper size={20} />
            News Articles ({newsFavorites.length})
          </h2>
          <div className="space-y-4">
            {newsFavorites.map((fav) => {
              const article = fav.data as NewsArticle
              return (
                <Card key={fav.id}>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 flex-1">{article.title}</h3>
                      <button
                        className="bg-transparent border-none cursor-pointer text-gray-600 p-1 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-gray-50 hover:text-red-500 ml-2"
                        onClick={() => removeFavorite(fav.id)}
                        aria-label="Remove from favorites"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    {article.source && (
                      <p className="text-sm text-gray-600 mb-2">{article.source.name}</p>
                    )}
                    {article.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">{article.description}</p>
                    )}
                    {article.url && (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1"
                      >
                        Read article →
                      </a>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {cryptoFavorites.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} />
            Cryptocurrencies ({cryptoFavorites.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cryptoFavorites.map((fav) => {
              const crypto = fav.data as CryptoCurrency
              const isPositive = crypto.price_change_percentage_24h >= 0
              return (
                <Card key={fav.id}>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">{crypto.name}</h3>
                      <button
                        className="bg-transparent border-none cursor-pointer text-gray-600 p-1 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-gray-50 hover:text-red-500"
                        onClick={() => removeFavorite(fav.id)}
                        aria-label="Remove from favorites"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm">
                      <span className="text-gray-600">Price: ${formatNumber(crypto.current_price)}</span>
                      <span className={isPositive ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {isPositive ? '+' : ''}
                        {crypto.price_change_percentage_24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {sportsFavorites.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Trophy size={20} />
            Sports Matches ({sportsFavorites.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sportsFavorites.map((fav) => {
              const match = fav.data as Match
              return (
                <Card key={fav.id}>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {match.home || 'Home'} vs {match.away || 'Away'}
                      </h3>
                      <button
                        className="bg-transparent border-none cursor-pointer text-gray-600 p-1 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-gray-50 hover:text-red-500"
                        onClick={() => removeFavorite(fav.id)}
                        aria-label="Remove from favorites"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      {match.league && <span>{match.league}</span>}
                      {match.date && <span>{match.date}</span>}
                      {match.status && <span className="font-medium">{match.status}</span>}
                    </div>
                    {match.score && (
                      <div className="mt-3 flex items-center gap-2 text-lg font-bold text-gray-800">
                        <span>{match.score.home ?? '-'}</span>
                        <span className="text-gray-400">vs</span>
                        <span>{match.score.away ?? '-'}</span>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

