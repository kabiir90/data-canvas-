import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
}

export default function Card({ children, className = '', onClick, hover = false }: CardProps) {
  const baseClasses = 'bg-white border border-gray-200 rounded-lg p-6 shadow-sm'
  const hoverClasses = hover ? 'cursor-pointer transition-all duration-200 hover:shadow-md hover:border-blue-600 focus:outline-2 focus:outline-blue-600 focus:outline-offset-2' : ''
  
  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      } : undefined}
    >
      {children}
    </div>
  )
}

