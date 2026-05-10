export default function StatCard({ isDark, label, value, sub, valueClass }) {
    return (
        <div className={`rounded-xl border p-4 flex flex-col gap-1 ${isDark ? 'bg-[#252525] border-gray-700' : 'bg-[#f0f0f0] border-gray-400'}`}>
            <span className={`text-xs uppercase tracking-wider font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</span>
            <span className={`text-2xl font-bold ${valueClass ?? (isDark ? 'text-gray-100' : 'text-gray-900')}`}>{value}</span>
            {sub && <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{sub}</span>}
        </div>
    );
}
