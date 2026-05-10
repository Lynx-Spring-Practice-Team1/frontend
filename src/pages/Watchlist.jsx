import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, ComposedChart, Area, AreaChart } from 'recharts';

const WATCHLIST_DATA = {
  AAPL: {
    exchange: 'NASDAQ',
    price: 184.32,
    change: 0.8,
    data: [
      { time: '09:30', close: 182.5 },
      { time: '10:00', close: 183.2 },
      { time: '10:30', close: 182.8 },
      { time: '11:00', close: 184.1 },
      { time: '11:30', close: 183.9 },
      { time: '12:00', close: 184.5 },
      { time: '12:30', close: 184.32 },
    ],
    category: 'Tech'
  },
  NVDA: {
    exchange: 'NASDAQ',
    price: 891.10,
    change: 4.2,
    data: [
      { time: '09:30', close: 854.2 },
      { time: '10:00', close: 860.5 },
      { time: '10:30', close: 870.1 },
      { time: '11:00', close: 875.3 },
      { time: '11:30', close: 880.8 },
      { time: '12:00', close: 888.5 },
      { time: '12:30', close: 891.10 },
    ],
    category: 'Tech'
  },
  TSLA: {
    exchange: 'NASDAQ',
    price: 246.55,
    change: -1.1,
    data: [
      { time: '09:30', close: 249.2 },
      { time: '10:00', close: 248.5 },
      { time: '10:30', close: 247.8 },
      { time: '11:00', close: 247.1 },
      { time: '11:30', close: 246.8 },
      { time: '12:00', close: 246.6 },
      { time: '12:30', close: 246.55 },
    ],
    category: 'Tech'
  },
  MSFT: {
    exchange: 'NASDAQ',
    price: 412.88,
    change: 0.3,
    data: [
      { time: '09:30', close: 410.2 },
      { time: '10:00', close: 410.8 },
      { time: '10:30', close: 411.5 },
      { time: '11:00', close: 412.1 },
      { time: '11:30', close: 412.5 },
      { time: '12:00', close: 412.8 },
      { time: '12:30', close: 412.88 },
    ],
    category: 'Tech'
  },
  META: {
    exchange: 'NASDAQ',
    price: 502.10,
    change: 2.1,
    data: [
      { time: '09:30', close: 491.2 },
      { time: '10:00', close: 493.5 },
      { time: '10:30', close: 495.8 },
      { time: '11:00', close: 497.5 },
      { time: '11:30', close: 499.2 },
      { time: '12:00', close: 501.1 },
      { time: '12:30', close: 502.10 },
    ],
    category: 'Tech'
  },
  GOOGL: {
    exchange: 'NASDAQ',
    price: 143.22,
    change: 0.6,
    data: [
      { time: '09:30', close: 141.8 },
      { time: '10:00', close: 142.1 },
      { time: '10:30', close: 142.5 },
      { time: '11:00', close: 142.9 },
      { time: '11:30', close: 143.1 },
      { time: '12:00', close: 143.2 },
      { time: '12:30', close: 143.22 },
    ],
    category: 'Tech'
  },
  XOM: {
    exchange: 'NYSE',
    price: 105.45,
    change: 1.5,
    data: [
      { time: '09:30', close: 103.8 },
      { time: '10:00', close: 104.2 },
      { time: '10:30', close: 104.6 },
      { time: '11:00', close: 104.9 },
      { time: '11:30', close: 105.1 },
      { time: '12:00', close: 105.3 },
      { time: '12:30', close: 105.45 },
    ],
    category: 'Energy'
  },
  CVX: {
    exchange: 'NYSE',
    price: 156.32,
    change: 0.9,
    data: [
      { time: '09:30', close: 154.9 },
      { time: '10:00', close: 155.2 },
      { time: '10:30', close: 155.6 },
      { time: '11:00', close: 155.9 },
      { time: '11:30', close: 156.1 },
      { time: '12:00', close: 156.2 },
      { time: '12:30', close: 156.32 },
    ],
    category: 'Energy'
  },
  BTC: {
    exchange: 'CRYPTO',
    price: 67234.50,
    change: 3.2,
    data: [
      { time: '09:30', close: 65123.2 },
      { time: '10:00', close: 65800.1 },
      { time: '10:30', close: 66200.5 },
      { time: '11:00', close: 66700.3 },
      { time: '11:30', close: 66900.8 },
      { time: '12:00', close: 67100.2 },
      { time: '12:30', close: 67234.50 },
    ],
    category: 'Crypto'
  },
  ETH: {
    exchange: 'CRYPTO',
    price: 3545.20,
    change: 2.8,
    data: [
      { time: '09:30', close: 3444.5 },
      { time: '10:00', close: 3470.2 },
      { time: '10:30', close: 3490.1 },
      { time: '11:00', close: 3510.5 },
      { time: '11:30', close: 3520.3 },
      { time: '12:00', close: 3535.1 },
      { time: '12:30', close: 3545.20 },
    ],
    category: 'Crypto'
  },
};

const CATEGORIES = ['All (12)', 'Tech', 'Energy', 'Crypto'];

function StockCard({ ticker, data, isDark }) {
  const isPositive = data.change >= 0;
  const changeColor = isPositive ? '#10b981' : '#ef4444';
  const cardBg = isDark 
    ? 'bg-[#252525] border-gray-700 hover:border-gray-600' 
    : 'bg-white border-gray-300 hover:border-gray-400';
  const textColor = isDark ? 'text-gray-200' : 'text-gray-900';
  const labelColor = isDark ? 'text-gray-400' : 'text-gray-500';

  return (
    <div
      className={`border rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-200 hover:shadow-lg ${cardBg}`}
    >
      {/* Header: Ticker + Exchange */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className={`text-lg sm:text-xl font-bold ${textColor}`}>
            {ticker}
          </h3>
          <p className={`text-xs sm:text-sm ${labelColor}`}>
            {data.exchange}
          </p>
        </div>
      </div>

      {/* Price */}
      <div className="mb-2">
        <p className={`text-lg sm:text-xl font-bold ${textColor}`}>
          ${data.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      {/* Change % */}
      <div className="mb-3 flex items-center gap-1">
        <span style={{ color: changeColor }} className="text-xs sm:text-sm font-semibold">
          {isPositive ? '+' : ''}{data.change}% today
        </span>
        {isPositive ? (
          <TrendingUp size={14} color={changeColor} />
        ) : (
          <TrendingDown size={14} color={changeColor} />
        )}
      </div>

      {/* Mini Chart */}
      <div className="h-16 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.data}>
            <defs>
              <linearGradient id={`color-${ticker}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={changeColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={changeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="close"
              stroke={changeColor}
              strokeWidth={2}
              fill={`url(#color-${ticker})`}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function Watchlist({ isDark = false }) {
  const [activeCategory, setActiveCategory] = useState('All (12)');

  const filteredTickers = activeCategory === 'All (12)'
    ? Object.keys(WATCHLIST_DATA)
    : Object.keys(WATCHLIST_DATA).filter(
        ticker => WATCHLIST_DATA[ticker].category === activeCategory
      );

  const headerBg = isDark 
    ? 'bg-[#252525] border-gray-700' 
    : 'bg-[#f0f0f0] border-gray-400';
  const headerText = isDark ? 'text-gray-100' : 'text-gray-900';
  const btnBg = isDark
    ? 'bg-[#252525] border-gray-700 text-gray-300 hover:bg-[#2a2a2a]'
    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50';
  const activeBtnBg = isDark
    ? 'bg-[#e07a5f] border-[#e07a5f] text-white'
    : 'bg-[#e07a5f] border-[#e07a5f] text-white';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`border rounded-xl p-4 sm:p-6 ${headerBg}`}>
        
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeCategory === category
                  ? activeBtnBg
                  : btnBg
              }`}
            >
              {category}
            </button>
          ))}
          <button
            className={`px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm font-semibold transition-all duration-200 ${btnBg} flex items-center gap-1`}
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

      {/* Grid of Stock Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredTickers.map(ticker => (
          <StockCard
            key={ticker}
            ticker={ticker}
            data={WATCHLIST_DATA[ticker]}
            isDark={isDark}
          />
        ))}
      </div>
    </div>
  );
}
