export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return formatDate(dateString)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

/**
 * Validates if CSS styles are properly loaded for an element
 * @param element - The DOM element to check
 * @param expectedStyles - Object with expected style properties and values
 * @returns true if styles are loaded correctly, false otherwise
 */
export function validateStyles(
  element: HTMLElement | null,
  expectedStyles?: Record<string, string>
): boolean {
  if (!element) return false
  
  try {
    const computedStyle = window.getComputedStyle(element)
    
    // Basic validation - check if element has non-default positioning
    const position = computedStyle.position
    const hasPosition = position !== 'static' && 
                       (position === 'relative' || position === 'absolute')
    
    // Check if display is not default block
    const display = computedStyle.display
    const hasDisplay = display !== 'block' && 
                     (display === 'flex' || display === 'grid')
    
    // If expected styles provided, validate them
    if (expectedStyles) {
      for (const [prop, expectedValue] of Object.entries(expectedStyles)) {
        const actualValue = computedStyle.getPropertyValue(prop) || 
                          (computedStyle as any)[prop]
        if (actualValue !== expectedValue) {
          console.warn(`Style mismatch for ${prop}: expected ${expectedValue}, got ${actualValue}`)
        }
      }
    }
    
    return hasPosition || hasDisplay
  } catch (error) {
    console.error('Error validating styles:', error)
    return false
  }
}

/**
 * Safely applies inline styles to an element with error handling
 * @param element - The DOM element
 * @param styles - Object with style properties
 * @returns true if styles were applied successfully
 */
export function safeApplyStyles(
  element: HTMLElement | null,
  styles: React.CSSProperties
): boolean {
  if (!element) return false
  
  try {
    Object.assign(element.style, styles)
    return true
  } catch (error) {
    console.error('Error applying styles:', error)
    return false
  }
}

