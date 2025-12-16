import { Link } from 'react-router-dom'
import { Globe, Newspaper, TrendingUp, ArrowRight, Database, Zap } from 'lucide-react'
import Button from '../components/Button'

export default function Landing() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="relative text-center py-12 md:py-16 mb-12 overflow-hidden min-h-[85vh] flex items-center">

        {/* Main Content - No Animations */}
        <div className="relative z-10 w-full">
          <div className="inline-block mb-4 px-5 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full border border-blue-200 shadow-lg">
            <span className="text-blue-700 font-semibold text-xs uppercase tracking-wider flex items-center gap-2">
              <Zap size={14} className="text-blue-600" />
              Real-Time Data Platform
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">
            <span className="block mb-1">OpenData</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Canvas
            </span>
          </h1>

          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mx-auto rounded-full mb-4"></div>

          <p className="text-xl md:text-2xl text-gray-800 mb-3 font-bold max-w-3xl mx-auto leading-relaxed">
            A unified platform for exploring{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              global open data
            </span>
          </p>

          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed font-light">
            Discover countries, news, crypto, weather, and more—all in one professional interface.
          </p>

          <div className="flex gap-4 justify-center flex-wrap mb-8">
            <Link to="/countries">
              <Button 
                size="lg" 
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 px-8 py-4 text-base font-bold"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Database size={20} className="group-hover:rotate-12 transition-transform duration-300" />
                  Explore Data
                  <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </Link>
          </div>

          {/* Data Stats - No Animations */}
          <div className="flex justify-center items-center gap-6 md:gap-8 flex-wrap">
            <div className="flex flex-col items-center">
              <div className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-1">
                195+
              </div>
              <div className="text-xs text-gray-600 font-medium">Countries</div>
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
            <div className="flex flex-col items-center">
              <div className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-1">
                6
              </div>
              <div className="text-xs text-gray-600 font-medium">Sources</div>
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
            <div className="flex flex-col items-center">
              <div className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-1">
                24/7
              </div>
              <div className="text-xs text-gray-600 font-medium">Real-Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Elegant Cards */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">What Data is Aggregated</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group p-8 bg-white border border-gray-200 rounded-2xl text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-300">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Globe className="text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Countries</h3>
            <p className="text-gray-600 leading-relaxed">
              Explore 195+ countries with detailed information including flags, capitals, population,
              and real-time weather data for capital cities.
            </p>
          </div>
          <div className="group p-8 bg-white border border-gray-200 rounded-2xl text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-300">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Newspaper className="text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Global News</h3>
            <p className="text-gray-600 leading-relaxed">
              Stay informed with top headlines from around the world, filtered by country with
              clean, readable article cards.
            </p>
          </div>
          <div className="group p-8 bg-white border border-gray-200 rounded-2xl text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-300">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <TrendingUp className="text-white" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Cryptocurrency</h3>
            <p className="text-gray-600 leading-relaxed">
              Track real-time cryptocurrency prices, market caps, and daily changes with minimal,
              professional financial tables.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-2xl">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to Explore?</h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Start exploring global data with a professional platform designed for efficiency and reliability.
        </p>
        <Link to="/countries">
          <Button size="lg" variant="primary" className="!bg-white !text-blue-600 hover:!bg-gray-100 hover:!text-blue-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 font-semibold">
            Get Started 
            <ArrowRight size={20} className="ml-2" />
          </Button>
        </Link>
      </section>
    </div>
  )
}

