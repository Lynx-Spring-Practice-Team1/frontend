import { useState } from 'react';
import OrderPanel from '../components/OrderPanel';

const ACCENT = '#d9774a';

// Spec §3.3 field names; order_type MARKET|LIMIT only; statuses from §3.5
const INITIAL_ORDERS = [
    { id: 1, time: '10:42', symbol: 'AAPL', instrument_type: 'STOCK', side: 'BUY',  type: 'LIMIT',  qty: 10, price: 184.00, status: 'PENDING',   filled_quantity: 0,  exchange_fee: 0 },
    { id: 2, time: '09:31', symbol: 'NVDA', instrument_type: 'STOCK', side: 'SELL', type: 'LIMIT',  qty: 5,  price: 880.00, status: 'PENDING',   filled_quantity: 0,  exchange_fee: 0 },
    { id: 3, time: 'Yest',  symbol: 'TSLA', instrument_type: 'STOCK', side: 'BUY',  type: 'MARKET', qty: 8,  price: 248.10, status: 'FILLED',    filled_quantity: 8,  exchange_fee: 1.99 },
    { id: 4, time: 'Yest',  symbol: 'MSFT', instrument_type: 'STOCK', side: 'BUY',  type: 'LIMIT',  qty: 15, price: 410.00, status: 'CANCELLED', filled_quantity: 0,  exchange_fee: 0 },
    { id: 5, time: '14:22', symbol: 'AMZN', instrument_type: 'STOCK', side: 'BUY',  type: 'LIMIT',  qty: 3,  price: 178.50, status: 'FILLED',    filled_quantity: 3,  exchange_fee: 0.54 },
    { id: 6, time: 'Yest',  symbol: 'GOOGL', instrument_type: 'STOCK', side: 'SELL', type: 'LIMIT', qty: 2,  price: 175.00, status: 'CANCELLED', filled_quantity: 0,  exchange_fee: 0 },
    { id: 7, time: '08:55', symbol: 'META', instrument_type: 'STOCK', side: 'BUY',  type: 'MARKET', qty: 5,  price: 502.30, status: 'FILLED',    filled_quantity: 5,  exchange_fee: 2.51 },
];

// Active = PENDING + PARTIALLY_FILLED (both cancelable per spec §4.3)
const ACTIVE_STATUSES = ['PENDING', 'PARTIALLY_FILLED'];
const TABS    = ['Active', 'Filled', 'Cancelled', 'Rejected', 'Expired', 'All'];
const COLUMNS = ['TIME', 'SYMBOL', 'SIDE', 'TYPE', 'QTY', 'PRICE', 'STATUS', 'ACTION'];

// Future: swap useState initial value + mutations for fetch('/api/orders') calls
function useOrders() {
    const [orders, setOrders] = useState(INITIAL_ORDERS);

    const placeOrder = ({ symbol, side, type, qty, price }) => {
        const now  = new Date();
        const time = now.toTimeString().slice(0, 5);
        setOrders(prev => [{
            id: Date.now(),
            time,
            symbol,
            instrument_type: 'STOCK',
            side,
            type: type.toUpperCase(),
            qty,
            price,
            status: 'PENDING',
            filled_quantity: 0,
            exchange_fee: 0,
        }, ...prev]);
    };

    // Spec §4.3: DELETE only valid for PENDING or PARTIALLY_FILLED
    const cancelOrder = (id) => {
        setOrders(prev => prev.map(o =>
            o.id === id && ACTIVE_STATUSES.includes(o.status)
                ? { ...o, status: 'CANCELLED' }
                : o
        ));
    };

    return { orders, placeOrder, cancelOrder };
}

function StatusBadge({ status, isDark }) {
    const cfg = {
        PENDING:          { label: 'Pending',          cls: `text-blue-400   ${isDark ? 'bg-blue-900/20'   : 'bg-blue-50'}` },
        PARTIALLY_FILLED: { label: 'Partial',          cls: `text-amber-400  ${isDark ? 'bg-amber-900/20'  : 'bg-amber-50'}` },
        FILLED:           { label: 'Filled',           cls: `text-green-500  ${isDark ? 'bg-green-900/20'  : 'bg-green-50'}` },
        CANCELLED:        { label: 'Cancelled',        cls: `${isDark ? 'text-gray-500 bg-gray-800/50' : 'text-gray-400 bg-gray-200'}` },
        REJECTED:         { label: 'Rejected',         cls: `text-red-400    ${isDark ? 'bg-red-900/20'    : 'bg-red-50'}` },
        EXPIRED:          { label: 'Expired',          cls: `${isDark ? 'text-gray-600 bg-gray-800/30' : 'text-gray-400 bg-gray-100'}` },
    };
    const { label, cls } = cfg[status] ?? cfg.CANCELLED;
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
            {label}
        </span>
    );
}

function StatCard({ isDark, label, value, sub, valueClass }) {
    return (
        <div className={`rounded-xl border p-4 flex flex-col gap-1 ${isDark ? 'bg-[#1a1a1a] border-[#333]' : 'bg-[#e8e8e8] border-[#d8d8d8]'}`}>
            <span className={`text-xs uppercase tracking-wider font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</span>
            <span className={`text-2xl font-bold ${valueClass ?? (isDark ? 'text-gray-100' : 'text-gray-900')}`}>{value}</span>
            {sub && <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{sub}</span>}
        </div>
    );
}

export default function Orders({ isDark = false }) {
    const [activeTab, setActiveTab] = useState('Active');
    const { orders, placeOrder, cancelOrder } = useOrders();

    const isActive = o => ACTIVE_STATUSES.includes(o.status);

    const filtered = (() => {
        if (activeTab === 'All')      return orders;
        if (activeTab === 'Active')   return orders.filter(isActive);
        if (activeTab === 'Filled')   return orders.filter(o => o.status === 'FILLED');
        if (activeTab === 'Cancelled') return orders.filter(o => o.status === 'CANCELLED');
        if (activeTab === 'Rejected') return orders.filter(o => o.status === 'REJECTED');
        if (activeTab === 'Expired')  return orders.filter(o => o.status === 'EXPIRED');
        return orders;
    })();

    const activeCount    = orders.filter(isActive).length;
    const filledCount    = orders.filter(o => o.status === 'FILLED').length;
    const cancelledCount = orders.filter(o => o.status === 'CANCELLED').length;
    const openValue      = orders
        .filter(isActive)
        .reduce((sum, o) => sum + o.price * o.qty, 0)
        .toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

    const fillDenom = filledCount + cancelledCount;
    const fillRate  = fillDenom > 0 ? Math.round(filledCount / fillDenom * 100) : 0;

    const tabCount = tab => {
        if (tab === 'All')       return orders.length;
        if (tab === 'Active')    return orders.filter(isActive).length;
        if (tab === 'Filled')    return orders.filter(o => o.status === 'FILLED').length;
        if (tab === 'Cancelled') return orders.filter(o => o.status === 'CANCELLED').length;
        if (tab === 'Rejected')  return orders.filter(o => o.status === 'REJECTED').length;
        if (tab === 'Expired')   return orders.filter(o => o.status === 'EXPIRED').length;
        return 0;
    };

    const rowBase = `border-b border-dashed transition-colors ${
        isDark ? 'border-[#2a2a2a] hover:bg-[#222]' : 'border-[#d0d0d0] hover:bg-[#e0e0e0]'
    }`;
    const thCls = `px-4 py-3 text-left text-xs font-semibold tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`;
    const tdCls = `px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

    return (
        <div className="flex flex-col lg:flex-row gap-5">

            {/* ── Left: stats + table ── */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard isDark={isDark} label="Active Orders" value={activeCount}    sub="Pending / Partial" valueClass="text-blue-400" />
                    <StatCard isDark={isDark} label="Filled Today"  value={filledCount}    sub="Executed"          valueClass="text-green-500" />
                    <StatCard isDark={isDark} label="Cancelled"     value={cancelledCount} sub="Today"             />
                    <StatCard isDark={isDark} label="Active Value"  value={openValue}      sub="At limit price"    />
                </div>

                {/* Orders table */}
                <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-[#1a1a1a] border-[#333]' : 'bg-[#e8e8e8] border-[#d8d8d8]'}`}>

                    {/* Filter tabs */}
                    <div className={`flex flex-wrap gap-2 p-3 border-b ${isDark ? 'border-[#333]' : 'border-[#d0d0d0]'}`}>
                        {TABS.map(tab => {
                            const active = activeTab === tab;
                            const count  = tabCount(tab);
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer border transition-all ${
                                        active
                                            ? 'text-white border-transparent'
                                            : isDark
                                                ? 'border-[#444] text-gray-400 hover:text-gray-200 hover:border-[#666]'
                                                : 'border-[#d0d0d0] text-gray-500 hover:text-gray-700 hover:border-[#bbb]'
                                    }`}
                                    style={active ? { backgroundColor: ACCENT, borderColor: ACCENT } : {}}
                                >
                                    {tab}{count > 0 && ` (${count})`}
                                </button>
                            );
                        })}
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={`border-b ${isDark ? 'border-[#333]' : 'border-[#d0d0d0]'}`}>
                                    {COLUMNS.map(col => <th key={col} className={thCls}>{col}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={COLUMNS.length} className={`px-4 py-10 text-center italic ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                            No {activeTab.toLowerCase()} orders
                                        </td>
                                    </tr>
                                ) : filtered.map(order => (
                                    <tr key={order.id} className={rowBase}>
                                        <td className={`px-4 py-3 font-mono text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{order.time}</td>
                                        <td className={`px-4 py-3 font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{order.symbol}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className="font-bold text-sm"
                                                style={{ color: order.side === 'BUY' ? ACCENT : (isDark ? '#9ca3af' : '#6b7280') }}
                                            >
                                                {order.side}
                                            </span>
                                        </td>
                                        <td className={tdCls}>{order.type}</td>
                                        <td className={`px-4 py-3 font-mono text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{order.qty}</td>
                                        <td className={`px-4 py-3 font-mono text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                            ${order.price.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={order.status} isDark={isDark} />
                                        </td>
                                        <td className="px-4 py-3">
                                            {/* Spec §4.3: only PENDING or PARTIALLY_FILLED can be cancelled */}
                                            {ACTIVE_STATUSES.includes(order.status) && (
                                                <button
                                                    onClick={() => cancelOrder(order.id)}
                                                    className={`text-xs px-2.5 py-1 rounded border cursor-pointer transition-opacity hover:opacity-70 ${
                                                        isDark ? 'border-[#444] text-gray-400' : 'border-[#c0c0c0] text-gray-500'
                                                    }`}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Right: place order + account summary ── */}
            <div className="lg:w-72 lg:shrink-0 flex flex-col sm:flex-row lg:flex-col gap-4">

                {/* Place Order */}
                <div className="flex-1 lg:flex-none min-w-0">
                    <OrderPanel
                        isDark={isDark}
                        activeTicker="AAPL"
                        currentPrice={184.00}
                        showSymbolInput={true}
                        onSubmit={placeOrder}
                    />
                </div>

                {/* Account Summary */}
                <div className={`rounded-xl border p-4 flex flex-col gap-3 ${isDark ? 'bg-[#1a1a1a] border-[#333]' : 'bg-[#e8e8e8] border-[#d8d8d8]'}`}>
                    <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Account
                    </span>
                    {[
                        { label: 'Buying Power', value: '$12,480.55', cls: '' },
                        { label: 'Day P&L',       value: '+$284.30',  cls: 'text-green-500' },
                        { label: 'Account Value', value: '$47,832.00', cls: '' },
                        { label: 'Margin Used',   value: '$0.00',      cls: '' },
                    ].map(({ label, value, cls }) => (
                        <div key={label} className={`flex items-center justify-between border-b last:border-0 pb-2 last:pb-0 ${isDark ? 'border-[#2a2a2a]' : 'border-[#d4d4d4]'}`}>
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
                            <span className={`text-sm font-semibold ${cls || (isDark ? 'text-gray-100' : 'text-gray-900')}`}>{value}</span>
                        </div>
                    ))}
                </div>

                {/* Today's Activity */}
                <div className={`rounded-xl border p-4 flex flex-col gap-3 ${isDark ? 'bg-[#1a1a1a] border-[#333]' : 'bg-[#e8e8e8] border-[#d8d8d8]'}`}>
                    <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Today&apos;s Activity
                    </span>
                    <div className="flex flex-col gap-2">
                        {[
                            { label: 'Orders Placed',    value: orders.length },
                            { label: 'Orders Filled',    value: filledCount },
                            { label: 'Orders Cancelled', value: cancelledCount },
                            { label: 'Fill Rate',        value: `${fillRate}%` },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between">
                                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
                                <span className={`text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{value}</span>
                            </div>
                        ))}
                    </div>
                    <div className={`rounded-full h-1.5 overflow-hidden ${isDark ? 'bg-[#2a2a2a]' : 'bg-[#d0d0d0]'}`}>
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${fillRate}%`, backgroundColor: ACCENT }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
