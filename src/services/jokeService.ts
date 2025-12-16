import { API_ENDPOINTS } from '../utils/constants'
import { getCache, setCache } from '../utils/cache'

export interface Joke {
  category: string
  type: 'single' | 'twopart'
  joke?: string
  setup?: string
  delivery?: string
  id?: number | string
  safe?: boolean
  source: string
}

// JokeAPI (v2.jokeapi.dev)
async function getJokeAPIJoke(category: string = 'Any'): Promise<Joke | null> {
  try {
    const response = await fetch(
      `https://v2.jokeapi.dev/joke/${category}?safe-mode&type=single,twopart`
    )
    if (!response.ok) return null
    const data = await response.json()
    return {
      category: data.category || category,
      type: data.type === 'single' ? 'single' : 'twopart',
      joke: data.joke,
      setup: data.setup,
      delivery: data.delivery,
      id: data.id,
      safe: data.safe,
      source: 'JokeAPI',
    }
  } catch {
    return null
  }
}

// Official Joke API
async function getOfficialJoke(): Promise<Joke | null> {
  try {
    const response = await fetch('https://official-joke-api.appspot.com/jokes/random')
    if (!response.ok) return null
    const data = await response.json()
    return {
      category: data.type || 'General',
      type: 'twopart',
      setup: data.setup,
      delivery: data.punchline,
      id: data.id,
      source: 'Official Joke API',
    }
  } catch {
    return null
  }
}

// icanhazdadjoke - Dad jokes
async function getDadJoke(): Promise<Joke | null> {
  try {
    const response = await fetch('https://icanhazdadjoke.com/', {
      headers: {
        Accept: 'application/json',
      },
    })
    if (!response.ok) return null
    const data = await response.json()
    return {
      category: 'Dad Joke',
      type: 'single',
      joke: data.joke,
      id: data.id,
      source: 'icanhazdadjoke',
    }
  } catch {
    return null
  }
}

// Chuck Norris API
async function getChuckNorrisJoke(): Promise<Joke | null> {
  try {
    const response = await fetch('https://api.chucknorris.io/jokes/random')
    if (!response.ok) return null
    const data = await response.json()
    return {
      category: 'Chuck Norris',
      type: 'single',
      joke: data.value,
      id: data.id,
      source: 'Chuck Norris API',
    }
  } catch {
    return null
  }
}

// Geek Jokes API
async function getGeekJoke(): Promise<Joke | null> {
  try {
    const response = await fetch('https://geek-jokes.sameerkumar.website/api?format=json')
    if (!response.ok) return null
    const data = await response.json()
    return {
      category: 'Geek',
      type: 'single',
      joke: data.joke,
      source: 'Geek Jokes',
    }
  } catch {
    return null
  }
}

// Yo Momma Jokes - Removed due to SSL certificate issues
// async function getYoMommaJoke(): Promise<Joke | null> {
//   try {
//     const response = await fetch('https://api.yomomma.info/')
//     if (!response.ok) return null
//     const data = await response.json()
//     return {
//       category: 'Yo Momma',
//       type: 'single',
//       joke: data.joke,
//       source: 'Yo Momma API',
//     }
//   } catch {
//     return null
//   }
// }

// Programming Jokes
async function getProgrammingJoke(): Promise<Joke | null> {
  try {
    const response = await fetch('https://official-joke-api.appspot.com/jokes/programming/random')
    if (!response.ok) return null
    const data = await response.json()
    return {
      category: 'Programming',
      type: 'twopart',
      setup: data.setup,
      delivery: data.punchline,
      id: data.id,
      source: 'Official Joke API',
    }
  } catch {
    return null
  }
}

// One-liner Jokes
async function getOneLinerJoke(): Promise<Joke | null> {
  try {
    const response = await fetch('https://one-liner-jokes.herokuapp.com/jokes/random')
    if (!response.ok) return null
    const data = await response.json()
    return {
      category: 'One-Liner',
      type: 'single',
      joke: data.joke,
      id: data.id,
      source: 'One-Liner Jokes',
    }
  } catch {
    return null
  }
}

// Random funny quotes
async function getFunnyQuote(): Promise<Joke | null> {
  try {
    const response = await fetch('https://api.quotable.io/random?tags=funny')
    if (!response.ok) return null
    const data = await response.json()
    return {
      category: 'Funny Quote',
      type: 'single',
      joke: `"${data.content}" - ${data.author}`,
      id: data._id,
      source: 'Quotable',
    }
  } catch {
    return null
  }
}

// Array of joke functions
const jokeSources = [
  () => getJokeAPIJoke('Any'),
  () => getJokeAPIJoke('Programming'),
  () => getJokeAPIJoke('Miscellaneous'),
  () => getJokeAPIJoke('Pun'),
  () => getOfficialJoke(),
  () => getDadJoke(),
  () => getChuckNorrisJoke(),
  () => getGeekJoke(),
  // () => getYoMommaJoke(), // Removed due to SSL certificate issues
  () => getProgrammingJoke(),
  () => getOneLinerJoke(),
  () => getFunnyQuote(),
]

export async function getRandomJoke(): Promise<Joke | null> {
  // Check cache first - cache one joke per session (1 hour)
  const cacheKey = 'random-joke'
  const cached = getCache<Joke>('jokes', cacheKey)
  if (cached) {
    return cached
  }

  // Shuffle and try each source until one works
  const shuffled = [...jokeSources].sort(() => Math.random() - 0.5)
  
  for (const getJoke of shuffled) {
    const joke = await getJoke()
    if (joke) {
      setCache('jokes', cacheKey, joke)
      return joke
    }
  }
  
  return null
}

