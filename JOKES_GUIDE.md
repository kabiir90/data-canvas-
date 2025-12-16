# Jokes API Guide - How It Works

## Overview

The Fun Corner page uses **12 different joke APIs** to provide variety and ensure jokes are always available. The system automatically tries multiple sources until it finds one that works.

## Available Joke Sources

### 1. **JokeAPI** (v2.jokeapi.dev)
- **Categories**: Any, Programming, Miscellaneous, Pun
- **Types**: Single-line jokes and two-part jokes (setup + delivery)
- **No API key required**
- **Example**: `https://v2.jokeapi.dev/joke/Any?safe-mode&type=single,twopart`

### 2. **Official Joke API** (official-joke-api.appspot.com)
- **Types**: General jokes and Programming jokes
- **Format**: Two-part (setup + punchline)
- **No API key required**
- **Example**: `https://official-joke-api.appspot.com/jokes/random`

### 3. **icanhazdadjoke** (icanhazdadjoke.com)
- **Type**: Dad jokes (single-line)
- **Requires**: Header `Accept: application/json`
- **No API key required**
- **Example**: `https://icanhazdadjoke.com/`

### 4. **Chuck Norris API** (api.chucknorris.io)
- **Type**: Chuck Norris facts/jokes (single-line)
- **No API key required**
- **Example**: `https://api.chucknorris.io/jokes/random`

### 5. **Geek Jokes** (geek-jokes.sameerkumar.website)
- **Type**: Programmer/geek jokes (single-line)
- **Format**: JSON or text
- **No API key required**
- **Example**: `https://geek-jokes.sameerkumar.website/api?format=json`

### 6. **Yo Momma API** (api.yomomma.info)
- **Type**: Yo momma jokes (single-line)
- **No API key required**
- **Example**: `https://api.yomomma.info/`

### 7. **Programming Jokes** (official-joke-api.appspot.com)
- **Type**: Programming-specific jokes (two-part)
- **No API key required**
- **Example**: `https://official-joke-api.appspot.com/jokes/programming/random`

### 8. **One-Liner Jokes** (one-liner-jokes.herokuapp.com)
- **Type**: Quick one-liner jokes
- **No API key required**
- **Example**: `https://one-liner-jokes.herokuapp.com/jokes/random`

### 9. **Quotable** (api.quotable.io)
- **Type**: Funny quotes with authors
- **No API key required**
- **Example**: `https://api.quotable.io/random?tags=funny`

## How It Works

### 1. **Random Source Selection**
```typescript
// The system shuffles all joke sources randomly
const shuffled = [...jokeSources].sort(() => Math.random() - 0.5)

// Tries each source until one works
for (const getJoke of shuffled) {
  const joke = await getJoke()
  if (joke) return joke
}
```

### 2. **Joke Data Structure**
```typescript
interface Joke {
  category: string          // e.g., "Programming", "Dad Joke"
  type: 'single' | 'twopart'  // Single line or setup/delivery
  joke?: string            // For single-line jokes
  setup?: string           // For two-part jokes
  delivery?: string        // For two-part jokes (punchline)
  id?: number | string     // Unique identifier
  source: string           // Which API provided it
}
```

### 3. **Using the Fun Corner Page**

#### Adding Jokes
- Click **"Add Joke"** button to fetch a new joke from a random source
- Each click adds a new joke to your list
- Jokes are added to the top of the list

#### Managing Jokes
- **Remove Individual Joke**: Click the X button on any joke card
- **Clear All Jokes**: Click "Clear All" button to remove all jokes
- **View List**: All jokes are displayed in a scrollable list

### 4. **Error Handling**
- If one API fails, the system automatically tries the next one
- If all APIs fail, an error message is shown with a retry option
- Empty states guide users to add their first joke

## Code Examples

### Fetching a Random Joke
```typescript
import { getRandomJoke } from './services/jokeService'

const joke = await getRandomJoke()
if (joke) {
  console.log(joke.category)  // "Programming"
  console.log(joke.source)     // "JokeAPI"
  if (joke.type === 'single') {
    console.log(joke.joke)     // Single-line joke
  } else {
    console.log(joke.setup)    // Setup
    console.log(joke.delivery) // Punchline
  }
}
```

### Using Specific Joke Sources
```typescript
// You can also call specific sources directly
import { getJokeAPIJoke, getDadJoke } from './services/jokeService'

// Get a programming joke from JokeAPI
const programmingJoke = await getJokeAPIJoke('Programming')

// Get a dad joke
const dadJoke = await getDadJoke()
```

## Features

✅ **12 Different Sources** - Variety and reliability  
✅ **Automatic Fallback** - If one fails, tries another  
✅ **List View** - See multiple jokes at once  
✅ **Add/Remove** - Build your own joke collection  
✅ **Source Attribution** - See which API provided each joke  
✅ **Category Tags** - Know what type of joke it is  
✅ **No API Keys** - All sources are free and open  

## Tips

1. **Click "Add Joke" multiple times** to build a collection
2. **Remove jokes you don't like** to keep your list clean
3. **Each joke shows its source** so you know where it came from
4. **Categories help** identify joke types (Programming, Dad Joke, etc.)
5. **The system automatically retries** if an API is temporarily down

Enjoy your jokes! 😄


