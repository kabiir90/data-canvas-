export interface Country {
  name: {
    common: string
    official: string
    nativeName?: {
      [key: string]: {
        common: string
        official: string
      }
    }
  }
  capital: string[]
  population: number
  region: string
  subregion?: string
  flags: {
    png: string
    svg: string
    alt?: string
  }
  cca2: string
  cca3: string
  languages?: {
    [key: string]: string
  }
  currencies?: {
    [key: string]: {
      name: string
      symbol: string
    }
  }
  area?: number
  timezones?: string[]
  continents?: string[]
}

export interface Weather {
  main: {
    temp: number
    feels_like: number
    humidity: number
  }
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
  wind: {
    speed: number
  }
  name: string
  sys?: {
    country?: string
  }
}

export interface NewsArticle {
  title: string
  description: string
  url: string
  urlToImage?: string
  publishedAt: string
  source: {
    name: string
  }
  author?: string
}

export interface CryptoCurrency {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  market_cap_rank: number
}

export interface Favorite {
  id: string
  type: 'country' | 'news' | 'crypto' | 'sports'
  data: any
  addedAt: string
}

export interface SportCategory {
  id: string
  name: string
  slug: string
}

export interface Match {
  id: string
  home: string
  away: string
  league: string
  category: string
  date?: string
  time?: string
  status?: string
  score?: {
    home?: number
    away?: number
  }
}

export interface MatchDetail {
  id: string
  home: string
  away: string
  league: string
  category: string
  date?: string
  time?: string
  status?: string
  score?: {
    home?: number
    away?: number
  }
  stream?: string
  embed?: string
  lineups?: {
    home?: string[]
    away?: string[]
  }
}

export interface League {
  id: string
  name: string
  country?: string
  logo?: string
}

export interface TableEntry {
  position: number
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export interface LeagueTable {
  league: string
  season?: string
  table: TableEntry[]
}

