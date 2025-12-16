import { useState, useCallback } from 'react'
import { Cloud, MapPin, Thermometer, Droplets, Wind, Gauge, Eye, AlertCircle } from 'lucide-react'
import { Weather as WeatherType } from '../types'
import { getWeatherByCity } from '../services/weatherService'
import SearchBar from '../components/SearchBar'
import Card from '../components/Card'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'

export default function Weather() {
  const [weather, setWeather] = useState<WeatherType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [countryFlag, setCountryFlag] = useState<string | null>(null)

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setWeather(null)
      setSearchQuery('')
      setError(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSearchQuery(query)

      const weatherData = await getWeatherByCity(query.trim())

      if (weatherData) {
        setWeather(weatherData)
        
        // Get country flag using country code from weather data
        if (weatherData.sys?.country) {
          const countryCode = weatherData.sys.country.toLowerCase()
          // Use flagcdn.com for country flags (accepts 2-letter ISO codes)
          setCountryFlag(`https://flagcdn.com/w160/${countryCode}.png`)
        } else {
          setCountryFlag(null)
        }
      } else {
        setWeather(null)
        setCountryFlag(null)
        setError(`Weather data not found for "${query}". Please check the spelling and try again. Examples: "London", "New York", "Tokyo", "Paris".`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data'
      setError(errorMessage)
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }, [])

  if (error && !loading && !weather) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mb-6 shadow-xl">
            <Cloud className="text-white" size={32} />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">Weather Search</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-cyan-600 mx-auto rounded-full mb-4"></div>
          <p className="text-xl text-gray-600 font-light">
            Search for weather information by city or country
          </p>
        </div>
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search for weather (e.g., London, New York, Tokyo)..."
          />
        </div>
        <ErrorState message={error} onRetry={() => handleSearch(searchQuery)} />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mb-6 shadow-xl">
          <Cloud className="text-white" size={32} />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">Weather Search</h1>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-cyan-600 mx-auto rounded-full mb-4"></div>
        <p className="text-xl text-gray-600 font-light">
          Search for weather information by city or country
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-8">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search for weather (e.g., London, New York, Tokyo, Paris)..."
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <LoadingSpinner />
          <p className="text-lg text-gray-600">Fetching weather data...</p>
        </div>
      ) : !weather && !searchQuery ? (
        <EmptyState
          icon={<Cloud size={48} />}
          title="Start Your Weather Search"
          description="Enter a city or country name above to get current weather information"
        />
      ) : weather ? (
        <div className="max-w-4xl mx-auto">
          {/* Main Weather Card */}
          <Card className="p-8 md:p-10 bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 border-2 border-blue-200 shadow-2xl mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                {weather.weather[0]?.icon && (
                  <img
                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                    alt={weather.weather[0].description}
                    className="w-32 h-32"
                  />
                )}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin size={24} className="text-blue-600" />
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{weather.name}</h2>
                    {countryFlag && (
                      <img
                        src={countryFlag}
                        alt={`${weather.sys?.country || ''} flag`}
                        className="w-10 h-7 object-cover rounded shadow-md border border-gray-200"
                        onError={(e) => {
                          // Hide flag if image fails to load
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    )}
                  </div>
                  <p className="text-xl text-gray-600 capitalize">
                    {weather.weather[0]?.description}
                  </p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-7xl md:text-8xl font-extrabold text-gray-900 leading-none">
                  {Math.round(weather.main.temp)}°
                </p>
                <p className="text-2xl text-gray-600 mt-2">
                  Feels like {Math.round(weather.main.feels_like)}°
                </p>
              </div>
            </div>
          </Card>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Humidity */}
            <Card className="p-6 bg-white border-2 border-blue-100 hover:border-blue-300 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Droplets className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Humidity</h3>
                  <p className="text-2xl font-bold text-gray-900">{weather.main.humidity}%</p>
                </div>
              </div>
            </Card>

            {/* Wind Speed */}
            <Card className="p-6 bg-white border-2 border-blue-100 hover:border-blue-300 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Wind className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Wind Speed</h3>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(weather.wind.speed * 3.6)} km/h</p>
                </div>
              </div>
            </Card>

            {/* Temperature */}
            <Card className="p-6 bg-white border-2 border-blue-100 hover:border-blue-300 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Thermometer className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Temperature</h3>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(weather.main.temp)}°C</p>
                </div>
              </div>
            </Card>

            {/* Feels Like */}
            <Card className="p-6 bg-white border-2 border-blue-100 hover:border-blue-300 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Gauge className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Feels Like</h3>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(weather.main.feels_like)}°C</p>
                </div>
              </div>
            </Card>

            {/* Weather Condition */}
            <Card className="p-6 bg-white border-2 border-blue-100 hover:border-blue-300 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Eye className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Condition</h3>
                  <p className="text-lg font-bold text-gray-900 capitalize">
                    {weather.weather[0]?.main || 'N/A'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Wind Speed (m/s) */}
            <Card className="p-6 bg-white border-2 border-blue-100 hover:border-blue-300 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Wind className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Wind (m/s)</h3>
                  <p className="text-2xl font-bold text-gray-900">{weather.wind.speed.toFixed(1)} m/s</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Additional Info */}
          <Card className="mt-6 p-6 bg-white border-2 border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={20} className="text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Weather Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <div>
                <p className="text-sm text-gray-600 mb-1">Location</p>
                <p className="font-semibold">{weather.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="font-semibold capitalize">{weather.weather[0]?.description}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Temperature Range</p>
                <p className="font-semibold">
                  {Math.round(weather.main.temp)}°C (Feels like {Math.round(weather.main.feels_like)}°C)
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Humidity</p>
                <p className="font-semibold">{weather.main.humidity}%</p>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

