import { useState, useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import AppRoutes from './routes'
import { MarketDataProvider } from './context/MarketDataContext'
import './App.css'

function App() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <BrowserRouter>
      <MarketDataProvider>
        <div className="flex min-h-screen bg-[#f5f5f5] dark:bg-[#111111] transition-colors duration-200">
          <Sidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />
          <main className="flex-1 flex flex-col min-w-0">
            <Header
              isDark={isDark}
              onToggleDark={() => setIsDark(prev => !prev)}
              onOpenMobileMenu={() => setMobileMenuOpen(true)}
            />
            <div className="p-4 sm:p-6 overflow-y-auto">
              <AppRoutes isDark={isDark} />
            </div>
          </main>
        </div>
      </MarketDataProvider>
    </BrowserRouter>
  )
}

export default App
