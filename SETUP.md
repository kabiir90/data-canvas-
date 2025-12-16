# OpenData Canvas - Setup Guide

## API Keys Configuration

Create a `.env` file in the root directory with the following content:

```env
# OpenData Canvas API Keys

# OpenWeatherMap API Key
VITE_WEATHER_API_KEY=23a065e9afceb79282b3e04c4172807e

# News API Key
VITE_NEWS_API_KEY=ef266907b4ec4c31aeb24258b2252462

# Unsplash Access Key (client_id)
VITE_UNSPLASH_API_KEY=wXm0ZR-qar5TJspT_pEf1gKCH-acijiXEFQl2MytxXo

# Note: CoinGecko and Joke API do not require API keys
```

## APIs Used

### ✅ APIs with Keys (configured in .env)
1. **OpenWeatherMap** - Weather data for capital cities
   - Key: `VITE_WEATHER_API_KEY`
   - Endpoint: `https://api.openweathermap.org/data/2.5`

2. **News API** - Global news headlines
   - Key: `VITE_NEWS_API_KEY`
   - Endpoint: `https://newsapi.org/v2`

3. **Unsplash** - Contextual images
   - Key: `VITE_UNSPLASH_API_KEY` (Access Key used as client_id)
   - Endpoint: `https://api.unsplash.com`

### ✅ APIs without Keys (work directly)
1. **REST Countries** - Country data
   - Endpoint: `https://restcountries.com/v3.1`
   - No API key required

2. **CoinGecko** - Cryptocurrency data
   - Endpoint: `https://api.coingecko.com/api/v3`
   - No API key required
   - Examples:
     - Market Data: `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1`
     - Simple Price: `/simple/price?ids=bitcoin,ethereum&vs_currencies=usd`

3. **Joke API** - Random jokes
   - Endpoint: `https://v2.jokeapi.dev/joke`
   - No API key required
   - Example: `/Any?safe-mode&type=single,twopart`

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file** (copy the content above)

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Verification

All API services are configured and ready to use:

- ✅ Weather Service - Uses OpenWeatherMap API key
- ✅ News Service - Uses News API key  
- ✅ Image Service - Uses Unsplash Access Key
- ✅ Crypto Service - No key needed (CoinGecko)
- ✅ Joke Service - No key needed
- ✅ Countries Service - No key needed (REST Countries)

## Notes

- The Unsplash **Secret Key** is for server-side use only. The client-side uses the **Access Key** as `client_id`.
- CoinGecko has rate limits but no authentication required for basic usage.
- Joke API is completely free with no rate limits for reasonable use.

