import { useState, useEffect, useCallback } from 'react'
import { debounce } from '../utils/helpers'

export function useSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  initialValue: T[] = [],
  debounceMs: number = 300
) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<T[]>(initialValue)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const performSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults(initialValue)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const data = await searchFn(searchQuery)
        setResults(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed')
        setResults([])
      } finally {
        setLoading(false)
      }
    }, debounceMs),
    [searchFn, initialValue, debounceMs]
  )

  useEffect(() => {
    performSearch(query)
  }, [query, performSearch])

  return {
    query,
    setQuery,
    results,
    loading,
    error,
  }
}


