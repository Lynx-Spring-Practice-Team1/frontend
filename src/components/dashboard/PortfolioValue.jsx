
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

// --- Mock Data ---
const mainChartData = [
  { day: '1', val: 4000 }, { day: '5', val: 4200 }, { day: '10', val: 3800 },
  { day: '15', val: 4500 }, { day: '20', val: 4100 }, { day: '25', val: 4800 },
  { day: '30', val: 4600 },
];

function PortfolioValue({ value }) {
    return (

    <div className="bg-[#f0f0f0] dark:bg-[#252525] border border-gray-400 dark:border-gray-700 rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 relative overflow-hidden transition-colors">
    <p className="italic text-gray-500 dark:text-gray-400 mb-1 text-xs sm:text-sm">Total portfolio value</p>
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">${value}</h1>
        <span className="bg-[#f4d1c1] dark:bg-[#6b4423] border border-[#e07a5f] dark:border-[#8b5a3c] text-[#e07a5f] dark:text-[#ffb088] px-3 py-1 rounded-full text-xs sm:text-sm font-bold w-fit">
        ↑ $642.18 · +1.35%
        </span>
    </div>

    <div className="h-40 sm:h-48 md:h-64 w-full min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%" debounce={300}>
        <AreaChart data={mainChartData}>
            <defs>
            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e07a5f" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#e07a5f" stopOpacity={0}/>
            </linearGradient>
            </defs>
            <Area 
            type="monotone" 
            dataKey="val" 
            stroke="#e07a5f" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorVal)" 
            />
        </AreaChart>
        </ResponsiveContainer>
    </div>
    </div>
    )
}
export default PortfolioValue;