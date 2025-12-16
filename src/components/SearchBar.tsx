import { InputHTMLAttributes, useState, useEffect, useCallback, useRef } from 'react'
import { Filter, X } from 'lucide-react'
import { useDebounce } from '../hooks/useDebounce'

interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onSearch: (query: string) => void
  placeholder?: string
  debounceMs?: number
}

export default function SearchBar({
  onSearch,
  placeholder = 'Search...',
  debounceMs = 300,
  ...props
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const debouncedQuery = useDebounce(query, debounceMs)
  const isFirstRender = useRef(true)

  // Error handling wrapper
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message?.includes('Tailwind') || event.message?.includes('className')) {
        console.error('SearchBar styling error:', event.message)
        setError(event.message)
      }
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  // Memoize the search callback to prevent unnecessary re-renders
  const handleSearch = useCallback((value: string) => {
    try {
      onSearch(value)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown search error'
      console.error('SearchBar search error:', errorMessage)
      setError(errorMessage)
    }
  }, [onSearch])

  // Use useEffect to call onSearch when debounced query changes
  useEffect(() => {
    // Skip the first render to prevent unnecessary initial calls
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    
    try {
      handleSearch(debouncedQuery)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown debounce error'
      console.error('SearchBar debounce error:', errorMessage)
      setError(errorMessage)
    }
  }, [debouncedQuery, handleSearch])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setQuery(e.target.value)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown input error'
      console.error('SearchBar input change error:', errorMessage)
      setError(errorMessage)
    }
  }, [])

  const handleClear = useCallback(() => {
    try {
      setQuery('')
      onSearch('')
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown clear error'
      console.error('SearchBar clear error:', errorMessage)
      setError(errorMessage)
    }
  }, [onSearch])

  // Validate Tailwind classes are working and catch styling errors
  useEffect(() => {
    try {
      const container = document.querySelector('.search-bar-container')
      const clearBtn = document.querySelector('.search-bar-clear-btn')
      
      if (container) {
        const computedStyle = window.getComputedStyle(container as Element)
        const display = computedStyle.display
        
        // Check if flex is applied (should be 'flex' not 'block' or 'none')
        if (display !== 'flex') {
          console.warn('SearchBar: Tailwind flex classes may not be applied. Display:', display)
        }
        
        // Check border radius
        const borderRadius = computedStyle.borderRadius
        if (!borderRadius || borderRadius === '0px') {
          console.warn('SearchBar: Border radius may not be applied:', borderRadius)
        }
      }
      
      if (clearBtn) {
        const btnStyle = window.getComputedStyle(clearBtn as Element)
        const position = btnStyle.position
        if (position !== 'absolute') {
          console.warn('SearchBar clear button: Position may not be applied. Position:', position)
        }
        
        // Verify opacity
        const opacity = btnStyle.opacity
        if (opacity && parseFloat(opacity) !== 0.7) {
          console.info('SearchBar clear button: Opacity is', opacity, '(expected 0.7)')
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown style validation error'
      console.error('SearchBar style validation error:', errorMessage)
      setError(errorMessage)
    }
  }, [query]) // Re-validate when query changes (button appears/disappears)

  return (
    <div className="search-bar-container relative flex items-center w-full max-w-3xl bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-200 min-h-[48px] focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 focus-within:shadow-md">
      <input
        type="text"
        className="w-full pl-4 pr-20 py-[1.125rem] text-[1.0625rem] font-normal bg-transparent text-gray-800 border-0 rounded-lg outline-none appearance-none focus:ring-0 focus:outline-none focus:border-0 placeholder:text-gray-400 placeholder:opacity-70 min-h-[44px] md:pl-4 md:pr-20 md:text-[1.0625rem] sm:pl-3 sm:pr-16 sm:text-base sm:py-4"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        style={{ border: 'none', outline: 'none' }}
        {...props}
      />
      {query ? (
        <button
          type="button"
          className="search-bar-clear-btn absolute right-6 bg-transparent border-0 cursor-pointer text-gray-500 flex items-center justify-center p-1.5 rounded-full w-7 h-7 opacity-70 z-20 top-1/2 -translate-y-1/2 transition-all duration-200 hover:bg-gray-100 hover:text-gray-800 hover:opacity-100 active:scale-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 sm:right-5 sm:w-[26px] sm:h-[26px]"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X size={18} strokeWidth={2.5} className="pointer-events-none" />
        </button>
      ) : (
        <Filter 
          className="absolute right-6 text-blue-600 pointer-events-none z-10 w-[22px] h-[22px] top-1/2 -translate-y-1/2 transition-colors duration-200 sm:right-5" 
          size={22} 
          strokeWidth={2.5}
        />
      )}
      {error && (
        <div className="absolute -bottom-6 left-0 text-xs text-red-500" role="alert">
          Error: {error}
        </div>
      )}
    </div>
  )
}

