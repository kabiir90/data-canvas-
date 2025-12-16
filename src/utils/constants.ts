export const API_ENDPOINTS = {
  COUNTRIES: 'https://restcountries.com/v3.1',
  WEATHER: 'https://api.openweathermap.org/data/2.5',
  NEWS: 'https://newsapi.org/v2',
  CRYPTO: 'https://api.coingecko.com/api/v3',
  IMAGES: 'https://api.unsplash.com',
  JOKES: 'https://v2.jokeapi.dev/joke',
} as const

export const STORAGE_KEYS = {
  FAVORITES: 'opendata_favorites',
  LAST_COUNTRY: 'opendata_last_country',
  THEME: 'opendata_theme',
  JOKE_SHOWN: 'opendata_joke_shown',
} as const

export const REGIONS = [
  'All',
  'Africa',
  'Americas',
  'Asia',
  'Europe',
  'Oceania',
] as const


