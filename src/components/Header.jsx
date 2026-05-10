import { Menu, Search, Sun, Moon, UserCircle } from 'lucide-react';

export default function Header({ isDark, onToggleDark, onOpenMobileMenu }) {
  return (
    <header className="flex items-center justify-between w-full px-4 sm:px-6 py-2 bg-[#f0f0f0] dark:bg-[#252525] border-b border-gray-300 dark:border-gray-700 font-mono transition-colors duration-200">

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

      {/* Right: status indicator, dark toggle, profile */}
      <div className="flex items-center gap-2 sm:gap-4 ml-3">
        <button
          onClick={onToggleDark}
          className="h-9 w-9 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>


        <button
          className="relative h-9 w-9 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <UserCircle size={20} />
          <div className="h-2 w-2 rounded-full bg-[#34a853] shadow-[0_0_8px_rgba(52,168,83,0.5)] absolute bottom-0 right-0" />
        </button>
      </div>

    </header>
  );
}
