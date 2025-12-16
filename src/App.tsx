import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import CountryExplorer from './pages/CountryExplorer'
import News from './pages/News'
import Crypto from './pages/Crypto'
import Fun from './pages/Fun'
import TechStack from './pages/TechStack'
import Favorites from './pages/Favorites'
import Images from './pages/Images'
import Weather from './pages/Weather'
import Sports from './pages/Sports'
import { FavoritesProvider } from './context/FavoritesContext'
import { SessionProvider } from './context/SessionContext'

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <SessionProvider>
        <FavoritesProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/countries" element={<CountryExplorer />} />
              <Route path="/news" element={<News />} />
              <Route path="/crypto" element={<Crypto />} />
              <Route path="/images" element={<Images />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/sports" element={<Sports />} />
              <Route path="/fun" element={<Fun />} />
              <Route path="/tech-stack" element={<TechStack />} />
              <Route path="/favorites" element={<Favorites />} />
            </Routes>
          </Layout>
        </FavoritesProvider>
      </SessionProvider>
    </Router>
  )
}

export default App

