import { useState, useRef, useEffect } from 'react';
import { Menu, Search, Sun, Moon, UserCircle, LogOut, AreaChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header({ isDark, onToggleDark, onOpenMobileMenu }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSignOut() {
    sessionStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between w-full px-4 sm:px-6 py-2 bg-[#f0f0f0] dark:bg-[#252525] border-b border-gray-300 dark:border-gray-700 font-mono transition-colors duration-200">

      {/* Left: hamburger (mobile) / brand (desktop) + search */}
      <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">

        {/* Hamburger — mobile only */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden h-9 w-9 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        {/* Brand — desktop only */}
        <h1 className="hidden lg:block text-xl font-black italic tracking-tighter text-gray-800 dark:text-gray-100 select-none shrink-0">
          Wall Street
        </h1>

        <div className="relative w-full max-w-md min-w-0">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            size={16}
          />
          <input
            type="text"
            placeholder="Search for tickers..."
            className="w-full pl-10 pr-4 py-1.5 bg-transparent border border-gray-800 dark:border-gray-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-gray-400 placeholder:text-gray-400 dark:placeholder:text-gray-600 text-sm text-gray-800 dark:text-gray-200 transition-all"
          />
        </div>
      </div>

      {/* Right: dark toggle, profile */}
      <div className="flex items-center gap-2 sm:gap-4 ml-3">
        <button
          onClick={onToggleDark}
          className="h-9 w-9 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            aria-label="User profile"
            onClick={() => setProfileOpen(o => !o)}
            className="relative h-9 w-9 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <UserCircle size={20} />
            <div className="h-2 w-2 rounded-full bg-[#34a853] shadow-[0_0_8px_rgba(52,168,83,0.5)] absolute bottom-0 right-0" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-30 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e] shadow-lg overflow-hidden z-50">
       
               <button
                className="w-full flex justify-between items-center gap-2 px-4 py-2.5 text-xs font-mono text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <UserCircle size={13} />
                <a href="/account">Account</a>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full flex justify-between items-center gap-2 px-4 py-2.5 text-xs font-mono text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <LogOut size={11} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}
