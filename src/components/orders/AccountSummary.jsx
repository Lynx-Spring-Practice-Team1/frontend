const ACCOUNT_ROWS = [
    { label: 'Buying Power',  value: '$12,480.55', cls: '' },
    { label: 'Day P&L',       value: '+$284.30',   cls: 'text-green-500' },
    { label: 'Account Value', value: '$47,832.00',  cls: '' },
    { label: 'Margin Used',   value: '$0.00',       cls: '' },
];

export default function AccountSummary({ isDark }) {
    return (
        <div className={`rounded-xl border p-4 flex flex-col gap-3 ${isDark ? 'bg-[#1a1a1a] border-[#333]' : 'bg-[#e8e8e8] border-[#d8d8d8]'}`}>
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Account
            </span>
            {ACCOUNT_ROWS.map(({ label, value, cls }) => (
                <div key={label} className={`flex items-center justify-between border-b last:border-0 pb-2 last:pb-0 ${isDark ? 'border-[#2a2a2a]' : 'border-[#d4d4d4]'}`}>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
                    <span className={`text-sm font-semibold ${cls || (isDark ? 'text-gray-100' : 'text-gray-900')}`}>{value}</span>
                </div>
            ))}
        </div>
    );
}
