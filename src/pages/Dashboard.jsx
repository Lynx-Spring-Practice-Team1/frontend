import React, { useEffect, useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useMarketData, TICKERS } from '../context/MarketDataContext';
import AllocationCard from '../components/dashboard/Alocation';
import PortfolioValue from '../components/dashboard/PortfolioValue';
import TopMovers from '../components/dashboard/TopMovers';
import Watchlist from '../components/dashboard/Watchlist';





// --- Main Page Component ---

const DASHBOARD_MAX_CANDLES = 10;

export default function Dashboard() {
  const { getCandleData, historyLoaded, latestUpdate } = useMarketData();
  const [watchlistData, setWatchlistData] = useState({});

  // Load watchlist data on mount — limit to last 10 candles
  useEffect(() => {
    if (!historyLoaded) return;
    
    const newData = {};
    TICKERS.forEach(ticker => {
      const allData = getCandleData(ticker);
      newData[ticker] = allData.slice(-DASHBOARD_MAX_CANDLES);
    });
    setWatchlistData(newData);
  }, [historyLoaded, getCandleData]);

  // Update watchlist on real-time price updates — keep only last 10
  useEffect(() => {
    if (!latestUpdate) return;
    
    const { ticker } = latestUpdate;
    const allData = getCandleData(ticker);
    setWatchlistData(prev => ({
      ...prev,
      [ticker]: allData.slice(-DASHBOARD_MAX_CANDLES)
    }));
  }, [latestUpdate, getCandleData]);

  return (
    <div className=" font-sans text-gray-900 dark:text-white transition-colors duration-200">
    <PortfolioValue value="24,567.89" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5"> 
        <TopMovers tickers={TICKERS} watchlistData={watchlistData} />
        <Watchlist tickers={TICKERS} watchlistData={watchlistData} />
        <AllocationCard />
      </div>
    </div>
  );
}