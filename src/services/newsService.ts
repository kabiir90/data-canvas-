import { API_ENDPOINTS } from '../utils/constants'
import { NewsArticle } from '../types'
import { getCache, setCache } from '../utils/cache'

const API_KEY = import.meta.env.VITE_NEWS_API_KEY

export interface NewsResponse {
  articles: NewsArticle[]
  totalResults: number
  status: string
}

export async function getNewsByCountry(
  countryCode: string,
  page: number = 1
): Promise<NewsResponse> {
  if (!API_KEY) {
    throw new Error('News API key not configured')
  }

  // Check cache first
  const cacheKey = `country-${countryCode}-page-${page}`
  const cached = getCache<NewsResponse>('news', cacheKey)
  if (cached) {
    return cached
  }

  const response = await fetch(
    `${API_ENDPOINTS.NEWS}/top-headlines?country=${countryCode}&page=${page}&pageSize=20&apiKey=${API_KEY}`
  )
  
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment before trying again. The free News API plan has limited requests per day.')
    }
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Failed to fetch news: ${response.status}`)
  }
  
  const data = await response.json()
  setCache('news', cacheKey, data)
  return data
}

export async function searchNews(query: string, page: number = 1): Promise<NewsResponse> {
  if (!API_KEY) {
    throw new Error('News API key not configured')
  }

  // News API /everything endpoint requires a non-empty query
  if (!query || !query.trim()) {
    throw new Error('Search query is required')
  }

  // Check cache first
  const cacheKey = `search-${query.toLowerCase().trim()}-page-${page}`
  const cached = getCache<NewsResponse>('news', cacheKey)
  if (cached) {
    return cached
  }

  const response = await fetch(
    `${API_ENDPOINTS.NEWS}/everything?q=${encodeURIComponent(query.trim())}&page=${page}&pageSize=20&apiKey=${API_KEY}&sortBy=publishedAt`
  )
  
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment before trying again. The free News API plan has limited requests per day.')
    }
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Failed to search news: ${response.status}`)
  }
  
  const data = await response.json()
  setCache('news', cacheKey, data)
  return data
}

