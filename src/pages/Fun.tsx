import { useState, useEffect } from 'react'
import { Smile, X, RefreshCw, Plus, Trash2 } from 'lucide-react'
import { getRandomJoke, Joke } from '../services/jokeService'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorState from '../components/ErrorState'

export default function Fun() {
  const [jokes, setJokes] = useState<Joke[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load initial joke when page loads
    loadJoke()
  }, [])

  const loadJoke = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getRandomJoke()
      if (data) {
        // Add new joke to the list
        setJokes((prev) => [data, ...prev])
      } else {
        setError('Failed to load joke. Please try again!')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load joke')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveJoke = (jokeId: string | number | undefined) => {
    if (jokeId === undefined) return
    setJokes((prev) => prev.filter((j) => j.id !== jokeId))
  }

  const handleClearAll = () => {
    setJokes([])
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-6 shadow-xl">
          <Smile className="text-white" size={48} />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
          Fun Corner
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 mx-auto rounded-full mb-4"></div>
        <p className="text-xl text-gray-600 font-light">
          A light moment to brighten your day
        </p>
        <div className="flex justify-center items-center gap-4 mt-8 flex-wrap">
          <Button
            onClick={loadJoke}
            variant="primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                Loading...
              </>
            ) : (
              <>
                <Plus size={18} />
                Add Joke
              </>
            )}
          </Button>
          {jokes.length > 0 && (
            <Button
              onClick={handleClearAll}
              variant="outline"
              size="sm"
            >
              <Trash2 size={16} />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {error && (
        <ErrorState message={error} onRetry={loadJoke} />
      )}

      {jokes.length === 0 && !loading && !error && (
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="flex flex-col items-center gap-4 py-8">
              <Smile size={32} className="text-gray-400" />
              <p className="text-gray-600">No jokes yet. Click "Add Joke" to get started!</p>
            </div>
          </Card>
        </div>
      )}

      {jokes.length > 0 && (
        <div className="space-y-6">
          {jokes.map((joke, index) => (
            <Card key={`joke-${joke.id || index}-${joke.source || 'unknown'}-${index}`} className="group transition-all duration-300 hover:shadow-xl border-2 hover:border-yellow-300 bg-gradient-to-br from-white to-yellow-50/30">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-yellow-700 uppercase tracking-wide px-3 py-1.5 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full border border-yellow-200">
                      {joke.category}
                    </span>
                    <span className="text-xs text-gray-500 italic">via {joke.source}</span>
                  </div>
                  <button
                    className="bg-transparent border-none cursor-pointer text-gray-400 p-2 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-red-50 hover:text-red-500"
                    onClick={() => handleRemoveJoke(joke.id)}
                    aria-label="Remove joke"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="text-xl leading-relaxed text-gray-800 font-light">
                  {joke.type === 'single' ? (
                    <p className="italic">{joke.joke}</p>
                  ) : (
                    <>
                      <p className="mb-4 font-semibold text-gray-900">{joke.setup}</p>
                      <p className="italic text-gray-600 text-lg">{joke.delivery}</p>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {loading && jokes.length === 0 && (
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="flex flex-col items-center gap-4 py-8 text-gray-600">
              <LoadingSpinner size="lg" />
              <p>Loading a joke for you...</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

