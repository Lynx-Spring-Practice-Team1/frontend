import { Search, Sun, Moon, UserCircle } from 'lucide-react';

export default function Header({ isDark, onToggleDark }) {
  return (
    <header className="flex items-center justify-between w-full px-6 py-2 bg-[#f9f9f9] dark:bg-[#1a1a1a] border-b border-gray-300 dark:border-gray-700 font-mono transition-colors duration-200">

      {/* Left: Logo and Search */}
      <div className="flex items-center gap-8 flex-1">
        <h1 className="text-xl font-black italic tracking-tighter text-gray-800 dark:text-gray-100 select-none">
          Wall Street
        </h1>

        <div className="relative w-full max-w-md">
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

      {/* Right: Market Status & Toggle & User */}
      <div className="flex items-center gap-4">

        {/* Dark mode toggle */}
        <button
          onClick={onToggleDark}
          className="h-9 w-9 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#34a853] shadow-[0_0_8px_rgba(52,168,83,0.5)]"></div>
        </div>
        {/* Profile Placeholder */}
        <button
          className="h-9 w-9 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          // onClick={togleSignOut}
        >
          <UserCircle size={20} />
        </button>
      </div>

    </header>
  );
}
