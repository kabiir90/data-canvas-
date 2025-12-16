import { useState, useEffect, useTransition, useMemo, useCallback } from 'react'
import { Trophy, Calendar, Play, BarChart3, AlertCircle, Search, Clock, TrendingUp, Heart } from 'lucide-react'
import { Match, MatchDetail } from '../types'
import { getSportCategories, getMatches, getMatchDetail, getResults } from '../services/sportsService'
import { useFavorites } from '../context/FavoritesContext'
import SearchBar from '../components/SearchBar'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import Skeleton from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import Modal from '../components/Modal'

type ViewMode = 'matches' | 'leagues' | 'tables'

interface SportCategory {
  id: string
  name: string
}

export default function Sports() {
  const [categories, setCategories] = useState<SportCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('football')
  const [matches, setMatches] = useState<any[]>([])
  const [leagues, setLeagues] = useState<any[]>([])
  const [selectedMatch, setSelectedMatch] = useState<MatchDetail | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMatch, setLoadingMatch] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('matches')
  const [selectedLeague, setSelectedLeague] = useState<string>('')
  const [tableData, setTableData] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isPending, startTransition] = useTransition()

  const { addFavorite, removeFavorite, isFavorite } = useFavorites()

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      if (viewMode === 'matches') {
        loadMatches()
      } else if (viewMode === 'leagues') {
        loadLeagues()
      } else if (viewMode === 'tables' && selectedLeague) {
        loadTable()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, viewMode, selectedLeague])

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getSportCategories()
      setCategories(data)
      if (data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sports categories')
    } finally {
      setLoading(false)
    }
  }

  const loadMatches = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getMatches(selectedCategory)
      startTransition(() => {
        setMatches(data)
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load matches')
      setMatches([])
    } finally {
      setLoading(false)
    }
  }

  const loadLeagues = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getResults('leagues')
      startTransition(() => {
        // Handle different response formats
        let leaguesList: any[] = []
        if (Array.isArray(data)) {
          leaguesList = data
        } else if (data && typeof data === 'object') {
          if (data.success && data.data && Array.isArray(data.data)) {
            leaguesList = data.data
          } else if (data.leagues && Array.isArray(data.leagues)) {
            leaguesList = data.leagues
          } else if (data.data && Array.isArray(data.data)) {
            leaguesList = data.data
          } else {
            // Convert object to array
            leaguesList = Object.entries(data).map(([key, value]) => ({
              id: key,
              code: key,
              name: typeof value === 'string' ? value : (value as any)?.name || key,
              ...(typeof value === 'object' ? value : {}),
            }))
          }
        }
        setLeagues(leaguesList)
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load leagues'
      setError(errorMessage)
      setLeagues([])
    } finally {
      setLoading(false)
    }
  }

  const loadTable = useCallback(async (leagueCode?: string) => {
    const code = leagueCode || selectedLeague
    if (!code || !code.trim()) {
      setError('Please enter a league code (e.g., PL, NBA, c:1)')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      const data = await getResults('tables', code.trim())
      startTransition(() => {
        setTableData(data)
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load table'
      setError(errorMessage)
      setTableData(null)
    } finally {
      setLoading(false)
    }
  }, [selectedLeague])

  const handleMatchClick = async (match: any) => {
    setIsModalOpen(true)
    setLoadingMatch(true)
    setSelectedMatch(null)

    try {
      const detail = await getMatchDetail(selectedCategory, match.id)
      setSelectedMatch(detail)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load match details')
    } finally {
      setLoadingMatch(false)
    }
  }

  const handleToggleFavorite = (match: any) => {
    const id = `sports-${match.id}`
    if (isFavorite(id)) {
      removeFavorite(id)
    } else {
      addFavorite({
        id,
        type: 'sports',
        data: match,
      })
    }
  }

  const handleLeagueClick = (league: any) => {
    const leagueCode = league.code || league.id || league.slug || String(league)
    setSelectedLeague(leagueCode)
    setViewMode('tables')
    loadTable(leagueCode)
  }

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  // Filter matches based on search query
  const filteredMatches = useMemo(() => {
    if (!searchQuery.trim()) {
      return matches
    }
    const query = searchQuery.toLowerCase()
    return matches.filter((match) => {
      const homeTeam = match.teams?.home?.name || match.home || ''
      const awayTeam = match.teams?.away?.name || match.away || ''
      const title = match.title || ''
      return (
        homeTeam.toLowerCase().includes(query) ||
        awayTeam.toLowerCase().includes(query) ||
        title.toLowerCase().includes(query)
      )
    })
  }, [matches, searchQuery])

  // Format date helper
  const formatMatchDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    } else if (days === 1) {
      return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    } else if (days === -1) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        hour: '2-digit',
        minute: '2-digit',
      })
    }
  }, [])

  if (error && !categories.length && !matches.length) {
    return <ErrorState message={error} onRetry={loadCategories} />
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <Trophy className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">Sports</h1>
            <div className="w-20 h-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-full"></div>
          </div>
        </div>
        <p className="text-xl text-gray-600 font-light ml-16">
          Live matches, schedules, and sports data
        </p>
      </div>

      {/* Filters Section */}
      <div className="mb-8 flex flex-col gap-4">
        {/* Category Selection */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedCategory(category.id)
                setSelectedLeague('')
                setTableData(null)
                setSearchQuery('')
              }}
              className="transition-all duration-200"
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600 font-medium">View:</span>
          <Button
            variant={viewMode === 'matches' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setViewMode('matches')
              setSelectedLeague('')
              setTableData(null)
            }}
            className="transition-all duration-200"
          >
            <Calendar size={16} />
            Matches
          </Button>
          <Button
            variant={viewMode === 'leagues' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setViewMode('leagues')
              setSelectedLeague('')
              setTableData(null)
            }}
            className="transition-all duration-200"
          >
            <Trophy size={16} />
            Leagues
          </Button>
          <Button
            variant={viewMode === 'tables' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setViewMode('tables')
            }}
            className="transition-all duration-200"
          >
            <BarChart3 size={16} />
            Tables
          </Button>
        </div>

        {/* Search Bar for Matches */}
        {viewMode === 'matches' && (
          <div className="max-w-2xl">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search matches by team or title..."
              className="w-full"
            />
          </div>
        )}

        {/* League Selection for Tables */}
        {viewMode === 'tables' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600 font-medium">League Code:</span>
              <input
                type="text"
                placeholder="e.g., PL, NBA, c:1"
                value={selectedLeague}
                onChange={(e) => {
                  setSelectedLeague(e.target.value)
                  setError(null)
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && selectedLeague.trim()) {
                    loadTable()
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent min-w-[200px]"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => loadTable()}
                disabled={!selectedLeague.trim() || loading}
                className="transition-all duration-200"
              >
                Load Table
              </Button>
            </div>
            {leagues.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-gray-600 font-medium">Quick Select (click to load):</p>
                <div className="flex flex-wrap gap-2">
                  {leagues.slice(0, 12).map((league, idx) => {
                    const leagueCode = league.code || league.id || league.slug || String(league)
                    const leagueName = league.name || league.title || String(league)
                    return (
                      <button
                        key={idx}
                        onClick={() => handleLeagueClick(league)}
                        className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-700 rounded-lg transition-colors border border-gray-200 hover:border-orange-300 font-medium"
                      >
                        {leagueName} ({leagueCode})
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && viewMode !== 'tables' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Content */}
      {(loading || isPending) && viewMode === 'matches' && !matches.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <Card key={i}>
              <Skeleton height="280px" />
            </Card>
          ))}
        </div>
      ) : viewMode === 'matches' ? (
        filteredMatches.length === 0 ? (
          <EmptyState
            title={searchQuery ? "No matches found" : "No matches available"}
            description={searchQuery ? "Try adjusting your search query" : "Try selecting a different category"}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredMatches.map((match, index) => {
              const favoriteId = `sports-${match.id || index}`
              const isFav = isFavorite(favoriteId)
              const homeTeam = match.teams?.home?.name || match.home || 'Home'
              const awayTeam = match.teams?.away?.name || match.away || 'Away'
              const matchTitle = match.title || `${homeTeam} vs ${awayTeam}`
              const formattedDate = match.date ? formatMatchDate(match.date) : ''

              return (
                <Card
                  key={match.id || index}
                  hover
                  onClick={() => handleMatchClick(match)}
                  className="group overflow-hidden transition-all duration-300 hover:shadow-2xl border-2 hover:border-orange-300 cursor-pointer bg-white"
                >
                  <div className="flex flex-col h-full">
                    {/* Match Poster/Image */}
                    {match.poster && (
                      <div className="w-full h-40 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        <img
                          src={match.poster}
                          alt={matchTitle}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                          loading="lazy"
                        />
                      </div>
                    )}
                    
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
                            {homeTeam} vs {awayTeam}
                          </h3>
                          {match.title && match.title !== `${homeTeam} vs ${awayTeam}` && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{match.title}</p>
                          )}
                          {formattedDate && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                              <Clock size={14} />
                              <span>{formattedDate}</span>
                            </div>
                          )}
                          {match.popular && (
                            <span className="inline-block px-2 py-0.5 text-xs font-semibold text-orange-600 bg-orange-50 rounded border border-orange-200">
                              Popular
                            </span>
                          )}
                        </div>
                        <button
                          className={`bg-transparent border-none cursor-pointer text-gray-400 p-1.5 flex items-center justify-center rounded-full transition-all duration-200 flex-shrink-0 hover:bg-red-50 hover:text-red-500 ${isFav ? 'text-red-500' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleFavorite(match)
                          }}
                          aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      
                      {/* Team Badges */}
                      {(match.teams?.home?.badge || match.teams?.away?.badge) && (
                        <div className="flex items-center justify-center gap-4 py-3 mb-3 bg-gradient-to-r from-gray-50 to-orange-50 rounded-lg">
                          {match.teams?.home?.badge ? (
                            <img
                              src={match.teams.home.badge}
                              alt={homeTeam}
                              className="w-10 h-10 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-600">{homeTeam.charAt(0)}</span>
                            </div>
                          )}
                          <span className="text-gray-400 font-bold text-sm">vs</span>
                          {match.teams?.away?.badge ? (
                            <img
                              src={match.teams.away.badge}
                              alt={awayTeam}
                              className="w-10 h-10 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-600">{awayTeam.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {match.score && (
                        <div className="flex items-center justify-center gap-4 py-3 bg-gradient-to-r from-orange-50 via-red-50 to-orange-50 rounded-lg mb-3">
                          <span className="text-3xl font-extrabold text-gray-900">
                            {match.score.home ?? '-'}
                          </span>
                          <span className="text-gray-500 font-semibold">vs</span>
                          <span className="text-3xl font-extrabold text-gray-900">
                            {match.score.away ?? '-'}
                          </span>
                        </div>
                      )}
                      
                      {match.status && (
                        <p className="text-xs text-center text-gray-600 font-semibold mb-3 px-2 py-1 bg-gray-100 rounded">
                          {match.status}
                        </p>
                      )}
                      
                      <div className="mt-auto flex items-center justify-center gap-2 text-sm text-orange-600 font-semibold pt-3 border-t border-gray-100">
                        <Play size={16} />
                        <span>View Details & Stream</span>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )
      ) : viewMode === 'leagues' ? (
        loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Card key={i}>
                <Skeleton height="120px" />
              </Card>
            ))}
          </div>
        ) : leagues.length === 0 ? (
          <EmptyState
            title="No leagues found"
            description="Try selecting a different category or check back later"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues.map((league, index) => {
              const leagueCode = league.code || league.id || league.slug || String(league)
              const leagueName = league.name || league.title || String(league)
              const leagueCountry = league.country || ''
              
              return (
                <Card
                  key={league.id || index}
                  hover
                  onClick={() => handleLeagueClick(league)}
                  className="group transition-all duration-300 hover:shadow-xl border-2 hover:border-orange-300 cursor-pointer bg-white"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {leagueName}
                        </h3>
                        {leagueCountry && (
                          <p className="text-sm text-gray-600">{leagueCountry}</p>
                        )}
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <Trophy size={20} className="text-white" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500 font-medium">Code:</span>
                      <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        {leagueCode}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-orange-600 font-medium">
                      <BarChart3 size={14} />
                      <span>Click to view table</span>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )
      ) : viewMode === 'tables' ? (
        loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : error && !tableData ? (
          <div className="max-w-2xl mx-auto">
            <ErrorState
              title="Unable to Load Table"
              message={error}
              onRetry={() => {
                if (selectedLeague.trim()) {
                  loadTable()
                }
              }}
            />
            {leagues.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Quick Tip:</h4>
                <p className="text-sm text-blue-800 mb-3">
                  Switch to "Leagues" view and click on any league to automatically load its table.
                </p>
                <p className="text-xs text-blue-700">
                  Or enter a league code manually (e.g., PL, NBA, c:1, c:2)
                </p>
              </div>
            )}
          </div>
        ) : tableData ? (
          <Card className="overflow-hidden bg-white">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {tableData.league || selectedLeague} League Table
                  </h3>
                  {tableData.season && (
                    <p className="text-sm text-gray-600">Season: {tableData.season}</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="text-white" size={24} />
                </div>
              </div>
              {tableData.table && Array.isArray(tableData.table) && tableData.table.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Pos</th>
                        <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Team</th>
                        <th className="text-center py-4 px-4 text-sm font-bold text-gray-700">P</th>
                        <th className="text-center py-4 px-4 text-sm font-bold text-gray-700">W</th>
                        <th className="text-center py-4 px-4 text-sm font-bold text-gray-700">D</th>
                        <th className="text-center py-4 px-4 text-sm font-bold text-gray-700">L</th>
                        <th className="text-center py-4 px-4 text-sm font-bold text-gray-700">GD</th>
                        <th className="text-center py-4 px-4 text-sm font-bold text-gray-700">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.table.map((entry: any, index: number) => {
                        const position = entry.position || index + 1
                        const isTopThree = position <= 3
                        return (
                          <tr
                            key={index}
                            className={`border-b border-gray-100 transition-colors ${
                              isTopThree
                                ? 'bg-gradient-to-r from-orange-50/50 to-red-50/50 hover:from-orange-100/50 hover:to-red-100/50'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <td className="py-4 px-4">
                              <span className={`text-sm font-bold ${
                                isTopThree ? 'text-orange-600' : 'text-gray-800'
                              }`}>
                                {position}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm font-semibold text-gray-900">
                                {entry.team || entry.name}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-sm text-center text-gray-600 font-medium">
                              {entry.played || entry.p || '-'}
                            </td>
                            <td className="py-4 px-4 text-sm text-center text-gray-600 font-medium">
                              {entry.won || entry.w || '-'}
                            </td>
                            <td className="py-4 px-4 text-sm text-center text-gray-600 font-medium">
                              {entry.drawn || entry.d || '-'}
                            </td>
                            <td className="py-4 px-4 text-sm text-center text-gray-600 font-medium">
                              {entry.lost || entry.l || '-'}
                            </td>
                            <td className="py-4 px-4 text-sm text-center text-gray-600 font-medium">
                              {entry.goalDifference !== undefined ? entry.goalDifference : (entry.gd !== undefined ? entry.gd : '-')}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`text-sm font-bold text-center block ${
                                isTopThree ? 'text-orange-600' : 'text-gray-900'
                              }`}>
                                {entry.points || entry.pts || '-'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-600">
                  <BarChart3 size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">Table data format not recognized</p>
                  <p className="text-sm mt-2">The API returned data in an unexpected format</p>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <EmptyState
            title="No table data"
            description="Enter a league code and click 'Load Table' to view standings, or switch to 'Leagues' view to select a league"
          />
        )
      ) : null}

      {/* Match Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedMatch(null)
        }}
        title={selectedMatch ? `${selectedMatch.home || selectedMatch.teams?.home?.name || 'Home'} vs ${selectedMatch.away || selectedMatch.teams?.away?.name || 'Away'}` : 'Match Details'}
      >
        {loadingMatch ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        ) : selectedMatch ? (
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedMatch.home || selectedMatch.teams?.home?.name || 'Home'} vs {selectedMatch.away || selectedMatch.teams?.away?.name || 'Away'}
                  </h3>
                  <p className="text-gray-600">{selectedMatch.league || selectedMatch.category}</p>
                </div>
                {selectedMatch.score && (
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {selectedMatch.score.home ?? '-'}
                    </span>
                    <span className="text-gray-500 text-xl">vs</span>
                    <span className="text-4xl font-bold text-gray-900">
                      {selectedMatch.score.away ?? '-'}
                    </span>
                  </div>
                )}
              </div>
              {selectedMatch.status && (
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Status:</span> {selectedMatch.status}
                </p>
              )}
              {selectedMatch.date && (
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Date:</span> {formatMatchDate(selectedMatch.date)}
                </p>
              )}
            </div>

            {/* Stream Embed */}
            {selectedMatch.embed || selectedMatch.stream ? (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Play size={20} className="text-orange-600" />
                  Live Stream
                </h4>
                <div className="bg-black rounded-lg overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>
                  {selectedMatch.embed ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: selectedMatch.embed }}
                      className="w-full h-full"
                    />
                  ) : selectedMatch.stream ? (
                    <iframe
                      src={selectedMatch.stream}
                      className="w-full h-full"
                      allowFullScreen
                      title="Match Stream"
                    />
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle size={20} />
                  <p className="text-sm font-medium">Stream not available for this match</p>
                </div>
              </div>
            )}

            {/* Lineups */}
            {selectedMatch.lineups && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedMatch.lineups.home && (
                  <div className="bg-gradient-to-br from-gray-50 to-orange-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      {selectedMatch.home || selectedMatch.teams?.home?.name || 'Home'} Lineup
                    </h4>
                    <ul className="space-y-2">
                      {Array.isArray(selectedMatch.lineups.home) ? (
                        selectedMatch.lineups.home.map((player: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                            <span className="w-6 h-6 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </span>
                            {player}
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-gray-700">{selectedMatch.lineups.home}</li>
                      )}
                    </ul>
                  </div>
                )}
                {selectedMatch.lineups.away && (
                  <div className="bg-gradient-to-br from-gray-50 to-red-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      {selectedMatch.away || selectedMatch.teams?.away?.name || 'Away'} Lineup
                    </h4>
                    <ul className="space-y-2">
                      {Array.isArray(selectedMatch.lineups.away) ? (
                        selectedMatch.lineups.away.map((player: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                            <span className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </span>
                            {player}
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-gray-700">{selectedMatch.lineups.away}</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
