import { API_ENDPOINTS } from '../utils/constants'
import { Weather } from '../types'
import { getCache, setCache } from '../utils/cache'

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY

export async function getWeatherByCity(city: string, countryCode?: string): Promise<Weather | null> {
  if (!API_KEY) {
    console.warn('Weather API key not configured')
    return null
  }

  // Check cache first
  const cacheKey = countryCode ? `${city}-${countryCode}` : city
  const cached = getCache<Weather>('weather', cacheKey.toLowerCase())
  if (cached) {
    return cached
  }

  // Try with city and country code first (more accurate)
  if (countryCode) {
    try {
      const query = `${city},${countryCode}`
      const response = await fetch(
        `${API_ENDPOINTS.WEATHER}/weather?q=${encodeURIComponent(query)}&appid=${API_KEY}&units=metric`
      )
      
      if (response.ok) {
        const data = await response.json()
        setCache('weather', cacheKey.toLowerCase(), data)
        return data
      }
    } catch (error) {
      console.warn('Weather fetch with country code failed, trying city only:', error)
    }
  }

  // Fallback to city only
  try {
    const response = await fetch(
      `${API_ENDPOINTS.WEATHER}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    )
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Weather not found for: ${city}${countryCode ? `, ${countryCode}` : ''}`)
        return null
      }
      throw new Error('Failed to fetch weather')
    }
    
    const data = await response.json()
    setCache('weather', cacheKey.toLowerCase(), data)
    return data
  } catch (error) {
    console.error('Weather fetch error:', error)
    return null
  }
}

