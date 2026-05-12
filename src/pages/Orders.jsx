import { useState, useEffect } from 'react';
import { ACTIVE_STATUSES } from '../components/orders/constants.js';
import useOrders from '../components/orders/useOrders.js';
import StatCard from '../components/orders/StatCard.jsx';
import OrdersTable from '../components/orders/OrdersTable.jsx';
import TodayActivity from '../components/orders/TodayActivity.jsx';
import OrderPanel from '../components/OrderPanel';
import { useMarketData } from '../context/MarketDataContext';

export default function Orders({ isDark = false }) {
    const { orders, loading, error, placeOrder, cancelOrder } = useOrders();
    const { tickers, latestUpdate, getCandleData, historyLoaded } = useMarketData();
    const [selectedTicker, setSelectedTicker] = useState('AAPL');
    const [candles, setCandles] = useState({});

    // Seed from historical candle data once loaded
    useEffect(() => {
        if (!historyLoaded) return;
        const init = {};
        for (const t of tickers) {
            const data = getCandleData(t);
            const last = data[data.length - 1];
            if (last) init[t] = last;
        }
        setCandles(init);
    }, [historyLoaded]);

    // Update on every live price tick
    useEffect(() => {
        if (!latestUpdate) return;
        const { ticker, candle } = latestUpdate;
        setCandles(prev => ({ ...prev, [ticker]: candle }));
    }, [latestUpdate]);

    const currentPrice = candles[selectedTicker]?.close ?? 0;

    // Fetch portfolio positions so OrderPanel can validate SELL orders
    const [positions, setPositions] = useState([]);
    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('/api/portfolio', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.ok ? r.json() : null)
            .then(data => data?.positions && setPositions(data.positions))
            .catch(() => { });
    }, [orders]); // refresh whenever orders change

    const isActive = o => ACTIVE_STATUSES.includes(o.status);
    const activeCount = orders.filter(isActive).length;
    const filledCount = orders.filter(o => o.status === 'FILLED').length;
    const cancelledCount = orders.filter(o => o.status === 'CANCELLED').length;
    const openValue = orders
        .filter(isActive)
        .reduce((sum, o) => sum + ((o.price ?? 0) * o.qty), 0)
        .toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    const fillDenom = filledCount + cancelledCount;
    const fillRate = fillDenom > 0 ? Math.round(filledCount / fillDenom * 100) : 0;

    return (
        <div className="flex flex-col lg:flex-row gap-5">

            <div className="flex-1 flex flex-col gap-4 min-w-0">
                {error && (
                    <div className={`rounded-lg border px-4 py-2 text-xs ${isDark ? 'border-red-900 bg-red-950/30 text-red-300' : 'border-red-300 bg-red-50 text-red-600'}`}>
                        {error}
                    </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard isDark={isDark} label="Active Orders" value={loading ? '...' : activeCount} sub="Pending / accepted" valueClass="text-blue-400" />
                    <StatCard isDark={isDark} label="Filled" value={loading ? '...' : filledCount} sub="Executed" valueClass="text-green-500" />
                    <StatCard isDark={isDark} label="Cancelled" value={loading ? '...' : cancelledCount} sub="Today" />
                    <StatCard isDark={isDark} label="Active Value" value={loading ? '...' : openValue} sub="At limit price" />
                </div>
                <OrdersTable isDark={isDark} orders={orders} cancelOrder={cancelOrder} />
            </div>

            <div className="lg:w-72 lg:shrink-0 flex flex-col sm:flex-row lg:flex-col gap-4">
                <div className="flex-1 lg:flex-none min-w-0">
                    <OrderPanel
                        isDark={isDark}
                        activeTicker={selectedTicker}
                        currentPrice={currentPrice}
                        showSymbolInput={true}
                        symbolOptions={tickers}
                        onTickerChange={setSelectedTicker}
                        onSubmit={placeOrder}
                        positions={positions}
                    />
                </div>
                <TodayActivity
                    isDark={isDark}
                    totalOrders={orders.length}
                    filledCount={filledCount}
                    cancelledCount={cancelledCount}
                    fillRate={fillRate}
                />
            </div>
        </div>
    );
}
