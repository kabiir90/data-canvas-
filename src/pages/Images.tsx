import { useState, useCallback } from 'react'
import { Image as ImageIcon, Search, Download, ExternalLink, Copy, Check } from 'lucide-react'
import { getImagesByQuery, UnsplashImage } from '../services/imageService'
import SearchBar from '../components/SearchBar'
import Card from '../components/Card'
import Button from '../components/Button'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'

export default function Images() {
  const [images, setImages] = useState<UnsplashImage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setImages([])
      setSearchQuery('')
      setError(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSearchQuery(query)

      const results = await getImagesByQuery(query.trim(), 12)

      if (results.length > 0) {
        setImages(results)
      } else {
        setImages([])
        setError('No images found for this query. Try a different search term.')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search images'
      setError(errorMessage)
      setImages([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDownload = useCallback(async (image: UnsplashImage) => {
    try {
      // Use raw URL for highest quality, fallback to full or regular
      const downloadUrl = image.rawUrl || image.fullUrl || image.url
      const description = image.description || 'image'
      
      // Fetch the image as blob
      const response = await fetch(downloadUrl)
      if (!response.ok) throw new Error('Failed to fetch image')
      
      const blob = await response.blob()
      
      // Create a blob URL and download
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `${description.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error('Download error:', err)
      setError('Failed to download image. Please try again.')
    }
  }, [])

  const handleCopyUrl = useCallback(async (image: UnsplashImage) => {
    try {
      // Use raw URL for highest quality, fallback to full or regular
      const urlToCopy = image.rawUrl || image.fullUrl || image.url
      await navigator.clipboard.writeText(urlToCopy)
      setCopiedUrl(image.id)
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedUrl(null)
      }, 2000)
    } catch (err) {
      console.error('Copy error:', err)
      setError('Failed to copy URL. Please try again.')
    }
  }, [])

  const handleOpenInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (error && !loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Image Search</h1>
          <p className="text-lg text-gray-600">
            Search for beautiful images from Unsplash
          </p>
        </div>
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search for images (e.g., nature, cities, animals)..."
          />
        </div>
        <ErrorState message={error} onRetry={() => handleSearch(searchQuery)} />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl mb-6 shadow-xl">
          <ImageIcon className="text-white" size={32} />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">Image Search</h1>
        <div className="w-24 h-1 bg-gradient-to-r from-pink-600 to-rose-600 mx-auto rounded-full mb-4"></div>
        <p className="text-xl text-gray-600 font-light">
          Search for beautiful images from Unsplash
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-8">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search for images (e.g., nature, cities, animals)..."
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <LoadingSpinner />
          <p className="text-lg text-gray-600">Searching for images...</p>
        </div>
      ) : images.length === 0 && !searchQuery ? (
        <EmptyState
          icon={<ImageIcon size={48} />}
          title="Start Your Image Search"
          message="Enter a search term above to find beautiful images from Unsplash"
        />
      ) : images.length === 0 ? (
        <EmptyState
          icon={<Search size={48} />}
          title="No Images Found"
          message={`No images found for "${searchQuery}". Try a different search term.`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 py-4">
          {images.map((image) => (
            <Card key={image.id} className="p-0 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group border-2 hover:border-pink-300 rounded-2xl">
              <div className="relative w-full pt-[75%] bg-gray-50 overflow-hidden">
                <img
                  src={image.url}
                  alt={image.description || 'Unsplash image'}
                  className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    setError('Failed to load image')
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-6 transform translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                  <div className="mb-4">
                    {image.description && (
                      <p className="text-lg font-semibold mb-1 capitalize">{image.description}</p>
                    )}
                    <p className="text-sm text-white/80">
                      Photo by{' '}
                      <a
                        href={image.authorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white underline hover:opacity-80 transition-opacity"
                      >
                        {image.author}
                      </a>{' '}
                      on Unsplash
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenInNewTab(image.rawUrl || image.fullUrl || image.url)}
                        className="flex-1 flex items-center justify-center gap-1 bg-white/95 text-gray-800 border-none hover:bg-white text-xs"
                      >
                        <ExternalLink size={14} />
                        Open
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(image)}
                        className="flex-1 flex items-center justify-center gap-1 bg-white/95 text-gray-800 border-none hover:bg-white text-xs"
                      >
                        <Download size={14} />
                        Download PNG
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyUrl(image)}
                      className="w-full flex items-center justify-center gap-1 bg-white/95 text-gray-800 border-none hover:bg-white text-xs"
                    >
                      {copiedUrl === image.id ? (
                        <>
                          <Check size={14} className="text-green-600" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy URL
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

