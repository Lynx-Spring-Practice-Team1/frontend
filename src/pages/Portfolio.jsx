import { useState, useEffect } from 'react';
import { TrendingUp, Wallet, ArrowUpRight, ArrowRightLeft, Plus, Download, RefreshCw } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const performanceData = [
  { name: '1', value: 4000 }, { name: '5', value: 3000 }, { name: '10', value: 5000 },
  { name: '15', value: 4500 }, { name: '20', value: 6000 }, { name: '25', value: 5500 },
  { name: '30', value: 5800 },
];

const COLORS = ['#e07a5f', '#3d405b', '#81b29a', '#9ca3af', '#f2cc8f', '#6d6875'];
const CARD = 'bg-[#f0f0f0] dark:bg-[#252525] border border-gray-400 dark:border-gray-700 rounded-xl transition-colors';

const fmt = v => `$${parseFloat(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtPct = (latest, avg) => {
  const a = parseFloat(avg);
  if (!a) return '—';
  const pct = ((parseFloat(latest) - a) / a) * 100;
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
};

function StatCard({ icon: Icon, label, value, sub, valueClass }) {
  return (
    <div className={`${CARD} p-4 flex flex-col gap-1`}>
      <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 mb-1">
        <Icon size={14} />
        <span className="text-xs uppercase tracking-wider font-medium">{label}</span>
      </div>
      <span className={`text-2xl font-bold ${valueClass ?? 'text-gray-900 dark:text-gray-100'}`}>{value}</span>
      {sub && <span className="text-xs text-gray-400 dark:text-gray-600">{sub}</span>}
    </div>
  );
}

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-300 dark:bg-gray-600 rounded ${className}`} />;
}

function TransactionModal({ type, isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      setError('Enter a valid amount');
      return;
    }

    setSubmitting(true);
    setError(null);
    const token = localStorage.getItem('token');
    const endpoint = '/api/portfolio/';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: num }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Failed to ${type}`);
      }

      onSuccess();
      setAmount('');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#f0f0f0] dark:bg-[#252525] border border-gray-400 dark:border-gray-700 rounded-xl max-w-sm w-full p-6 shadow-lg" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white capitalize">{type}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-gray-600 dark:text-gray-400 mb-2">
              Amount (USD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#e07a5f]"
            />
          </div>

          {error && (
            <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg text-xs font-bold border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: '#e07a5f' }}
            >
              {submitting ? 'Processing…' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    fetch('/api/portfolio', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(r => {console.log('Portfolio data:', r); return r;})
      .then(data => setPortfolio(data))
      .catch(err => setError(String(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const totalEquity     = portfolio ? fmt(portfolio.total_equity)    : null;
  const buyingPower     = portfolio ? fmt(portfolio.cash.available)   : null;
  const totalGain       = portfolio ? parseFloat(portfolio.unrealized_pnl) + parseFloat(portfolio.realized_pnl) : null;
  const totalGainFmt    = totalGain != null ? fmt(totalGain) : null;
  const gainPositive    = totalGain != null && totalGain >= 0;

  const allocationData  = portfolio && parseFloat(portfolio.total_market_value) > 0
    ? portfolio.positions
        .filter(p => parseFloat(p.market_value) > 0)
        .map((p, i) => ({
          name:  p.symbol,
          value: Math.round(parseFloat(p.market_value) / parseFloat(portfolio.total_market_value) * 100),
          color: COLORS[i % COLORS.length],
        }))
    : [];

  return (
    <div className="space-y-4 font-mono text-gray-900 dark:text-white">

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Welcome back {portfolio?.user_id}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setDepositOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: '#e07a5f' }}>
            <Plus size={14} /> Deposit
          </button>
          <button onClick={() => setWithdrawOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Download size={14} /> Withdraw
          </button>
        </div>
      </div>

      {error && (
        <div className="text-xs font-mono text-red-500 border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-2">
          Failed to load portfolio: {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`${CARD} p-4 col-span-2 sm:col-span-1`}>
          <span className="text-xs uppercase tracking-wider font-medium text-gray-400 dark:text-gray-500">Total value</span>
          {loading
            ? <Skeleton className="h-9 w-32 mt-1 mb-2" />
            : <p className="text-3xl font-bold mt-1 mb-2">{totalEquity}</p>
          }
        </div>
        <div className={`${CARD} p-4 flex flex-col gap-1`}>
          <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 mb-1">
            <Wallet size={14} />
            <span className="text-xs uppercase tracking-wider font-medium">Cash</span>
          </div>
          {loading ? <Skeleton className="h-8 w-24" /> : <span className="text-2xl font-bold">{buyingPower}</span>}
          <span className="text-xs text-gray-400 dark:text-gray-600">Available</span>
        </div>
        <div className={`${CARD} p-4 flex flex-col gap-1`}>
          <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 mb-1">
            <TrendingUp size={14} />
            <span className="text-xs uppercase tracking-wider font-medium">Total gain</span>
          </div>
          {loading
            ? <Skeleton className="h-8 w-24" />
            : <span className={`text-2xl font-bold ${gainPositive ? 'text-[#e07a5f]' : 'text-gray-500 dark:text-gray-400'}`}>{totalGainFmt}</span>
          }
          <span className="text-xs text-gray-400 dark:text-gray-600">Unrealized + realized</span>
        </div>
        <StatCard icon={ArrowRightLeft} label="Buying power" value={loading ? '…' : buyingPower} sub="Available cash" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Performance chart (mock — no historical endpoint) */}
        <div className={`${CARD} p-4 sm:p-5 lg:col-span-4`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="italic font-bold text-sm">Performance</h3>
            <select className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-transparent text-gray-600 dark:text-gray-300">
              <option>1M</option>
            </select>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="pfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#e07a5f" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#e07a5f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#e07a5f" strokeWidth={2} fillOpacity={1} fill="url(#pfGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-3">
            {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map(t => (
              <button key={t} className={`px-2 py-1 rounded text-xs font-bold border transition-colors ${
                t === '1M'
                  ? 'border-[#e07a5f] text-[#e07a5f] bg-[#f4d1c1] dark:bg-[#6b4423]/40'
                  : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
              }`}>{t}</button>
            ))}
          </div>
        </div>

        {/* Holdings table */}
        <div className={`${CARD} p-4 sm:p-5 lg:col-span-5 overflow-x-auto`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="italic font-bold text-sm">Holdings</h3>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-300 dark:border-gray-700">
                <th className="pb-2 font-medium">Stock</th>
                <th className="pb-2 font-medium">Shares</th>
                <th className="pb-2 font-medium text-right">Value</th>
                <th className="pb-2 font-medium text-right">Gain</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                [0,1,2].map(i => (
                  <tr key={i} className="border-b border-gray-200 dark:border-gray-700/50">
                    <td className="py-3"><Skeleton className="h-4 w-12" /></td>
                    <td className="py-3"><Skeleton className="h-4 w-8" /></td>
                    <td className="py-3 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
                    <td className="py-3 text-right"><Skeleton className="h-4 w-14 ml-auto" /></td>
                  </tr>
                ))
              ) : !portfolio?.positions?.length ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-gray-400 dark:text-gray-600 italic">
                    No positions yet
                  </td>
                </tr>
              ) : (
                portfolio.positions.map((p, i) => {
                  const gain = fmtPct(p.latest_price, p.average_cost);
                  const pos  = gain.startsWith('+');
                  return (
                    <tr key={i} className="border-b border-gray-200 dark:border-gray-700/50 last:border-0">
                      <td className="py-3 font-bold">{p.symbol}</td>
                      <td className="py-3 text-gray-500 dark:text-gray-400">{parseFloat(p.quantity)}</td>
                      <td className="py-3 text-right font-semibold">{fmt(p.market_value)}</td>
                      <td className={`py-3 text-right font-bold ${pos ? 'text-[#e07a5f]' : 'text-gray-500 dark:text-gray-400'}`}>{gain}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Allocation + Activity */}
        <div className="lg:col-span-3 space-y-4">
          <div className={`${CARD} p-4 sm:p-5`}>
            <h3 className="italic font-bold text-sm mb-3">Allocation</h3>
            {loading ? (
              <Skeleton className="h-28 w-full" />
            ) : allocationData.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-600 italic">No positions</p>
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-28 w-28 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={allocationData} innerRadius={18} outerRadius={38} paddingAngle={3} dataKey="value" stroke="none">
                        {allocationData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs space-y-1.5">
                  {allocationData.map(item => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 shrink-0 rounded-sm" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-600 dark:text-gray-300">{item.name} {item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={`${CARD} p-4 sm:p-5`}>
            <h3 className="italic font-bold text-sm mb-3">Summary</h3>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : portfolio ? (
              <div className="space-y-2 text-xs">
                {[
                  ['Market value', fmt(portfolio.total_market_value)],
                  ['Unrealized P&L', fmt(portfolio.unrealized_pnl)],
                  ['Realized P&L',   fmt(portfolio.realized_pnl)],
                  ['Cash reserved',  fmt(portfolio.cash.reserved)],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between border-b border-dashed border-gray-300 dark:border-gray-700 pb-1.5 last:border-0">
                    <span className="text-gray-500 dark:text-gray-400">{label}</span>
                    <span className="font-bold">{val}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

      </div>

      <TransactionModal type="deposit"  isOpen={depositOpen}  onClose={() => setDepositOpen(false)}  onSuccess={load} />
      <TransactionModal type="withdraw" isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} onSuccess={load} />
    </div>
  );
}
