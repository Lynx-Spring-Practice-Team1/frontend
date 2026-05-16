import React from 'react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

const CardWrapper = ({ title, children }) => (
  <div className="bg-[#f0f0f0] dark:bg-[#252525] border border-gray-400 dark:border-gray-700 rounded-xl p-4 sm:p-5 flex-1 transition-colors">
    <h3 className="italic font-bold mb-3 text-sm sm:text-base text-gray-900 dark:text-white">{title}</h3>
    {children}
  </div>
);

function Watchlist({ tickers, watchlistData }) {
  return (
    <CardWrapper title="Watchlist">
      <div className="space-y-3 sm:space-y-4">
        {tickers.slice(0, 4).map((ticker) => (
          <div key={ticker} className="flex justify-between items-center gap-2">
            <span className="font-bold text-sm">{ticker}</span>
            <div className="h-6 w-20">
              {watchlistData[ticker] && watchlistData[ticker].length > 0 ? (
                <ResponsiveContainer minWidth="100%" minHeight="100%">
                  <LineChart data={watchlistData[ticker]}>
                    <Line 
                      type="monotone" 
                      dataKey="close" 
                      stroke="#e07a5f" 
                      strokeWidth={1.5} 
                      dot={false} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-gray-400">Loading...</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
}

export default Watchlist;
