import { useEffect, useMemo, useRef, useState } from 'react';
import { useMarketData } from '../context/useMarketData';
import AllocationCard from '../components/dashboard/Alocation';
import PortfolioValue from '../components/dashboard/PortfolioValue';
import TopMovers from '../components/dashboard/TopMovers';
import Watchlist from '../components/dashboard/Watchlist';

const DASHBOARD_MAX_CANDLES = 10;

const fmtSnapTime = iso =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function Dashboard() {
    const { getCandleData, historyLoaded, latestUpdate, lastOrderUpdate, tickers } = useMarketData();


    const [watchlistData, setWatchlistData] = useState({});

    useEffect(() => {
        if (!historyLoaded) return;
        const newData = {};
        tickers.forEach(ticker => {
            const allData = getCandleData(ticker);
            newData[ticker] = allData.slice(-DASHBOARD_MAX_CANDLES);
        });
        setWatchlistData(newData);
    }, [historyLoaded, getCandleData, tickers]);

    useEffect(() => {
        if (!latestUpdate) return;
        const { ticker } = latestUpdate;
        const allData = getCandleData(ticker);
        setWatchlistData(prev => ({ ...prev, [ticker]: allData.slice(-DASHBOARD_MAX_CANDLES) }));
    }, [latestUpdate, getCandleData]);

    // Portfolio data
    const [portfolio, setPortfolio] = useState(null);

    const loadPortfolio = () => {
        const token = localStorage.getItem('token');
        fetch('/api/portfolio', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.ok ? r.json() : null)
            .then(data => data && setPortfolio(data))
            .catch(() => { });
    };

    useEffect(() => { loadPortfolio(); }, []);

    // Reload on fills / cancels
    useEffect(() => {
        if (!lastOrderUpdate) return;
        if (['FILLED', 'CANCELLED', 'REJECTED'].includes(lastOrderUpdate.status)) loadPortfolio();
    }, [lastOrderUpdate]);

    // Live price → recalculate total_equity and unrealized_pnl
    useEffect(() => {
        if (!latestUpdate || !portfolio?.positions?.length) return;
        const { ticker, candle } = latestUpdate;
        setPortfolio(prev => {
            if (!prev?.positions) return prev;
            const positions = prev.positions.map(p => {
                if (p.symbol !== ticker) return p;
                const qty = parseFloat(p.quantity);
                const newMV = qty * candle.close;
                const avgCost = parseFloat(p.average_cost) || 0;
                return { ...p, latest_price: candle.close, market_value: newMV, unrealized_pnl: avgCost > 0 ? (candle.close - avgCost) * qty : 0 };
            });
            const totalMV = positions.reduce((s, p) => s + parseFloat(p.market_value || 0), 0);
            const totalUnrealized = positions.reduce((s, p) => s + parseFloat(p.unrealized_pnl || 0), 0);
            return {
                ...prev, positions,
                total_market_value: totalMV,
                unrealized_pnl: totalUnrealized,
                total_equity: totalMV + parseFloat(prev.cash?.available || 0),
            };
        });
    }, [latestUpdate]);

    // Performance chart 
    const [chartData, setChartData] = useState([]);
    const historyRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('/api/portfolio/equity-snapshots', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.ok ? r.json() : [])
            .then(rows => {
                const loaded = rows.map(r => ({ time: fmtSnapTime(r.time), value: parseFloat(r.value) }));
                historyRef.current = loaded;
                setChartData(loaded);
            })
            .catch(() => { historyRef.current = []; });
    }, []);

    const snapshotFn = useRef(() => { });
    snapshotFn.current = () => {
        if (historyRef.current === null) return;
        const equity = parseFloat(portfolio?.total_equity);
        if (!equity || equity <= 0) return;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const next = [...historyRef.current, { time, value: equity }].slice(-10);
        historyRef.current = next;
        setChartData([...next]);
        const token = localStorage.getItem('token');
        fetch('/api/portfolio/equity-snapshots', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ value: equity }),
        }).catch(() => { });
    };

    useEffect(() => {
        if (portfolio?.total_equity) snapshotFn.current();
    }, [!!portfolio?.total_equity]);

    useEffect(() => {
        const id = setInterval(() => snapshotFn.current(), 30_000);
        return () => clearInterval(id);
    }, []);

    // ── Derived values
    const positionsKey = portfolio?.positions?.map(p => `${p.symbol}:${p.quantity}`).join(',') ?? '';
    const ALLOC_COLORS = ['#e07a5f', '#3d405b', '#81b29a', '#9ca3af', '#f2cc8f', '#6d6875'];
    const allocationData = useMemo(() => {
        if (!portfolio?.positions?.length) return [];
        const total = portfolio.positions.reduce((s, p) => s + parseFloat(p.quantity || 0), 0);
        if (total <= 0) return [];
        return portfolio.positions
            .filter(p => parseFloat(p.quantity) > 0)
            .map((p, i) => ({
                name: p.symbol,
                value: Math.round(parseFloat(p.quantity) / total * 100),
                color: ALLOC_COLORS[i % ALLOC_COLORS.length],
            }));
    }, [positionsKey]);

    const totalValue = parseFloat(portfolio?.total_equity || 0);
    const gainAmount = portfolio
        ? parseFloat(portfolio.unrealized_pnl || 0) + parseFloat(portfolio.realized_pnl || 0)
        : 0;
    const invested = totalValue - gainAmount;
    const gainPct = invested > 0 ? (gainAmount / invested) * 100 : 0;

    return (
        <div className="font-sans text-gray-900 dark:text-white transition-colors duration-200">
            <PortfolioValue
                totalValue={totalValue}
                gainAmount={gainAmount}
                gainPct={gainPct}
                chartData={chartData}
                loaded={portfolio !== null}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                <TopMovers tickers={tickers} watchlistData={watchlistData} />
                <Watchlist tickers={tickers} watchlistData={watchlistData} />
                <AllocationCard data={allocationData} />
            </div>
        </div>
    );
}
