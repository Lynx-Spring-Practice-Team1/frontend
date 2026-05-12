import { useState } from 'react';
import { ACCENT, ACTIVE_STATUSES, TABS, COLUMNS } from './constants.js';
import StatusBadge from './StatusBadge.jsx';

function filterOrders(orders, tab) {
    const isActive = o => ACTIVE_STATUSES.includes(o.status);
    if (tab === 'All') return orders;
    if (tab === 'Pending') return orders.filter(isActive);
    if (tab === 'Filled') return orders.filter(o => o.status === 'FILLED');
    if (tab === 'Cancelled') return orders.filter(o => o.status === 'CANCELLED');
    if (tab === 'Rejected') return orders.filter(o => o.status === 'REJECTED');
    if (tab === 'Expired') return orders.filter(o => o.status === 'EXPIRED');
    return orders;
}

function tabCount(orders, tab) {
    return filterOrders(orders, tab).length;
}

function priceLabel(order) {
    if (order.status === 'FILLED' && order.filled_price != null && Number(order.filled_price) > 0)
        return `$${Number(order.filled_price).toFixed(2)}`;
    return order.price == null || Number(order.price) <= 0
        ? 'MARKET'
        : `$${Number(order.price).toFixed(2)}`;
}

export default function OrdersTable({ isDark, orders, cancelOrder }) {
    const [activeTab, setActiveTab] = useState('Pending');
    const filtered = filterOrders(orders, activeTab);

    const thCls = `px-4 py-3 text-left text-xs font-semibold tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`;
    const tdCls = `px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
    const rowCls = `border-b border-dashed transition-colors ${isDark ? 'border-gray-700 hover:bg-[#2a2a2a]' : 'border-gray-300 hover:bg-[#f5f5f5]'}`;

    return (
        <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-[#252525] border-gray-700' : 'bg-[#f0f0f0] border-gray-400'}`}>
            <div className={`flex flex-wrap gap-2 p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
                {TABS.map(tab => {
                    const active = activeTab === tab;
                    const count = tabCount(orders, tab);
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer border transition-all ${
                                active
                                    ? 'text-white border-transparent'
                                    : isDark
                                        ? 'border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600'
                                        : 'border-gray-300 text-gray-500 hover:text-gray-700 hover:border-gray-400'
                            }`}
                            style={active ? { backgroundColor: ACCENT, borderColor: ACCENT } : {}}
                        >
                            {tab}{count > 0 && ` (${count})`}
                        </button>
                    );
                })}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
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
                            <tr key={order.id} className={rowCls}>
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
                                <td className={`px-4 py-3 font-mono text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{priceLabel(order)}</td>
                                <td className="px-4 py-3"><StatusBadge status={order.status} isDark={isDark} /></td>
                                <td className="px-4 py-3">
                                    {ACTIVE_STATUSES.includes(order.status) && (
                                        <button
                                            onClick={() => cancelOrder(order.id)}
                                            className={`text-xs px-2.5 py-1 rounded border cursor-pointer transition-opacity hover:opacity-70 ${
                                                isDark ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'
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
    );
}
