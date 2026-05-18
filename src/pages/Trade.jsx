import { useState, useEffect } from 'react';
import TradingChart from '../components/TradingChart';
import OrderPanel from '../components/OrderPanel';
import TodayActivity from '../components/orders/TodayActivity.jsx';
import { useMarketData } from '../context/useMarketData';
import useOrders from '../components/orders/useOrders.js';

function useChartHeight() {
    const [height, setHeight] = useState(() => window.innerWidth < 640 ? 260 : 400);
    useEffect(() => {
        const update = () => setHeight(window.innerWidth < 640 ? 260 : 400);
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);
    return height;
}

export default function Trade({ isDark }) {
    const [activeTicker, setActiveTicker] = useState('');
    const { latestUpdate, getCandleData, historyLoaded, tickers } = useMarketData();
    const { placeOrder, orders } = useOrders();
    const chartHeight = useChartHeight();

    const [candles, setCandles] = useState({});
    const selectedTicker = activeTicker || tickers[0] || '';

    useEffect(() => {
        if (!historyLoaded) return;
        const init = {};
        for (const t of tickers) {
            const data = getCandleData(t);
            const last = data[data.length - 1];
            if (last) init[t] = last;
        }
        setCandles(init);
    }, [historyLoaded, tickers, getCandleData]);

    useEffect(() => {
        if (!latestUpdate) return;
        const { ticker, candle } = latestUpdate;
        setCandles(prev => ({ ...prev, [ticker]: candle }));
    }, [latestUpdate]);

    const activeCandle = candles[selectedTicker];
    const price = activeCandle?.close ?? 0;
    const change = activeCandle ? activeCandle.close - activeCandle.open : 0;
    const changePct = activeCandle?.open > 0 ? (change / activeCandle.open * 100) : 0;
    const isPos = change >= 0;

    const name = selectedTicker;
    const exchange = '';

    const filledCount = orders.filter(o => o.status === 'FILLED').length;
    const cancelledCount = orders.filter(o => o.status === 'CANCELLED').length;
    const fillDenom = filledCount + cancelledCount;
    const fillRate = fillDenom > 0 ? Math.round(filledCount / fillDenom * 100) : 0;

    const [positions, setPositions] = useState([]);
    useEffect(() => {
        const token = sessionStorage.getItem('token');
        fetch('/api/portfolio', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.ok ? r.json() : null)
            .then(data => data?.positions && setPositions(data.positions))
            .catch(() => { });
    }, []);

    return (
        <div className="flex flex-col lg:flex-row gap-5">
            {/* Left: chart area */}
            <div className="flex-1 flex flex-col gap-3 min-w-0">
                {/* Stock header */}
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <div className="flex items-baseline gap-2.5">
                        <span className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                            {selectedTicker}
                        </span>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {name} · {exchange}
                        </span>
                    </div>
                    {price > 0 && (
                        <div className="flex items-baseline gap-2">
                            <span className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                                ${price.toFixed(2)}
                            </span>
                            <span className={`text-sm font-medium ${isPos ? 'text-green-500' : 'text-red-500'}`}>
                                {isPos ? '+' : ''}{change.toFixed(2)} ({isPos ? '+' : ''}{changePct.toFixed(1)}%)
                            </span>
                        </div>
                    )}
                </div>

                {/* Chart container */}
                <div className={`rounded-xl border p-3 sm:p-4 ${isDark ? 'bg-[#252525] border-gray-700' : 'bg-[#f0f0f0] border-gray-400'}`}>
                    <TradingChart
                        isDark={isDark}
                        activeTicker={selectedTicker}
                        onTickerChange={setActiveTicker}
                        height={chartHeight}
                    />
                </div>
            </div>

            <div className="lg:w-72 lg:shrink-0">
                <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
                    <div className="flex-1 lg:flex-none min-w-0">
                        <OrderPanel
                            isDark={isDark}
                            activeTicker={selectedTicker}
                            currentPrice={price}
                            onSubmit={placeOrder}
                            showSymbolInput={true}
                            symbolOptions={tickers}
                            onTickerChange={setActiveTicker}
                            positions={positions}
                        />
                    </div>
                    <div className="flex-1 lg:flex-none min-w-0">
                        <TodayActivity
                            isDark={isDark}
                            totalOrders={orders.length}
                            filledCount={filledCount}
                            cancelledCount={cancelledCount}
                            fillRate={fillRate}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
