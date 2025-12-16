import { useState, useEffect, useTransition, useMemo, useRef, useCallback } from 'react'
import { Heart, MapPin, Users, Cloud, Globe, Clock, DollarSign, Languages, Thermometer, Droplets, Wind, Navigation } from 'lucide-react'
import { Country, Weather } from '../types'
import { getAllCountries, searchCountries, getCountriesByRegion, getCountryByCode } from '../services/countriesService'
import { getWeatherByCity } from '../services/weatherService'
import { useFavorites } from '../context/FavoritesContext'
import { useSession } from '../context/SessionContext'
import SearchBar from '../components/SearchBar'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import Skeleton from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Modal from '../components/Modal'
import { formatNumber } from '../utils/helpers'
import { REGIONS } from '../utils/constants'

export default function CountryExplorer() {
  const [countries, setCountries] = useState<Country[]>([])
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingRegion, setLoadingRegion] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loadingCountryDetails, setLoadingCountryDetails] = useState(false)
  const [weatherData, setWeatherData] = useState<Weather | null>(null)
  const [loadingWeather, setLoadingWeather] = useState(false)
  const [isPending, startTransition] = useTransition()
  const isLoadingRef = useRef(false) // Prevent duplicate loading calls
  const lastLoadedRegionRef = useRef<string | null>(null) // Track last loaded region

  const { addFavorite, removeFavorite, isFavorite } = useFavorites()
  const { lastSearchedCountry, setLastSearchedCountry } = useSession()

  useEffect(() => {
    loadCountries()
  }, [])

  // Memoized filtering - non-blocking, prevents unnecessary re-renders
  const memoizedFilteredCountries = useMemo(() => {
    return filteredCountries
  }, [filteredCountries])

  const loadCountries = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllCountries()
      setCountries(data)
      setFilteredCountries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load countries')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadCountriesByRegion = useCallback(async (region: string) => {
    // Prevent duplicate calls - check if same region is already loaded or loading
    if (isLoadingRef.current || lastLoadedRegionRef.current === region) {
      return
    }
    
    try {
      isLoadingRef.current = true
      lastLoadedRegionRef.current = region // Mark this region as loading
      setLoadingRegion(true)
      setError(null)
      const data = await getCountriesByRegion(region)
      // Use startTransition for non-blocking state update
      startTransition(() => {
        setFilteredCountries(data)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load countries')
      setFilteredCountries([])
      lastLoadedRegionRef.current = null // Reset on error so it can retry
    } finally {
      setLoadingRegion(false)
      isLoadingRef.current = false
    }
  }, [])

  // Single useEffect to handle region changes - prevents duplicate loading
  useEffect(() => {
    if (selectedRegion === 'All') {
      setLoadingRegion(false)
      isLoadingRef.current = false
      lastLoadedRegionRef.current = 'All'
      startTransition(() => {
        setFilteredCountries(countries)
      })
    } else if (countries.length > 0) {
      // Only load if region changed and we have countries data
      if (lastLoadedRegionRef.current !== selectedRegion && !isLoadingRef.current) {
        loadCountriesByRegion(selectedRegion)
      }
    }
  }, [selectedRegion, countries, loadCountriesByRegion])
  
  // Update filtered countries when countries array changes and region is "All"
  useEffect(() => {
    if (selectedRegion === 'All' && countries.length > 0 && lastLoadedRegionRef.current !== 'All') {
      lastLoadedRegionRef.current = 'All'
      startTransition(() => {
        setFilteredCountries(countries)
      })
    }
  }, [countries, selectedRegion])

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    
    if (!query.trim()) {
      setLoadingRegion(false)
      isLoadingRef.current = false // Reset loading flag
      lastLoadedRegionRef.current = null // Reset region ref for search
      if (selectedRegion === 'All') {
        startTransition(() => {
          setFilteredCountries(countries)
        })
      } else {
        lastLoadedRegionRef.current = null // Reset to allow reload
        await loadCountriesByRegion(selectedRegion)
      }
      return
    }

    // Prevent duplicate search calls
    if (isLoadingRef.current) return
    
    try {
      isLoadingRef.current = true
      lastLoadedRegionRef.current = null // Clear region ref for search
      setLoadingRegion(true)
      setError(null)
      const results = await searchCountries(query)
      
      // Use startTransition for non-blocking state update
      startTransition(() => {
        setFilteredCountries(results)
        if (results.length > 0) {
          setLastSearchedCountry(results[0].name.common)
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setFilteredCountries([])
    } finally {
      setLoadingRegion(false)
      isLoadingRef.current = false
    }
  }, [selectedRegion, countries, loadCountriesByRegion, setLastSearchedCountry])

  const handleCountryClick = async (country: Country) => {
    // Check if country code exists
    if (!country.cca3) {
      console.error('Country code (cca3) is missing for country:', country.name.common)
      // Use the country data we already have
      setIsModalOpen(true)
      setSelectedCountry(country)
      // Try to load weather with available data
      if (country.capital?.[0]) {
        setLoadingWeather(true)
        const weather = await getWeatherByCity(country.capital[0], country.cca2)
        if (weather) {
          setWeatherData(weather)
        }
        setLoadingWeather(false)
      }
      return
    }

    setIsModalOpen(true)
    setLoadingCountryDetails(true)
    setWeatherData(null)
    
    try {
      // Fetch full country details
      const fullCountry = await getCountryByCode(country.cca3)
      setSelectedCountry(fullCountry)
      
      // Load weather - try multiple strategies
      setLoadingWeather(true)
      let weather = null
      
      // Strategy 1: Capital with country code (most accurate)
      if (fullCountry.capital?.[0] && fullCountry.cca2) {
        weather = await getWeatherByCity(fullCountry.capital[0], fullCountry.cca2)
      }
      
      // Strategy 2: Capital without country code
      if (!weather && fullCountry.capital?.[0]) {
        weather = await getWeatherByCity(fullCountry.capital[0])
      }
      
      // Strategy 3: Country name with country code
      if (!weather && fullCountry.name.common && fullCountry.cca2) {
        weather = await getWeatherByCity(fullCountry.name.common, fullCountry.cca2)
      }
      
      // Strategy 4: Country name only
      if (!weather && fullCountry.name.common) {
        weather = await getWeatherByCity(fullCountry.name.common)
      }
      
      if (weather) {
        setWeatherData(weather)
      }
      setLoadingWeather(false)
    } catch (err) {
      console.error('Error loading country details:', err)
      setSelectedCountry(country) // Fallback to basic country data
      setLoadingWeather(false)
    } finally {
      setLoadingCountryDetails(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCountry(null)
    setWeatherData(null)
  }

  const handleToggleFavorite = (country: Country) => {
    const id = `country-${country.cca3}`
    if (isFavorite(id)) {
      removeFavorite(id)
    } else {
      addFavorite({
        id,
        type: 'country',
        data: country,
      })
    }
  }

  if (error && !countries.length) {
    return <ErrorState message={error} onRetry={loadCountries} />
  }

  return (
    <div className="w-full">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Globe className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">Country Explorer</h1>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"></div>
          </div>
        </div>
        <p className="text-xl text-gray-600 font-light ml-16">
          Discover countries around the world with detailed information and real-time weather data
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search countries by name..."
          className="w-full"
        />
        <div className="flex gap-2 flex-wrap">
          {REGIONS.map((region) => {
            const isSelected = selectedRegion === region
            const isLoading = loadingRegion && isSelected
            return (
              <Button
                key={region}
                variant={isSelected ? 'primary' : 'outline'}
                size="sm"
                onClick={() => {
                  // Only update if region actually changed to prevent duplicate loads
                  if (selectedRegion !== region && !isLoadingRef.current) {
                    setSelectedRegion(region)
                  }
                }}
                disabled={isLoading || (loadingRegion && !isSelected)}
                className="relative"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span>Loading...</span>
                  </span>
                ) : (
                  region
                )}
              </Button>
            )
          })}
        </div>
      </div>

          {(loading || isPending) && !countries.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(12)].map((_, i) => (
            <Card key={i}>
              <Skeleton height="200px" />
            </Card>
          ))}
        </div>
          ) : loadingRegion ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(12)].map((_, i) => (
            <Card key={i}>
              <Skeleton height="200px" />
            </Card>
          ))}
        </div>
          ) : memoizedFilteredCountries.length === 0 ? (
        <EmptyState
          title="No countries found"
          description="Try adjusting your search or filter criteria"
        />
      ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {memoizedFilteredCountries.map((country) => {
            const countryCode = country.cca3
            const favoriteId = `country-${countryCode}`
            const isFav = isFavorite(favoriteId)

            return (
              <Card key={countryCode} hover onClick={() => handleCountryClick(country)} className="group overflow-hidden transition-all duration-300 hover:shadow-2xl border-2 hover:border-blue-300 cursor-pointer">
                <div className="w-full">
                  <div className="w-full h-48 mb-5 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner group-hover:shadow-lg transition-shadow duration-300">
                    <img 
                      src={country.flags.png} 
                      alt={country.flags.alt || country.name.common} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-xl font-semibold text-gray-800 flex-1">{country.name.common}</h3>
                      <button
                        className={`bg-transparent border-none cursor-pointer text-gray-600 p-1 flex items-center justify-center rounded-full transition-all duration-200 flex-shrink-0 hover:bg-gray-50 hover:text-red-500 ${isFav ? 'text-red-500' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleFavorite(country)
                        }}
                        aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
                      {country.capital?.[0] && (
                        <div className="flex items-center gap-1">
                          <MapPin size={16} />
                          <span>{country.capital[0]}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users size={16} />
                        <span>{formatNumber(country.population)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{country.region}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Country Details Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedCountry?.name.common}>
        {loadingCountryDetails ? (
          <div className="flex items-center justify-center h-full min-h-[60vh]">
            <LoadingSpinner />
          </div>
        ) : selectedCountry ? (
          <div className="h-full overflow-y-auto p-4 md:p-5">
            <div className="grid grid-cols-12 gap-4 h-full">
              {/* Left Column - Flag & Stats */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
                {/* Flag */}
                <div className="w-full h-40 lg:h-48 rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-gray-100 to-gray-200">
                  <img 
                    src={selectedCountry.flags.png} 
                    alt={selectedCountry.flags.alt || selectedCountry.name.common} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-1.5 text-blue-600 mb-1.5">
                      <Users size={16} />
                      <span className="text-[10px] font-semibold uppercase">Population</span>
                    </div>
                    <p className="text-base font-bold text-gray-800 leading-tight">{formatNumber(selectedCountry.population)}</p>
                  </div>
                  {selectedCountry.area && (
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                      <div className="flex items-center gap-1.5 text-green-600 mb-1.5">
                        <Globe size={16} />
                        <span className="text-[10px] font-semibold uppercase">Area</span>
                      </div>
                      <p className="text-base font-bold text-gray-800 leading-tight">{formatNumber(selectedCountry.area)} km²</p>
                    </div>
                  )}
                  {selectedCountry.capital?.[0] && (
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-1.5 text-purple-600 mb-1.5">
                        <MapPin size={16} />
                        <span className="text-[10px] font-semibold uppercase">Capital</span>
                      </div>
                      <p className="text-base font-bold text-gray-800 leading-tight">{selectedCountry.capital[0]}</p>
                    </div>
                  )}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-1.5 text-orange-600 mb-1.5">
                      <Navigation size={16} />
                      <span className="text-[10px] font-semibold uppercase">Region</span>
                    </div>
                    <p className="text-base font-bold text-gray-800 leading-tight">{selectedCountry.region}</p>
                  </div>
                </div>

                {/* Weather Section - Always Visible */}
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200 shadow-md flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                      <Cloud className="text-white" size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">Weather</h4>
                      <p className="text-xs text-gray-600">{selectedCountry.capital?.[0] || selectedCountry.name.common}</p>
                    </div>
                  </div>
                  {loadingWeather ? (
                    <div className="flex items-center justify-center flex-1">
                      <LoadingSpinner size="sm" />
                    </div>
                  ) : weatherData ? (
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-3">
                        {weatherData.weather[0]?.icon && (
                          <img
                            src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                            alt={weatherData.weather[0].description}
                            className="w-12 h-12"
                          />
                        )}
                        <div>
                          <p className="text-3xl font-bold text-gray-800 leading-none">{Math.round(weatherData.main.temp)}°C</p>
                          <p className="text-xs text-gray-600">Feels like {Math.round(weatherData.main.feels_like)}°C</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-800 capitalize font-medium mb-3">
                        {weatherData.weather[0]?.description?.charAt(0).toUpperCase() + weatherData.weather[0]?.description?.slice(1)}
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-blue-200">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Droplets size={14} className="text-blue-500" />
                          <span>{weatherData.main.humidity}%</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Wind size={14} className="text-blue-500" />
                          <span>{Math.round(weatherData.wind.speed * 3.6)} km/h</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-xs text-gray-600 text-center">Weather unavailable</p>
                    </div>
                  )}
                </div>

                {/* Favorite Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedCountry) {
                      handleToggleFavorite(selectedCountry)
                    }
                  }}
                  className="flex items-center justify-center gap-2 w-full"
                >
                  <Heart size={16} fill={selectedCountry && isFavorite(`country-${selectedCountry.cca3}`) ? 'currentColor' : 'none'} />
                  {selectedCountry && isFavorite(`country-${selectedCountry.cca3}`) ? 'Remove Favorite' : 'Add Favorite'}
                </Button>
              </div>

              {/* Right Column - Details */}
              <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-3 auto-rows-min">
                {/* Official Name */}
                <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Globe size={14} className="text-blue-600" />
                    <h4 className="text-xs font-semibold uppercase tracking-wide">Official Name</h4>
                  </div>
                  <p className="text-sm text-gray-800 font-medium leading-tight">{selectedCountry.name.official}</p>
                </div>

                {/* Subregion */}
                {selectedCountry.subregion && (
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin size={14} className="text-blue-600" />
                      <h4 className="text-xs font-semibold uppercase tracking-wide">Subregion</h4>
                    </div>
                    <p className="text-sm text-gray-800 font-medium leading-tight">{selectedCountry.subregion}</p>
                  </div>
                )}

                {/* Continents */}
                {selectedCountry.continents && selectedCountry.continents.length > 0 && (
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Globe size={14} className="text-blue-600" />
                      <h4 className="text-xs font-semibold uppercase tracking-wide">Continent{selectedCountry.continents.length > 1 ? 's' : ''}</h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCountry.continents.map((continent, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-200">
                          {continent}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timezones */}
                {selectedCountry.timezones && selectedCountry.timezones.length > 0 && (
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Clock size={14} className="text-blue-600" />
                      <h4 className="text-xs font-semibold uppercase tracking-wide">Timezone{selectedCountry.timezones.length > 1 ? 's' : ''}</h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCountry.timezones.slice(0, 4).map((tz, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-50 text-gray-700 rounded text-xs font-medium border border-gray-200">
                          {tz}
                        </span>
                      ))}
                      {selectedCountry.timezones.length > 4 && (
                        <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-xs font-medium border border-gray-200">
                          +{selectedCountry.timezones.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {selectedCountry.languages && Object.keys(selectedCountry.languages).length > 0 && (
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Languages size={14} className="text-blue-600" />
                      <h4 className="text-xs font-semibold uppercase tracking-wide">Language{Object.keys(selectedCountry.languages).length > 1 ? 's' : ''}</h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.values(selectedCountry.languages).map((lang, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium border border-indigo-200">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Currencies */}
                {selectedCountry.currencies && Object.keys(selectedCountry.currencies).length > 0 && (
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <DollarSign size={14} className="text-blue-600" />
                      <h4 className="text-xs font-semibold uppercase tracking-wide">Currenc{Object.keys(selectedCountry.currencies).length > 1 ? 'ies' : 'y'}</h4>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {Object.entries(selectedCountry.currencies).map(([code, currency]) => (
                        <div key={code} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                          <div>
                            <p className="text-xs font-semibold text-gray-800">{currency.name}</p>
                            <p className="text-[10px] text-gray-600">{code}</p>
                          </div>
                          <p className="text-base font-bold text-green-700">{currency.symbol}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Native Names */}
                {selectedCountry.name.nativeName && Object.keys(selectedCountry.name.nativeName).length > 0 && (
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm md:col-span-2">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Languages size={14} className="text-blue-600" />
                      <h4 className="text-xs font-semibold uppercase tracking-wide">Native Names</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(selectedCountry.name.nativeName).slice(0, 6).map(([code, name]) => (
                        <div key={`native-${code}`} className="p-2 bg-gray-50 rounded border border-gray-200">
                          <p className="text-[10px] text-gray-500 uppercase mb-0.5">{code}</p>
                          <p className="text-xs font-semibold text-gray-800 leading-tight">{name.common}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

