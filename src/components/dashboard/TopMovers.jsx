// Calculate price change for top movers
const calculatePriceChange = (watchlistData, ticker) => {
  const data = watchlistData[ticker];
  if (!data || data.length < 2) return { change: 0, pct: 0, pos: true };
  
  const first = data[0];
  const last = data[data.length - 1];
  const change = last.close - first.close;
  const pct = (change / first.close * 100).toFixed(2);
  
  return {
    change: change.toFixed(2),
    pct: pct,
    pos: change >= 0
  };
};

const CardWrapper = ({ title, children }) => (
  <div className="bg-[#f0f0f0] dark:bg-[#252525] border border-gray-400 dark:border-gray-700 rounded-xl p-4 sm:p-5 flex-1 transition-colors">
    <h3 className="italic font-bold mb-3 text-sm sm:text-base text-gray-900 dark:text-white">{title}</h3>
    {children}
  </div>
);

function TopMovers({ tickers, watchlistData }) {
  return (
    <CardWrapper title="Top movers (last 10 ticks)">
      <div className="space-y-3">
        {tickers.map((ticker) => {
          const { pct, pos } = calculatePriceChange(watchlistData, ticker);
          const sign = pos ? '+' : '';
          return (
            <div key={ticker} className="flex justify-between border-b border-dotted border-gray-300 dark:border-gray-700 pb-2">
              <span className="font-bold text-sm">{ticker}</span>
              <span className={pos ? 'text-green-500 text-sm' : 'text-red-500 text-sm'}>{sign}{pct}%</span>
            </div>
          );
        })}
      </div>
    </CardWrapper>
  );
}

export default TopMovers;