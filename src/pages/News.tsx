import { useState, useEffect, useTransition } from 'react'
import { ExternalLink, Heart, Calendar, Globe, Newspaper } from 'lucide-react'
import { NewsArticle } from '../types'
import { getNewsByCountry, searchNews } from '../services/newsService'
import { useFavorites } from '../context/FavoritesContext'
import SearchBar from '../components/SearchBar'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import Skeleton from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import { formatRelativeTime } from '../utils/helpers'

const COUNTRY_CODES = [
  { code: 'us', name: 'United States' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'ca', name: 'Canada' },
  { code: 'au', name: 'Australia' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'jp', name: 'Japan' },
  { code: 'in', name: 'India' },
  { code: 'br', name: 'Brazil' },
  { code: 'mx', name: 'Mexico' },
]

export default function News() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string>('us')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [isPending, startTransition] = useTransition()

  const { addFavorite, removeFavorite, isFavorite } = useFavorites()

  useEffect(() => {
    if (searchQuery.trim()) {
      loadSearchResults()
    } else {
      loadNews()
    }
  }, [selectedCountry, page])

  const loadNews = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getNewsByCountry(selectedCountry, page)
      const filteredArticles = response.articles.filter((article) => article.title !== '[Removed]')
      // Use startTransition for non-blocking state update
      startTransition(() => {
        setArticles(filteredArticles)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news')
    } finally {
      setLoading(false)
    }
  }

  const loadSearchResults = async (query?: string) => {
    try {
      setLoading(true)
      setError(null)
      const searchTerm = query || searchQuery
      
      // Don't search if query is empty
      if (!searchTerm || !searchTerm.trim()) {
        loadNews()
        return
      }
      
      const response = await searchNews(searchTerm.trim(), page)
      const filteredArticles = response.articles.filter((article) => article.title !== '[Removed]')
      // Use startTransition for non-blocking state update
      startTransition(() => {
        setArticles(filteredArticles)
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search news'
      // If it's an empty query error, just load default news instead
      if (errorMessage.includes('empty') || errorMessage.includes('required') || errorMessage.includes('parametersMissing')) {
        loadNews()
      } else {
        setError(errorMessage)
        startTransition(() => {
          setArticles([])
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPage(1)
    if (query.trim()) {
      loadSearchResults(query.trim())
    } else {
      setSearchQuery('')
      loadNews()
    }
  }

  const handleCountryChange = (code: string) => {
    setSelectedCountry(code)
    setPage(1)
    setSearchQuery('')
  }

  const handleToggleFavorite = (article: NewsArticle) => {
    const id = `news-${article.url}`
    if (isFavorite(id)) {
      removeFavorite(id)
    } else {
      addFavorite({
        id,
        type: 'news',
        data: article,
      })
    }
  }

  const handleOpenArticle = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (error && !articles.length) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          if (searchQuery.trim()) {
            loadSearchResults()
          } else {
            loadNews()
          }
        }}
      />
    )
  }

  return (
    <div className="w-full">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Newspaper className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">Global News</h1>
            <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
          </div>
        </div>
        <p className="text-xl text-gray-600 font-light ml-16">
          Stay informed with top headlines from around the world
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search news articles..."
          className="w-full"
        />
        <div className="flex gap-2 flex-wrap">
          {COUNTRY_CODES.map((country) => (
            <Button
              key={country.code}
              variant={selectedCountry === country.code ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleCountryChange(country.code)}
              disabled={!!searchQuery.trim()}
            >
              <Globe size={16} />
              {country.name}
            </Button>
          ))}
        </div>
      </div>

      {error ? (
        <ErrorState
          title={error.includes('Rate limit') ? 'API Rate Limit Exceeded' : 'Error Loading News'}
          message={error}
          onRetry={() => {
            setError(null)
            if (searchQuery.trim()) {
              loadSearchResults()
            } else {
              loadNews()
            }
          }}
        />
      ) : loading && !articles.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton height="300px" />
            </Card>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <EmptyState
          title="No articles found"
          description="Try adjusting your search or selecting a different country"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
            {articles.map((article, index) => {
              const favoriteId = `news-${article.url}`
              const isFav = isFavorite(favoriteId)

              return (
                <Card key={`${article.url}-${index}`} hover className="group overflow-hidden transition-all duration-300 hover:shadow-2xl border-2 hover:border-purple-300">
                  <div className="flex flex-col h-full">
                    {article.urlToImage && (
                      <div className="w-full h-56 mb-5 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner group-hover:shadow-lg transition-shadow duration-300">
                        <img
                          src={article.urlToImage}
                          alt={article.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="flex flex-col flex-1 gap-2">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-lg font-semibold text-gray-800 leading-snug flex-1">{article.title}</h3>
                        <button
                          className={`bg-transparent border-none cursor-pointer text-gray-600 p-1 flex items-center justify-center rounded-full transition-all duration-200 flex-shrink-0 hover:bg-gray-50 hover:text-red-500 ${isFav ? 'text-red-500' : ''}`}
                          onClick={() => handleToggleFavorite(article)}
                          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      {article.description && (
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{article.description}</p>
                      )}
                      <div className="mt-auto pt-4 flex justify-between items-center">
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Globe size={14} />
                            <span>{article.source.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{formatRelativeTime(article.publishedAt)}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenArticle(article.url)}
                        >
                          Read More <ExternalLink size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
          {articles.length >= 20 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              <span className="text-gray-600">Page {page}</span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

