import { useState, useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import AppRoutes from './routes'
import { MarketDataProvider } from './context/MarketDataContext'
import './App.css'

function App() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <BrowserRouter>
      <MarketDataProvider>
        <div className="flex min-h-screen bg-white dark:bg-[#111111] transition-colors duration-200">
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0">
            <Header isDark={isDark} onToggleDark={() => setIsDark(prev => !prev)} />
            <div className="p-6 overflow-y-auto">
              <AppRoutes isDark={isDark} />
            </div>
          </main>
        </div>
      </MarketDataProvider>
    </BrowserRouter>
  )
}

export default App
