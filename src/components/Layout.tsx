import { ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Globe, Newspaper, TrendingUp, Smile, Heart, Image as ImageIcon, Cloud, Menu, X, Home, Trophy } from 'lucide-react'
import { useFavorites } from '../context/FavoritesContext'
import AnimatedBackground from './AnimatedBackground'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { favorites } = useFavorites()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/countries', label: 'Countries', icon: Globe },
    { path: '/news', label: 'News', icon: Newspaper },
    { path: '/crypto', label: 'Crypto', icon: TrendingUp },
    { path: '/images', label: 'Images', icon: ImageIcon },
    { path: '/weather', label: 'Weather', icon: Cloud },
    { path: '/sports', label: 'Sports', icon: Trophy },
    { path: '/fun', label: 'Fun', icon: Smile },
  ]

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Animated Background for all pages */}
      <AnimatedBackground />
      
      <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                <Globe size={20} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  OpenData Canvas
                </span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-blue-600' : ''} />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></span>
                    )}
                  </Link>
                )
              })}
              {favorites.length > 0 && (
                <Link
                  to="/favorites"
                  className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ml-2 ${
                    location.pathname === '/favorites'
                      ? 'text-red-600 bg-red-50'
                      : 'text-gray-600 hover:text-red-600 hover:bg-red-50/50'
                  }`}
                >
                  <Heart size={18} fill={location.pathname === '/favorites' ? 'currentColor' : 'none'} />
                  <span>Favorites</span>
                  <span className="ml-1 px-1.5 py-0.5 text-xs font-semibold text-white bg-red-500 rounded-full">
                    {favorites.length}
                  </span>
                  {location.pathname === '/favorites' && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-600 rounded-full"></span>
                  )}
                </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center gap-2">
              {favorites.length > 0 && (
                <Link
                  to="/favorites"
                  className="relative p-2 text-gray-600 hover:text-red-600 transition-colors rounded-lg hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart size={20} fill={location.pathname === '/favorites' ? 'currentColor' : 'none'} />
                  <span className="absolute -top-1 -right-1 w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                </Link>
              )}
              <button
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Menu"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden pb-4 border-t border-gray-200 mt-2 pt-4 animate-in slide-in-from-top">
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'text-blue-600 bg-blue-50 border border-blue-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </nav>
          )}
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-10 relative z-10">{children}</main>
      <footer className="bg-gray-900/95 backdrop-blur-xl border-t border-gray-800 py-8 text-center mt-auto relative z-10">
        <p className="text-gray-400 text-sm font-light">
          OpenData Canvas - A unified platform for exploring global open data
        </p>
        <p className="text-gray-600 text-xs mt-2">Built with ❤️ using React, TypeScript & Tailwind CSS</p>
      </footer>
    </div>
  )
}

