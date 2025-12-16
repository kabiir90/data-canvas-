import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Favorite } from '../types'
import { STORAGE_KEYS } from '../utils/constants'
import { getStorageItem, setStorageItem } from '../utils/helpers'

interface FavoritesContextType {
  favorites: Favorite[]
  addFavorite: (favorite: Omit<Favorite, 'addedAt'>) => void
  removeFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  getFavoritesByType: (type: Favorite['type']) => Favorite[]
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Favorite[]>(() =>
    getStorageItem<Favorite[]>(STORAGE_KEYS.FAVORITES, [])
  )

  useEffect(() => {
    setStorageItem(STORAGE_KEYS.FAVORITES, favorites)
  }, [favorites])

  const addFavorite = (favorite: Omit<Favorite, 'addedAt'>) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === favorite.id)) return prev
      return [...prev, { ...favorite, addedAt: new Date().toISOString() }]
    })
  }

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id))
  }

  const isFavorite = (id: string) => {
    return favorites.some((f) => f.id === id)
  }

  const getFavoritesByType = (type: Favorite['type']) => {
    return favorites.filter((f) => f.type === type)
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        getFavoritesByType,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}


