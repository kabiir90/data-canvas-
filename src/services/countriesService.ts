import { API_ENDPOINTS } from '../utils/constants'
import { Country } from '../types'
import { getCache, setCache } from '../utils/cache'

// Fields we need for the Country type - using only validated fields that work
// Start with basic fields that are confirmed to work from the API example
// Always include cca3 for country identification
const COUNTRY_FIELDS_BASIC = 'name,flags,capital,population,cca3,cca2,region'

export async function getAllCountries(): Promise<Country[]> {
  // Check cache first
  const cacheKey = 'all-countries'
  const cached = getCache<Country[]>('countries', cacheKey)
  if (cached) {
    return cached
  }

  try {
    // Try with basic fields first (more reliable)
    const params = new URLSearchParams()
    params.append('fields', COUNTRY_FIELDS_BASIC)
    
    const url = `${API_ENDPOINTS.COUNTRIES}/all?${params.toString()}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    
    if (!response.ok) {
      // If fields parameter fails, try without it (get all data)
      if (response.status === 400) {
        console.warn('Fields parameter failed, fetching all data...')
        const fallbackUrl = `${API_ENDPOINTS.COUNTRIES}/all`
        const fallbackResponse = await fetch(fallbackUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        })
        
        if (!fallbackResponse.ok) {
          const errorText = await fallbackResponse.text()
          console.error('REST Countries API error:', fallbackResponse.status, errorText)
          throw new Error(`Failed to fetch countries: ${fallbackResponse.status} ${fallbackResponse.statusText}`)
        }
        
        const data = await fallbackResponse.json()
        // Only cache if data is not too large (countries data can be very large)
        try {
          setCache('countries', cacheKey, data)
        } catch (error) {
          // If caching fails (quota exceeded), continue without cache
          console.warn('Skipping cache for countries data (too large)')
        }
        return data
      }
      
      const errorText = await response.text()
      console.error('REST Countries API error:', response.status, errorText)
      throw new Error(`Failed to fetch countries: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    // Only cache if data is not too large (countries data can be very large)
    try {
      setCache('countries', cacheKey, data)
    } catch (error) {
      // If caching fails (quota exceeded), continue without cache
      console.warn('Skipping cache for countries data (too large)')
    }
    return data
  } catch (error) {
    console.error('Error fetching countries:', error)
    throw error
  }
}

export async function searchCountries(query: string): Promise<Country[]> {
  if (!query.trim()) return getAllCountries()
  
  // Check cache first
  const cacheKey = `search-${query.toLowerCase().trim()}`
  const cached = getCache<Country[]>('countries', cacheKey)
  if (cached) {
    return cached
  }
  
  try {
    // Try with basic fields first
    const params = new URLSearchParams()
    params.append('fields', COUNTRY_FIELDS_BASIC)
    const url = `${API_ENDPOINTS.COUNTRIES}/name/${encodeURIComponent(query)}?${params.toString()}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        setCache('countries', cacheKey, [])
        return []
      }
      // If fields parameter fails, try without it
      if (response.status === 400) {
        const fallbackUrl = `${API_ENDPOINTS.COUNTRIES}/name/${encodeURIComponent(query)}`
        const fallbackResponse = await fetch(fallbackUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        })
        if (!fallbackResponse.ok) {
          if (fallbackResponse.status === 404) {
            setCache('countries', cacheKey, [])
            return []
          }
          throw new Error(`Failed to search countries: ${fallbackResponse.status}`)
        }
        const data = await fallbackResponse.json()
        setCache('countries', cacheKey, data)
        return data
      }
      throw new Error(`Failed to search countries: ${response.status}`)
    }
    const data = await response.json()
    setCache('countries', cacheKey, data)
    return data
  } catch (error) {
    console.error('Error searching countries:', error)
    if (error instanceof Error && error.message.includes('404')) {
      setCache('countries', cacheKey, [])
      return []
    }
    throw error
  }
}

export async function getCountryByCode(code: string): Promise<Country> {
  // Check cache first
  const cacheKey = `code-${code}`
  const cached = getCache<Country>('countries', cacheKey)
  if (cached) {
    return cached
  }

  try {
    // Fetch full country details without fields restriction for modal view
    const url = `${API_ENDPOINTS.COUNTRIES}/alpha/${code}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch country: ${response.status}`)
    }
    const data = await response.json()
    const country = Array.isArray(data) ? data[0] : data
    setCache('countries', cacheKey, country)
    return country
  } catch (error) {
    console.error('Error fetching country by code:', error)
    throw error
  }
}

export async function getCountriesByRegion(region: string): Promise<Country[]> {
  if (region === 'All') return getAllCountries()
  
  // Don't cache region-specific queries - they're too large and cause quota issues
  // Users can filter from the main countries list which is already cached
  // Only check cache, but don't cache the result to save localStorage space
  const cacheKey = `region-${region}`
  const cached = getCache<Country[]>('countries', cacheKey)
  if (cached) {
    return cached
  }
  
  try {
    // Try with basic fields first
    const params = new URLSearchParams()
    params.append('fields', COUNTRY_FIELDS_BASIC)
    const url = `${API_ENDPOINTS.COUNTRIES}/region/${encodeURIComponent(region)}?${params.toString()}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    
    if (!response.ok) {
      // If fields parameter fails, try without it
      if (response.status === 400) {
        const fallbackUrl = `${API_ENDPOINTS.COUNTRIES}/region/${encodeURIComponent(region)}`
        const fallbackResponse = await fetch(fallbackUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        })
        if (!fallbackResponse.ok) {
          throw new Error(`Failed to fetch countries by region: ${fallbackResponse.status}`)
        }
        const data = await fallbackResponse.json()
        // Skip caching to prevent quota issues - region queries are subsets of main list
        // setCache('countries', cacheKey, data)
        return data
      }
      throw new Error(`Failed to fetch countries by region: ${response.status}`)
    }
    const data = await response.json()
    // Skip caching region-specific queries to prevent localStorage quota exceeded errors
    // The main countries list is cached, and region filtering can be done client-side if needed
    // setCache('countries', cacheKey, data)
    return data
  } catch (error) {
    console.error('Error fetching countries by region:', error)
    throw error
  }
}
