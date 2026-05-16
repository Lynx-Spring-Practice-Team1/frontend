import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from 'recharts';

const fmt = v => `$${parseFloat(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function PortfolioValue({ totalValue = 0, gainAmount = 0, gainPct = 0, chartData = [], loaded = false }) {
    const pos = gainAmount >= 0;
    const arrow = pos ? '↑' : '↓';
    const gainColor = pos ? 'text-[#e07a5f] dark:text-[#ffb088]' : 'text-gray-500 dark:text-gray-400';
    const badgeBg = pos
        ? 'bg-[#f4d1c1] dark:bg-[#6b4423] border-[#e07a5f] dark:border-[#8b5a3c]'
        : 'bg-gray-200 dark:bg-gray-700 border-gray-400 dark:border-gray-600';

    return (
        <div className="bg-[#f0f0f0] dark:bg-[#252525] border border-gray-400 dark:border-gray-700 rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 relative overflow-hidden transition-colors">
            <p className="italic text-gray-500 dark:text-gray-400 mb-1 text-xs sm:text-sm">Total portfolio value</p>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-4 sm:mb-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                    {loaded ? fmt(totalValue) : '—'}
                </h1>
                {loaded && totalValue > 0 && (
                    <span className={`border px-3 py-1 rounded-full text-xs sm:text-sm font-bold w-fit ${badgeBg} ${gainColor}`}>
                        {arrow} {fmt(Math.abs(gainAmount))} · {gainAmount >= 0 ? '+' : ''}{gainPct.toFixed(2)}%
                    </span>
                )}
            </div>

            <div className="h-40 sm:h-48 md:h-64 w-full">
                {chartData.length < 2 ? (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400 dark:text-gray-600 italic">
                        Collecting data…
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#e07a5f" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#e07a5f" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <YAxis domain={['auto', 'auto']} hide />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: 6, fontSize: 11 }}
                                labelStyle={{ color: '#9ca3af' }}
                                formatter={v => [fmt(v), 'Equity']}
                            />
                            <Area type="monotone" dataKey="value" stroke="#e07a5f" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

export default PortfolioValue;
