interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}

export default function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }
  
  return (
    <div className={`inline-flex items-center justify-center ${sizeClasses[size]}`} aria-label="Loading">
      <div className={`w-full h-full border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin ${sizeClasses[size]}`}></div>
    </div>
  )
}

