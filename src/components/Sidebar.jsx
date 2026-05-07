import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  ArrowLeftRight,
  Star,
  PieChart,
  ClipboardList,
  Search,
  UserCircle,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { name: 'Dashboard', icon: Home,          path: '/'          },
  { name: 'Trade',     icon: ArrowLeftRight, path: '/trade'     },
  { name: 'Watchlist', icon: Star,           path: '/watchlist' },
  { name: 'Portfolio', icon: PieChart,       path: '/portfolio' },
  { name: 'Orders',    icon: ClipboardList,  path: '/orders'    },
  { name: 'Research',  icon: Search,         path: '/research'  },
  { name: 'Account',   icon: UserCircle,     path: '/account'   },
];

function NavItems({ expanded, onNavigate }) {
  return (
    <nav className="flex-1 space-y-2">
      {menuItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          onClick={onNavigate}
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
            {expanded && (
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
  );
}

function CashBox({ compact }) {
  return (
    <div className={`p-4 border border-black dark:border-gray-700 rounded-xl bg-[#e0e0e0] dark:bg-[#222222] transition-all ${compact ? 'px-2 py-4' : ''}`}>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 italic font-bold">Cash</p>
      <p className={`font-bold text-gray-800 dark:text-gray-100 ${compact ? 'text-[10px]' : 'text-lg'}`}>
        {compact ? '12.4k' : '$12,480.55'}
      </p>
    </div>
  );
}

function Sidebar({ mobileOpen = false, onCloseMobile }) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:flex h-screen sticky top-0">
        <motion.aside
          initial={false}
          animate={{ width: isOpen ? 240 : 80 }}
          className="bg-[#ebebeb] dark:bg-[#161616] border-r border-black dark:border-gray-700 flex flex-col p-4 transition-colors duration-200 overflow-hidden"
        >
          <div
            className="flex items-center gap-3 mb-8 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setIsOpen(!isOpen)}
          >
            <img
              src="../src/assets/t1b.png"
              alt="Logo"
              className="h-8 w-8 rounded-full bg-[#d9774a] border border-black dark:border-gray-600 shrink-0"
            />
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

          <NavItems expanded={isOpen} onNavigate={undefined} />

          <div className="mt-auto">
            <CashBox compact={!isOpen} />
          </div>
        </motion.aside>
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={onCloseMobile}
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="fixed left-0 top-0 h-full w-64 z-50 bg-[#ebebeb] dark:bg-[#161616] border-r border-black dark:border-gray-700 flex flex-col p-4 lg:hidden"
            >
              {/* Drawer header: logo + close */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <img
                    src="../src/assets/t1b.png"
                    alt="Logo"
                    className="h-8 w-8 rounded-full bg-[#d9774a] border border-black dark:border-gray-600 shrink-0"
                  />
                  <span className="font-black italic text-xl tracking-tighter text-gray-900 dark:text-gray-100">
                    Broker
                  </span>
                </div>
                <button
                  onClick={onCloseMobile}
                  className="h-8 w-8 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <NavItems expanded={true} onNavigate={onCloseMobile} />

              <div className="mt-auto">
                <CashBox compact={false} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
