import React, { useState } from 'react';
import { NavLink } from 'react-router-dom'; 
import {
  Home,
  ArrowLeftRight,
  Star,
  PieChart,
  ClipboardList,
  Search,
  UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/' },
    { name: 'Trade', icon: ArrowLeftRight, path: '/trade' },
    { name: 'Watchlist', icon: Star, path: '/watchlist' },
    { name: 'Portfolio', icon: PieChart, path: '/portfolio' },
    { name: 'Orders', icon: ClipboardList, path: '/orders' },
    { name: 'Research', icon: Search, path: '/research' },
    { name: 'Account', icon: UserCircle, path: '/account' },
  ];

  return (
    <div className="flex h-screen sticky top-0">
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 240 : 80 }}
        className="bg-[#f2f2f2] dark:bg-[#161616] border-r border-black dark:border-gray-700 flex flex-col p-4 transition-colors duration-200 overflow-hidden"
      >
        {/* Header / Toggle Button */}
        <div
          className="flex items-center gap-3 mb-8 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setIsOpen(!isOpen)}
        >
          <img src="../src/assets/t1b.png" alt="Logo" className="h-8 w-8 rounded-full bg-[#d9774a] border border-black dark:border-gray-600 shrink-0" />
          <AnimatePresence>
            {isOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-black italic text-xl tracking-tighter text-gray-900 dark:text-gray-100"
              >
                Broker
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                w-full flex items-center gap-4 p-2 rounded-xl transition-all border
                ${isActive
                  ? 'bg-[#ebdbd3] dark:bg-[#3d2e26] border-[#d9774a] text-black dark:text-gray-100 font-bold'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                }
              `}
            >
              <item.icon size={20} className="shrink-0" />
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="italic text-sm whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* Cash Balance Box */}
        <div className="mt-auto">
          <div className={`p-4 border border-black dark:border-gray-700 rounded-xl bg-[#f9f9f9] dark:bg-[#222222] transition-all ${!isOpen && 'px-2 py-4'}`}>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 italic font-bold">Cash</p>
            <p className={`font-bold text-gray-800 dark:text-gray-100 ${isOpen ? 'text-lg' : 'text-[10px]'}`}>
              {isOpen ? '$12,480.55' : '12.4k'}
            </p>
          </div>
        </div>
      </motion.aside>
    </div>
  );
}

export default Sidebar;