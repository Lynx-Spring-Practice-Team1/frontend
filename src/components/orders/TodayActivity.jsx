import { ACCENT } from './constants.js';

export default function TodayActivity({ isDark, totalOrders, filledCount, cancelledCount, fillRate }) {
    const rows = [
        { label: 'Orders Placed', value: totalOrders },
        { label: 'Orders Filled', value: filledCount },
        { label: 'Orders Cancelled', value: cancelledCount },
        { label: 'Fill Rate', value: `${fillRate}%` },
    ];

    return (
        <div className={`rounded-xl border p-4 flex flex-col gap-3 ${isDark ? 'bg-[#252525] border-gray-700' : 'bg-[#f0f0f0] border-gray-400'}`}>
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Activity
            </span>
            <div className="flex flex-col gap-2">
                {rows.map(({ label, value }) => (
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
    );
}
