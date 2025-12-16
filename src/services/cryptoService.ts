import { API_ENDPOINTS } from '../utils/constants'
import { CryptoCurrency } from '../types'
import { getCache, setCache } from '../utils/cache'

export async function getCryptocurrencies(
  limit: number = 50
): Promise<CryptoCurrency[]> {
  // Check cache first
  const cacheKey = `top-${limit}`
  const cached = getCache<CryptoCurrency[]>('crypto', cacheKey)
  if (cached) {
    return cached
  }

  const response = await fetch(
    `${API_ENDPOINTS.CRYPTO}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`
  )
  
  if (!response.ok) {
    throw new Error('Failed to fetch cryptocurrencies')
  }
  
  const data = await response.json()
  setCache('crypto', cacheKey, data)
  return data
}

export async function searchCryptocurrencies(query: string): Promise<CryptoCurrency[]> {
  // Check cache first
  const cacheKey = `search-${query.toLowerCase().trim()}`
  const cached = getCache<CryptoCurrency[]>('crypto', cacheKey)
  if (cached) {
    return cached
  }

  const searchResponse = await fetch(
    `${API_ENDPOINTS.CRYPTO}/search?query=${encodeURIComponent(query)}`
  )
  
  if (!searchResponse.ok) {
    throw new Error('Failed to search cryptocurrencies')
  }
  
  const searchData = await searchResponse.json()
  const coinIds = searchData.coins?.slice(0, 20).map((coin: any) => coin.id) || []
  
  if (coinIds.length === 0) {
    setCache('crypto', cacheKey, [])
    return []
  }
  
  // Fetch market data for the searched coins
  const idsParam = coinIds.join(',')
  const marketResponse = await fetch(
    `${API_ENDPOINTS.CRYPTO}/coins/markets?vs_currency=usd&ids=${idsParam}&order=market_cap_desc&per_page=20&page=1&sparkline=false`
  )
  
  if (!marketResponse.ok) {
    throw new Error('Failed to fetch cryptocurrency market data')
  }
  
  const data = await marketResponse.json()
  setCache('crypto', cacheKey, data)
  return data
}

