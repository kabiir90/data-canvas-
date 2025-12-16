import { createContext, useContext, useState, ReactNode } from 'react'
import { STORAGE_KEYS } from '../utils/constants'
import { getStorageItem, setStorageItem } from '../utils/helpers'

interface SessionContextType {
  jokeShown: boolean
  setJokeShown: (shown: boolean) => void
  lastSearchedCountry: string | null
  setLastSearchedCountry: (country: string | null) => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [jokeShown, setJokeShownState] = useState(() =>
    getStorageItem<boolean>(STORAGE_KEYS.JOKE_SHOWN, false)
  )
  const [lastSearchedCountry, setLastSearchedCountryState] = useState<string | null>(() =>
    getStorageItem<string | null>(STORAGE_KEYS.LAST_COUNTRY, null)
  )

  const setJokeShown = (shown: boolean) => {
    setJokeShownState(shown)
    setStorageItem(STORAGE_KEYS.JOKE_SHOWN, shown)
  }

  const setLastSearchedCountry = (country: string | null) => {
    setLastSearchedCountryState(country)
    setStorageItem(STORAGE_KEYS.LAST_COUNTRY, country)
  }

  return (
    <SessionContext.Provider
      value={{
        jokeShown,
        setJokeShown,
        lastSearchedCountry,
        setLastSearchedCountry,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}


