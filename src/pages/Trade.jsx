import { useState, useEffect } from 'react';
import TradingChart from '../components/TradingChart';
import OrderPanel from '../components/OrderPanel';
import OrderBook from '../components/OrderBook';
import { useMarketData, TICKERS } from '../context/MarketDataContext';

const TICKER_INFO = {
    AAPL: { name: 'Apple Inc.',     exchange: 'NASDAQ' },
    JPM:  { name: 'JPMorgan Chase', exchange: 'NYSE'   },
};

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
    const [activeTicker, setActiveTicker] = useState('AAPL');
    const { latestUpdate, getCandleData, historyLoaded } = useMarketData();
    const chartHeight = useChartHeight();

    const [candles, setCandles] = useState({});

    useEffect(() => {
        if (!historyLoaded) return;
        const init = {};
        for (const t of TICKERS) {
            const data = getCandleData(t);
            const last = data[data.length - 1];
            if (last) init[t] = last;
        }
        setCandles(init);
    }, [historyLoaded]);

    useEffect(() => {
        if (!latestUpdate) return;
        const { ticker, candle } = latestUpdate;
        setCandles(prev => ({ ...prev, [ticker]: candle }));
    }, [latestUpdate]);

    const activeCandle = candles[activeTicker];
    const price     = activeCandle?.close ?? 0;
    const change    = activeCandle ? activeCandle.close - activeCandle.open : 0;
    const changePct = activeCandle?.open > 0 ? (change / activeCandle.open * 100) : 0;
    const isPos     = change >= 0;

    const { name, exchange } = TICKER_INFO[activeTicker] ?? { name: activeTicker, exchange: '' };

    return (
        <div className="flex flex-col lg:flex-row gap-5">
            {/* Left: chart area */}
            <div className="flex-1 flex flex-col gap-3 min-w-0">
                {/* Stock header — stacks on mobile, inline on sm+ */}
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                    <div className="flex items-baseline gap-2.5">
                        <span className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                            {activeTicker}
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
                        activeTicker={activeTicker}
                        onTickerChange={setActiveTicker}
                        height={chartHeight}
                    />
                </div>
            </div>

            {/* Right: order panel + order book
                  mobile  → stacked vertically (flex-col)
                  sm–md   → side by side (flex-row)
                  lg+     → back to vertical, pinned as right column */}
            <div className="lg:w-72 lg:shrink-0">
                <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
                    <div className="flex-1 lg:flex-none min-w-0">
                        <OrderPanel
                            isDark={isDark}
                            activeTicker={activeTicker}
                            currentPrice={price}
                        />
                    </div>
                    <div className="flex-1 lg:flex-none min-w-0">
                        <OrderBook isDark={isDark} />
                    </div>
                </div>
            </div>
        </div>
    );
}
