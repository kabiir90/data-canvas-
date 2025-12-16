import { Code, Layers, Zap, Shield } from 'lucide-react'
import Card from '../components/Card'

export default function TechStack() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-xl">
          <Code className="text-white" size={48} />
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
          Tech Stack & Architecture
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full mb-4"></div>
        <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
          A deep dive into the technical decisions and architecture behind OpenData Canvas
        </p>
      </div>

      <section className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Architecture Overview</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full"></div>
        </div>
        <Card className="p-8 md:p-12 bg-gradient-to-br from-white to-indigo-50/20 border-2 shadow-xl">
          <div className="space-y-8">
            <p className="text-lg text-gray-700 leading-relaxed text-center font-light">
              OpenData Canvas is built with a clean, scalable architecture that separates concerns
              and promotes maintainability. The application follows React best practices with a
              component-based structure, custom hooks for reusable logic, and context providers
              for global state management.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-6 p-6 bg-white rounded-2xl shadow-lg border-2 border-indigo-100 hover:border-indigo-300 transition-all duration-300 group">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Layers size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Presentation Layer</h3>
                  <p className="text-gray-600 leading-relaxed">React components, pages, and UI elements</p>
                </div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full text-white text-xl font-bold shadow-lg">
                  ↓
                </div>
              </div>
              <div className="flex items-start gap-6 p-6 bg-white rounded-2xl shadow-lg border-2 border-indigo-100 hover:border-indigo-300 transition-all duration-300 group">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Zap size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Logic Layer</h3>
                  <p className="text-gray-600 leading-relaxed">Custom hooks, context providers, and utilities</p>
                </div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full text-white text-xl font-bold shadow-lg">
                  ↓
                </div>
              </div>
              <div className="flex items-start gap-6 p-6 bg-white rounded-2xl shadow-lg border-2 border-indigo-100 hover:border-indigo-300 transition-all duration-300 group">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Shield size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Service Layer</h3>
                  <p className="text-gray-600 leading-relaxed">API services, data fetching, and error handling</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Technology Stack</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <Card className="group transition-all duration-300 hover:shadow-xl border-2 hover:border-indigo-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg"></div>
              Frontend Framework
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2"><span className="text-indigo-600 font-bold">•</span><span><strong className="text-gray-900">React 18</strong> - Modern UI library with hooks</span></li>
              <li className="flex items-start gap-2"><span className="text-indigo-600 font-bold">•</span><span><strong className="text-gray-900">TypeScript</strong> - Type-safe development</span></li>
              <li className="flex items-start gap-2"><span className="text-indigo-600 font-bold">•</span><span><strong className="text-gray-900">Vite</strong> - Fast build tool and dev server</span></li>
              <li className="flex items-start gap-2"><span className="text-indigo-600 font-bold">•</span><span><strong className="text-gray-900">React Router</strong> - Client-side routing</span></li>
            </ul>
          </Card>
          <Card className="group transition-all duration-300 hover:shadow-xl border-2 hover:border-purple-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg"></div>
              Styling
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2"><span className="text-purple-600 font-bold">•</span><span><strong className="text-gray-900">Tailwind CSS</strong> - Utility-first CSS framework</span></li>
              <li className="flex items-start gap-2"><span className="text-purple-600 font-bold">•</span><span><strong className="text-gray-900">CSS Variables</strong> - Consistent design tokens</span></li>
              <li className="flex items-start gap-2"><span className="text-purple-600 font-bold">•</span><span><strong className="text-gray-900">Inter Font</strong> - Professional typography</span></li>
            </ul>
          </Card>
          <Card className="group transition-all duration-300 hover:shadow-xl border-2 hover:border-yellow-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg"></div>
              State Management
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2"><span className="text-yellow-600 font-bold">•</span><span><strong className="text-gray-900">React Context</strong> - Global state (favorites, session)</span></li>
              <li className="flex items-start gap-2"><span className="text-yellow-600 font-bold">•</span><span><strong className="text-gray-900">Local Storage</strong> - Persistent user preferences</span></li>
              <li className="flex items-start gap-2"><span className="text-yellow-600 font-bold">•</span><span><strong className="text-gray-900">Custom Hooks</strong> - Reusable state logic</span></li>
            </ul>
          </Card>
          <Card className="group transition-all duration-300 hover:shadow-xl border-2 hover:border-green-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg"></div>
              APIs Integrated
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2"><span className="text-green-600 font-bold">•</span><span><strong className="text-gray-900">REST Countries</strong> - Country data</span></li>
              <li className="flex items-start gap-2"><span className="text-green-600 font-bold">•</span><span><strong className="text-gray-900">OpenWeatherMap</strong> - Weather information</span></li>
              <li className="flex items-start gap-2"><span className="text-green-600 font-bold">•</span><span><strong className="text-gray-900">News API</strong> - Global news headlines</span></li>
              <li className="flex items-start gap-2"><span className="text-green-600 font-bold">•</span><span><strong className="text-gray-900">CoinGecko</strong> - Cryptocurrency data</span></li>
              <li className="flex items-start gap-2"><span className="text-green-600 font-bold">•</span><span><strong className="text-gray-900">Unsplash</strong> - Contextual images</span></li>
              <li className="flex items-start gap-2"><span className="text-green-600 font-bold">•</span><span><strong className="text-gray-900">Joke API</strong> - Light engagement</span></li>
            </ul>
          </Card>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Design Decisions</h2>
        <Card>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Professional Design</h3>
              <p className="text-gray-600 leading-relaxed">
                Clean, minimal interface that prioritizes data clarity and user efficiency. The design
                reduces visual noise and helps users focus on the information they need.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Performance Optimization</h3>
              <p className="text-gray-600 leading-relaxed">
                Debounced search, lazy loading, API caching, and minimal re-renders ensure a
                smooth user experience even with large datasets.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Accessibility</h3>
              <p className="text-gray-600 leading-relaxed">
                Keyboard navigation, ARIA labels, semantic HTML, and WCAG-compliant color contrast
                make the application usable for everyone.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Handling</h3>
              <p className="text-gray-600 leading-relaxed">
                Graceful fallbacks, user-friendly error messages, and retry mechanisms ensure
                the application remains functional even when APIs fail.
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Folder Structure</h2>
        <Card>
          <pre className="p-4 bg-gray-50 rounded-lg overflow-x-auto text-sm text-gray-800 font-mono">
{`src/
├── components/       # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── SearchBar.tsx
│   └── ...
├── pages/           # Page components
│   ├── Landing.tsx
│   ├── CountryExplorer.tsx
│   └── ...
├── services/        # API service layer
│   ├── countriesService.ts
│   ├── weatherService.ts
│   └── ...
├── hooks/           # Custom React hooks
│   ├── useSearch.ts
│   └── useDebounce.ts
├── context/         # Context providers
│   ├── FavoritesContext.tsx
│   └── SessionContext.tsx
├── utils/           # Utility functions
│   ├── constants.ts
│   └── helpers.ts
└── types/           # TypeScript types
    └── index.ts`}
          </pre>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Global Search</h3>
            <p className="text-gray-600 leading-relaxed">
              Debounced, context-aware search that adapts to each page. Includes keyboard
              accessibility and clear empty states.
            </p>
          </Card>
          <Card>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Favorites System</h3>
            <p className="text-gray-600 leading-relaxed">
              Persistent favorites stored in localStorage. Users can bookmark countries, news
              articles, and cryptocurrencies.
            </p>
          </Card>
          <Card>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Session Awareness</h3>
            <p className="text-gray-600 leading-relaxed">
              Human-friendly behavior like showing jokes once per session and remembering last
              searched items.
            </p>
          </Card>
          <Card>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Responsive Design</h3>
            <p className="text-gray-600 leading-relaxed">
              Mobile-first approach with breakpoints that ensure the application works beautifully
              on all device sizes.
            </p>
          </Card>
        </div>
      </section>
    </div>
  )
}

