import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useMarketData, TICKERS } from '../context/MarketDataContext';

function StockCard({ ticker, isDark }) {
  const { getCandleData, latestUpdate } = useMarketData();
  // latestUpdate is read to subscribe to re-renders; actual data comes from refs via getCandleData
  void latestUpdate;

  const allCandles = getCandleData(ticker);
  const latestTime = allCandles.length > 0 ? allCandles[allCandles.length - 1].time : null;
  const dayStart = latestTime != null ? Math.floor(latestTime / 86400) * 86400 : null;
  const candles = dayStart != null ? allCandles.filter(c => c.time >= dayStart) : [];
  const current = candles[candles.length - 1];
  const price = current?.close ?? null;
  const firstOpen = candles[0]?.open ?? null;
  const change =
    price != null && firstOpen != null && firstOpen !== 0
      ? ((price - firstOpen) / firstOpen) * 100
      : 0;

  const chartData = candles.map(c => ({ close: c.close }));
  const isPositive = change >= 0;
  const changeColor = isPositive ? '#10b981' : '#ef4444';

  const cardBg = isDark
    ? 'bg-[#252525] border-gray-700 hover:border-gray-600'
    : 'bg-white border-gray-300 hover:border-gray-400';
  const textColor = isDark ? 'text-gray-200' : 'text-gray-900';
  const labelColor = isDark ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`border rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-200 hover:shadow-lg ${cardBg}`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className={`text-lg sm:text-xl font-bold ${textColor}`}>{ticker}</h3>
      </div>

      <div className="mb-2">
        {price != null ? (
          <p className={`text-lg sm:text-xl font-bold ${textColor}`}>
            ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        ) : (
          <p className={`text-lg sm:text-xl font-bold ${labelColor}`}>—</p>
        )}
      </div>

      <div className="mb-3 flex items-center gap-1">
        {price != null && (
          <>
            <span style={{ color: changeColor }} className="text-xs sm:text-sm font-semibold">
              {isPositive ? '+' : ''}{change.toFixed(2)}% today
            </span>
            {isPositive ? (
              <TrendingUp size={14} color={changeColor} />
            ) : (
              <TrendingDown size={14} color={changeColor} />
            )}
          </>
        )}
      </div>

      <div className="h-16 -mx-2">
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
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
        ) : (
          <div className={`h-full flex items-center justify-center text-xs ${labelColor}`}>
            Awaiting data…
          </div>
        )}
      </div>
    </div>
  );
}

export default function Watchlist({ isDark = false }) {
  const headerBg = isDark
    ? 'bg-[#252525] border-gray-700'
    : 'bg-[#f0f0f0] border-gray-400';
  const btnBg = isDark
    ? 'bg-[#252525] border-gray-700 text-gray-300 hover:bg-[#2a2a2a]'
    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50';

  return (
    <div className="space-y-6">
      <div className={`border rounded-xl p-4 sm:p-6 ${headerBg}`}>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button className="px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm font-semibold bg-[#e07a5f] border-[#e07a5f] text-white">
            All ({TICKERS.length})
          </button>
          <button className={`px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm font-semibold transition-all duration-200 ${btnBg} flex items-center gap-1`}>
            <Plus size={16} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {TICKERS.map(ticker => (
          <StockCard key={ticker} ticker={ticker} isDark={isDark} />
        ))}
      </div>
    </div>
  );
}
