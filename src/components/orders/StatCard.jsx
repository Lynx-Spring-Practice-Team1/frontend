export default function StatCard({ isDark, label, value, sub, valueClass }) {
    return (
        <div className={`rounded-xl border p-4 flex flex-col gap-1 ${isDark ? 'bg-[#1a1a1a] border-[#333]' : 'bg-[#e8e8e8] border-[#d8d8d8]'}`}>
            <span className={`text-xs uppercase tracking-wider font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</span>
            <span className={`text-2xl font-bold ${valueClass ?? (isDark ? 'text-gray-100' : 'text-gray-900')}`}>{value}</span>
            {sub && <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{sub}</span>}
        </div>
    );
}
