import { API_ENDPOINTS } from '../utils/constants'
import { getCache, setCache } from '../utils/cache'

const API_KEY = import.meta.env.VITE_UNSPLASH_API_KEY

export interface UnsplashImage {
  id: string
  url: string
  rawUrl?: string
  fullUrl?: string
  description: string | null
  width: number
  height: number
  author: string
  authorUrl: string
  thumbUrl?: string
}

export async function getImageByQuery(query: string): Promise<string | null> {
  if (!API_KEY) {
    console.warn('Unsplash API key is not configured')
    return null
  }

  if (!query || !query.trim()) {
    console.warn('Image query is empty')
    return null
  }

  try {
    const url = `${API_ENDPOINTS.IMAGES}/search/photos?query=${encodeURIComponent(query.trim())}&per_page=1&orientation=landscape&client_id=${API_KEY}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Unsplash API error (${response.status}):`, errorText)
      return null
    }
    
    const data = await response.json()
    
    if (!data || !data.results || data.results.length === 0) {
      console.warn(`No images found for query: ${query}`)
      return null
    }
    
    const imageUrl = data.results[0]?.urls?.regular || data.results[0]?.urls?.small || null
    
    if (!imageUrl) {
      console.warn('Image URL not found in API response')
      return null
    }
    
    return imageUrl
  } catch (error) {
    console.error('Image fetch error:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    return null
  }
}

export async function getImagesByQuery(query: string, perPage: number = 12): Promise<UnsplashImage[]> {
  if (!API_KEY) {
    console.warn('Unsplash API key is not configured')
    return []
  }

  if (!query || !query.trim()) {
    console.warn('Image query is empty')
    return []
  }

  // Check cache first
  const cacheKey = `${query.toLowerCase().trim()}-${perPage}`
  const cached = getCache<UnsplashImage[]>('images', cacheKey)
  if (cached) {
    return cached
  }

  try {
    const url = `${API_ENDPOINTS.IMAGES}/search/photos?query=${encodeURIComponent(query.trim())}&per_page=${perPage}&orientation=landscape&client_id=${API_KEY}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Unsplash API error (${response.status}):`, errorText)
      return []
    }
    
    const data = await response.json()
    
    if (!data || !data.results || data.results.length === 0) {
      console.warn(`No images found for query: ${query}`)
      setCache('images', cacheKey, [])
      return []
    }
    
    const images = data.results.map((result: any) => ({
      id: result.id,
      url: result.urls?.regular || result.urls?.small || '',
      rawUrl: result.urls?.raw || result.urls?.full || result.urls?.regular || '',
      fullUrl: result.urls?.full || result.urls?.regular || '',
      thumbUrl: result.urls?.thumb || result.urls?.small || '',
      description: result.description || result.alt_description || query,
      width: result.width || 0,
      height: result.height || 0,
      author: result.user?.name || 'Unknown',
      authorUrl: result.user?.links?.html || 'https://unsplash.com',
    }))
    
    setCache('images', cacheKey, images)
    return images
  } catch (error) {
    console.error('Image fetch error:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    return []
  }
}

