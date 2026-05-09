import { useState } from 'react';
import { ACCENT, ACTIVE_STATUSES, TABS, COLUMNS } from './constants.js';
import StatusBadge from './StatusBadge.jsx';

function filterOrders(orders, tab) {
    const isActive = o => ACTIVE_STATUSES.includes(o.status);
    if (tab === 'All')       return orders;
    if (tab === 'Active')    return orders.filter(isActive);
    if (tab === 'Filled')    return orders.filter(o => o.status === 'FILLED');
    if (tab === 'Cancelled') return orders.filter(o => o.status === 'CANCELLED');
    if (tab === 'Rejected')  return orders.filter(o => o.status === 'REJECTED');
    if (tab === 'Expired')   return orders.filter(o => o.status === 'EXPIRED');
    return orders;
}

function tabCount(orders, tab) {
    return filterOrders(orders, tab).length;
}

export default function OrdersTable({ isDark, orders, cancelOrder }) {
    const [activeTab, setActiveTab] = useState('Active');
    const filtered = filterOrders(orders, activeTab);

    const thCls = `px-4 py-3 text-left text-xs font-semibold tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`;
    const tdCls = `px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
    const rowCls = `border-b border-dashed transition-colors ${isDark ? 'border-[#2a2a2a] hover:bg-[#222]' : 'border-[#d0d0d0] hover:bg-[#e0e0e0]'}`;

    return (
        <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-[#1a1a1a] border-[#333]' : 'bg-[#e8e8e8] border-[#d8d8d8]'}`}>
            <div className={`flex flex-wrap gap-2 p-3 border-b ${isDark ? 'border-[#333]' : 'border-[#d0d0d0]'}`}>
                {TABS.map(tab => {
                    const active = activeTab === tab;
                    const count  = tabCount(orders, tab);
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
                                <td className={`px-4 py-3 font-mono text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>${order.price.toFixed(2)}</td>
                                <td className="px-4 py-3"><StatusBadge status={order.status} isDark={isDark} /></td>
                                <td className="px-4 py-3">
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
    );
}
