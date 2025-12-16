const BASE_URL = 'https://api.sportsrc.org'

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<any>>()
const CACHE_DURATION = 60000 // 1 minute cache

function getCachedData<T>(key: string): T | null {
  const entry = cache.get(key)
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.data
  }
  return null
}

function setCachedData<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  })
}

async function fetchWithCache<T>(url: string, cacheKey: string): Promise<T> {
  // Check cache first
  const cached = getCachedData<T>(cacheKey)
  if (cached) {
    return cached
  }

  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      // Don't throw generic errors here - let the calling function provide context
      if (response.status === 404) {
        const error = new Error('404 Not Found')
        ;(error as any).status = 404
        throw error
      }
      if (response.status === 503) {
        throw new Error('Service temporarily unavailable. Please try again later.')
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Cache the response
    setCachedData(cacheKey, data)
    
    return data
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.')
    }
    throw error
  }
}

/**
 * Get all available sports categories
 * Returns array of category objects with id and name
 */
export async function getSportCategories(): Promise<Array<{ id: string; name: string }>> {
  const url = `${BASE_URL}/?data=sports`
  const cacheKey = 'sports-categories'
  
  try {
    const response = await fetchWithCache<{ success: boolean; data: Array<{ id: string; name: string }> }>(url, cacheKey)
    
    // Handle the API response format: { success: true, data: [...] }
    if (response && typeof response === 'object' && 'data' in response) {
      return Array.isArray(response.data) ? response.data : []
    }
    
    // Fallback: if response is already an array
    if (Array.isArray(response)) {
      return response
    }
    
    return []
  } catch (error) {
    console.error('Error fetching sport categories:', error)
    throw error
  }
}

/**
 * Get matches for a specific category
 * Returns array of match objects
 */
export async function getMatches(category: string): Promise<any[]> {
  if (!category || !category.trim()) {
    throw new Error('Category is required')
  }

  const url = `${BASE_URL}/?data=matches&category=${encodeURIComponent(category.toLowerCase())}`
  const cacheKey = `matches-${category.toLowerCase()}`
  
  try {
    const response = await fetchWithCache<{ success: boolean; data: any[] }>(url, cacheKey)
    
    // Handle the API response format: { success: true, data: [...] }
    if (response && typeof response === 'object' && 'data' in response) {
      return Array.isArray(response.data) ? response.data : []
    }
    
    // Fallback: if response is already an array
    if (Array.isArray(response)) {
      return response
    }
    
    return []
  } catch (error) {
    console.error('Error fetching matches:', error)
    throw error
  }
}

/**
 * Get match details including stream embed
 */
export async function getMatchDetail(category: string, matchId: string): Promise<any> {
  if (!category || !category.trim()) {
    throw new Error('Category is required')
  }
  if (!matchId || !matchId.trim()) {
    throw new Error('Match ID is required')
  }

  const url = `${BASE_URL}/?data=detail&category=${encodeURIComponent(category.toLowerCase())}&id=${encodeURIComponent(matchId)}`
  const cacheKey = `match-detail-${category.toLowerCase()}-${matchId}`
  
  try {
    const data = await fetchWithCache<any>(url, cacheKey)
    return data
  } catch (error) {
    console.error('Error fetching match detail:', error)
    throw error
  }
}

/**
 * Get leagues, tables, or scores
 */
export async function getResults(
  category: 'leagues' | 'tables' | 'scores',
  league?: string
): Promise<any> {
  if (!category || !category.trim()) {
    throw new Error('Category is required (leagues, tables, or scores)')
  }

  let url = `${BASE_URL}/?data=results&category=${encodeURIComponent(category)}`
  
  if (league && (category === 'tables' || category === 'scores')) {
    // Clean league code - remove any invalid characters
    const cleanLeague = league.trim().replace(/[^a-zA-Z0-9:._-]/g, '')
    if (cleanLeague) {
      url += `&league=${encodeURIComponent(cleanLeague)}`
    }
  }

  const cacheKey = `results-${category}-${league || 'all'}`
  
  try {
    const data = await fetchWithCache<any>(url, cacheKey)
    return data
  } catch (error) {
    // Provide more helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('404') || error.message.includes('not found')) {
        if (category === 'tables' || category === 'scores') {
          throw new Error(
            `League "${league}" not found. Please check the league code. ` +
            `Common formats: "PL" (Premier League), "NBA", "c:1", etc. ` +
            `Try fetching leagues first to see available options.`
          )
        } else {
          throw new Error('No leagues found for this category. Please try a different sport.')
        }
      }
      throw error
    }
    console.error('Error fetching results:', error)
    throw error
  }
}

