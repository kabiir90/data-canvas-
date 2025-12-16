interface CacheItem<T> {
  data: T
  timestamp: number
  expiresIn: number // milliseconds
}

const CACHE_PREFIX = 'opendata-canvas-'
const DEFAULT_CACHE_DURATION = {
  countries: 12 * 60 * 60 * 1000, // 12 hours (reduced from 24)
  news: 30 * 60 * 1000, // 30 minutes
  weather: 10 * 60 * 1000, // 10 minutes
  crypto: 2 * 60 * 1000, // 2 minutes
  images: 60 * 60 * 1000, // 1 hour
  jokes: 60 * 60 * 1000, // 1 hour
}

export function getCacheKey(service: string, key: string): string {
  return `${CACHE_PREFIX}${service}-${key}`
}

export function setCache<T>(service: string, key: string, data: T, expiresIn?: number): void {
  try {
    const cacheKey = getCacheKey(service, key)
    const duration = expiresIn || DEFAULT_CACHE_DURATION[service as keyof typeof DEFAULT_CACHE_DURATION] || 60 * 60 * 1000
    
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresIn: duration,
    }
    
    const serialized = JSON.stringify(cacheItem)
    
    // Check if data is too large (rough estimate: 3MB limit - reduced)
    if (serialized.length > 3 * 1024 * 1024) {
      console.warn(`Cache item too large (${(serialized.length / 1024 / 1024).toFixed(2)}MB), skipping cache for ${cacheKey}`)
      return
    }
    
    // For region-specific country queries, clear old region caches first to save space
    if (service === 'countries' && key.startsWith('region-')) {
      clearCountryRegionCaches()
    }
    
    localStorage.setItem(cacheKey, serialized)
  } catch (error) {
    // If storage is full, try to clear old cache and retry once
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      try {
        // Clear country region caches first (they're large and redundant)
        if (service === 'countries') {
          clearCountryRegionCaches()
        }
        clearOldCache()
        clearLargeCaches()
        
        // Retry once after clearing
        try {
          const cacheKey = getCacheKey(service, key)
          const duration = expiresIn || DEFAULT_CACHE_DURATION[service as keyof typeof DEFAULT_CACHE_DURATION] || 60 * 60 * 1000
          const cacheItem: CacheItem<T> = {
            data,
            timestamp: Date.now(),
            expiresIn: duration,
          }
          const serialized = JSON.stringify(cacheItem)
          
          // Check size again after clearing
          if (serialized.length > 3 * 1024 * 1024) {
            console.warn(`Cache item still too large after cleanup, skipping cache for ${cacheKey}`)
            return
          }
          
          localStorage.setItem(cacheKey, serialized)
        } catch (retryError) {
          // If still fails, skip caching silently (don't log warning to reduce console noise)
          // console.warn(`Cache quota exceeded for ${service}-${key}, skipping cache`)
        }
      } catch (clearError) {
        // Silently skip caching if cleanup fails
      }
    } else {
      // Only log non-quota errors
      if (!(error instanceof Error && error.name === 'QuotaExceededError')) {
        console.warn('Failed to set cache:', error)
      }
    }
  }
}

function clearCountryRegionCaches(): void {
  try {
    // Clear all country region caches to free up space
    const prefix = getCacheKey('countries', 'region-')
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(prefix)) {
        try {
          localStorage.removeItem(key)
        } catch {
          // Ignore errors
        }
      }
    })
  } catch (error) {
    // Silently fail
  }
}

function clearLargeCaches(): void {
  try {
    // Clear the largest cache entries first (countries data is usually the largest)
    const cacheKeys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX))
    const cacheSizes: Array<{ key: string; size: number }> = []
    
    cacheKeys.forEach(key => {
      try {
        const item = localStorage.getItem(key)
        if (item) {
          cacheSizes.push({ key, size: item.length })
        }
      } catch {
        // Skip invalid entries
      }
    })
    
    // Sort by size (largest first) and remove top 5 largest (increased from 3)
    cacheSizes.sort((a, b) => b.size - a.size)
    cacheSizes.slice(0, 5).forEach(({ key }) => {
      try {
        localStorage.removeItem(key)
      } catch {
        // Ignore errors
      }
    })
  } catch (error) {
    // Silently fail
  }
}

export function getCache<T>(service: string, key: string): T | null {
  try {
    const cacheKey = getCacheKey(service, key)
    const cached = localStorage.getItem(cacheKey)
    
    if (!cached) return null
    
    const cacheItem: CacheItem<T> = JSON.parse(cached)
    const now = Date.now()
    const age = now - cacheItem.timestamp
    
    // Check if cache is expired
    if (age > cacheItem.expiresIn) {
      localStorage.removeItem(cacheKey)
      return null
    }
    
    return cacheItem.data
  } catch (error) {
    console.warn('Failed to get cache:', error)
    return null
  }
}

export function clearCache(service?: string): void {
  try {
    if (service) {
      // Clear specific service cache
      const prefix = getCacheKey(service, '')
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key)
        }
      })
    } else {
      // Clear all app cache
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    }
  } catch (error) {
    console.warn('Failed to clear cache:', error)
  }
}

function clearOldCache(): void {
  try {
    const now = Date.now()
    const keysToRemove: string[] = []
    
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key)
          if (cached) {
            const cacheItem = JSON.parse(cached)
            const age = now - cacheItem.timestamp
            if (age > cacheItem.expiresIn) {
              keysToRemove.push(key)
            }
          }
        } catch {
          // Invalid cache entry, remove it
          keysToRemove.push(key)
        }
      }
    })
    
    keysToRemove.forEach((key) => localStorage.removeItem(key))
  } catch (error) {
    console.warn('Failed to clear old cache:', error)
  }
}

// Clear expired cache on load
if (typeof window !== 'undefined') {
  clearOldCache()
}

