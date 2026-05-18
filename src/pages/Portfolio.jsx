import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { useMarketData } from '../context/useMarketData';
import { TrendingUp, Wallet, BadgeDollarSign, Plus, Download, RefreshCw, TrendingDown } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';


const COLORS = ['#e07a5f', '#3d405b', '#81b29a', '#9ca3af', '#f2cc8f', '#6d6875'];
const CARD = 'bg-[#f0f0f0] dark:bg-[#252525] border border-gray-400 dark:border-gray-700 rounded-xl transition-colors';

const AllocationChart = memo(({ data }) => (
  <div className="flex items-center gap-3">
    <div className="h-28 w-28 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} innerRadius={18} outerRadius={38} paddingAngle={3} dataKey="value" stroke="none">
            {data.map((e, i) => <Cell key={i} fill={e.color} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div className="text-xs space-y-1.5">
      {data.map(item => (
        <div key={item.name} className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 shrink-0 rounded-sm" style={{ backgroundColor: item.color }} />
          <span className="text-gray-600 dark:text-gray-300">{item.name} {item.value}%</span>
        </div>
      ))}
    </div>
  </div>
));

const fmt = v => `$${parseFloat(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtPct = (latest, avg) => {
  const a = parseFloat(avg);
  if (!a) return '—';
  const pct = ((parseFloat(latest) - a) / a) * 100;
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
};

function StatCard({ icon: Icon, label, value, sub, valueClass }) {
  return (
    <div className={`${CARD} p-4 flex flex-col gap-1 min-w-0`}>
      <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 mb-1 min-w-0">
        <Icon size={14} className="shrink-0" />
        <span className="text-xs uppercase tracking-wider font-medium truncate">{label}</span>
      </div>
      <span className={`text-2xl font-bold ${valueClass ?? 'text-gray-900 dark:text-gray-100'}`}>{value}</span>
      {sub && <span className="text-xs text-gray-400 dark:text-gray-600">{sub}</span>}
    </div>
  );
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
    const endpoint = type === 'deposit' ? '/api/wallet/deposit' : '/api/wallet/withdraw';
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

      window.dispatchEvent(new CustomEvent('wallet-updated'));
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [sellTarget, setSellTarget] = useState(null); // { symbol, maxQty }
  const [sellQty, setSellQty] = useState('');
  const [sellError, setSellError] = useState(null);
  const [sellSubmitting, setSellSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    fetch('/api/portfolio', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(r => { console.log('Portfolio data:', r); return r; })
      .then(data => setPortfolio(data))
      .catch(err => setError(String(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const { lastOrderUpdate, latestUpdate } = useMarketData();

  // Session performance chart
  const [performanceData, setPerformanceData] = useState([]);
  const equityHistoryRef = useRef(null); // null = not yet loaded from DB

  const fmtSnapTime = iso =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Load existing snapshots from DB on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/portfolio/equity-snapshots', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(rows => {
        const loaded = rows.map(r => ({ time: fmtSnapTime(r.time), value: parseFloat(r.value) }));
        equityHistoryRef.current = loaded;
        setPerformanceData(loaded);
      })
      .catch(() => { equityHistoryRef.current = []; });
  }, []);

  const snapshotEquity = useRef(() => { });
  snapshotEquity.current = () => {
    if (equityHistoryRef.current === null) return; // still loading
    const equity = parseFloat(portfolio?.total_equity);
    if (!equity || equity <= 0) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const next = [...equityHistoryRef.current, { time, value: equity }].slice(-10);
    equityHistoryRef.current = next;
    setPerformanceData([...next]);
    // Persist to DB
    const token = localStorage.getItem('token');
    fetch('/api/portfolio/equity-snapshots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ value: equity }),
    }).catch(() => { });
  };

  // Take first snapshot as soon as portfolio loads
  useEffect(() => {
    if (portfolio?.total_equity) snapshotEquity.current();
  }, [!!portfolio?.total_equity]);

  // Then snapshot every 30 seconds
  useEffect(() => {
    const id = setInterval(() => snapshotEquity.current(), 30_000);
    return () => clearInterval(id);
  }, []);

  // When a fill or cancel arrives, reload portfolio from API (quantity/pnl changed)
  useEffect(() => {
    if (!lastOrderUpdate) return;
    if (['FILLED', 'CANCELLED', 'REJECTED'].includes(lastOrderUpdate.status)) {
      load();
    }
  }, [lastOrderUpdate]);

  // Patch latest_price and market_value live from every price tick — no API call
  useEffect(() => {
    if (!latestUpdate || !portfolio?.positions?.length) return;
    const { ticker, candle } = latestUpdate;
    setPortfolio(prev => {
      if (!prev?.positions) return prev;
      const positions = prev.positions.map(p => {
        if (p.symbol !== ticker) return p;
        const qty = parseFloat(p.quantity);
        const newPrice = candle.close;
        const newMV = qty * newPrice;
        const avgCost = parseFloat(p.average_cost) || 0;
        const unrealized = avgCost > 0 ? (newPrice - avgCost) * qty : 0;
        return { ...p, latest_price: newPrice, market_value: newMV, unrealized_pnl: unrealized };
      });
      const totalMV = positions.reduce((s, p) => s + parseFloat(p.market_value || 0), 0);
      const totalUnrealized = positions.reduce((s, p) => s + parseFloat(p.unrealized_pnl || 0), 0);
      return {
        ...prev,
        positions,
        total_market_value: totalMV,
        unrealized_pnl: totalUnrealized,
        total_equity: totalMV + parseFloat(prev.cash?.available || 0),
      };
    });
  }, [latestUpdate]);

  const handleSell = async () => {
    const qty = parseInt(sellQty, 10);
    if (!qty || qty <= 0 || qty > sellTarget.maxQty) {
      setSellError(`Enter a quantity between 1 and ${sellTarget.maxQty}`);
      return;
    }
    setSellSubmitting(true);
    setSellError(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ symbol: sellTarget.symbol, side: 'SELL', order_type: 'MARKET', quantity: qty }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || `Error ${res.status}`);
      }
      setSellTarget(null);
      setSellQty('');
      load();
    } catch (e) {
      setSellError(e.message);
    } finally {
      setSellSubmitting(false);
    }
  };

  const [sellAllConfirm, setSellAllConfirm] = useState(false);
  const [sellAllLoading, setSellAllLoading] = useState(false);
  const [sellAllError, setSellAllError] = useState(null);

  const handleSellAll = async () => {
    const positions = (portfolio?.positions || []).filter(p => Math.floor(parseFloat(p.quantity)) > 0);
    if (!positions.length) return;
    setSellAllLoading(true);
    setSellAllError(null);
    const token = localStorage.getItem('token');
    try {
      const results = await Promise.allSettled(
        positions.map(p =>
          fetch('/api/orders/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              symbol: p.symbol,
              side: 'SELL',
              order_type: 'MARKET',
              quantity: Math.floor(parseFloat(p.quantity)),
            }),
          }).then(r => r.ok ? r.json() : r.json().then(d => Promise.reject(new Error(d.detail || `Error ${r.status}`))))
        )
      );
      const failed = results.filter(r => r.status === 'rejected');
      if (failed.length) {
        setSellAllError(`${failed.length} order(s) failed: ${failed[0].reason?.message}`);
      }
      load();
    } catch (e) {
      setSellAllError(e.message);
    } finally {
      setSellAllLoading(false);
      setSellAllConfirm(false);
    }
  };

  const [feesPaid, setFeesPaid] = useState(null);
  const [exchangeFeesPaid, setExchangeFeesPaid] = useState(null);
  const [feeRate, setFeeRate] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/orders/my-fees', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setFeesPaid(data.total_fees_paid);
        setExchangeFeesPaid(data.total_exchange_fees);
      })
      .catch(() => { });
  }, [lastOrderUpdate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/orders/fees', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setFeeRate(parseFloat(data.platform_fee_rate)))
      .catch(() => { });
  }, []);

  const totalEquity = portfolio ? fmt(portfolio.total_equity) : null;
  const buyingPower = portfolio ? fmt(portfolio.cash.available) : null;
  const totalGain = portfolio ? parseFloat(portfolio.unrealized_pnl) + parseFloat(portfolio.realized_pnl) : null;
  const totalGainFmt = totalGain != null ? fmt(totalGain) : null;
  const gainPositive = totalGain != null && totalGain >= 0;

  // Stable key: only changes when a position's symbol or quantity changes (not on price ticks)
  const positionsKey = portfolio?.positions?.map(p => `${p.symbol}:${p.quantity}`).join(',') ?? '';
  const allocationData = useMemo(() => {
    if (!portfolio?.positions?.length) return [];
    const totalShares = portfolio.positions.reduce((s, p) => s + parseFloat(p.quantity || 0), 0);
    if (totalShares <= 0) return [];
    return portfolio.positions
      .filter(p => parseFloat(p.quantity) > 0)
      .map((p, i) => ({
        name: p.symbol,
        value: Math.round(parseFloat(p.quantity) / totalShares * 100),
        color: COLORS[i % COLORS.length],
      }));
  }, [positionsKey]);

  return (
    <div className="space-y-4 text-gray-900 dark:text-white">

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black italic tracking-tight">Portfolio Wallet</h1>
        </div>
        <div className="flex flex-wrap gap-2">
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

          {/* Sell All */}
          {!sellAllConfirm ? (
            <button
              onClick={() => { setSellAllConfirm(true); setSellAllError(null); }}
              disabled={!portfolio?.positions?.length}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border border-red-400 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <TrendingDown size={14} />
              Sell All {portfolio?.positions?.length > 0 && `(${portfolio.positions.filter(p => parseFloat(p.quantity) > 0).length})`}
            </button>
          ) : (
            <span className="flex items-center gap-1.5">
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Sell everything?</span>
              <button
                onClick={handleSellAll}
                disabled={sellAllLoading}
                className="px-3 py-2 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 transition-colors"
              >
                {sellAllLoading ? 'Selling…' : 'Confirm'}
              </button>
              <button
                onClick={() => { setSellAllConfirm(false); setSellAllError(null); }}
                className="px-3 py-2 rounded-lg text-xs font-bold border border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-500 border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-2">
          Failed to load portfolio: {error}
        </div>
      )}
      {sellAllError && (
        <div className="text-xs text-red-500 border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-2">
          Sell All: {sellAllError}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`${CARD} p-4 col-span-2 sm:col-span-1 min-w-0`}>
          <span className="text-xs uppercase tracking-wider font-medium text-gray-400 dark:text-gray-500">Total value</span>
          <p className="text-2xl font-bold mt-1 mb-2">{loading ? '—' : totalEquity}</p>
        </div>
        <div className={`${CARD} p-4 flex flex-col gap-1 min-w-0`}>
          <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 mb-1">
            <Wallet size={14} />
            <span className="text-xs uppercase tracking-wider font-medium">Cash</span>
          </div>
          <span className="text-2xl font-bold">{loading ? '—' : buyingPower}</span>
          <span className="text-xs text-gray-400 dark:text-gray-600">Available</span>
        </div>
        <StatCard icon={BadgeDollarSign} label="Exchange fees paid" value={exchangeFeesPaid == null ? '—' : fmt(exchangeFeesPaid)} sub="Total exchange fees" />
        <StatCard icon={BadgeDollarSign} label="Broker fees paid" value={feesPaid == null ? '—' : fmt(feesPaid)} sub="Total platform fees" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Performance chart — session equity snapshots every 30 s */}
        <div className={`${CARD} p-4 sm:p-5 lg:col-span-4`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="italic font-bold text-sm">Performance</h3>
            <span className="text-xs text-gray-400 dark:text-gray-500">Last 10 snapshots  </span>
          </div>
          <div className="h-48 w-full">
            {performanceData.length < 2 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400 dark:text-gray-600 italic">
                Collecting data… (updates every 30 s)
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pfGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e07a5f" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e07a5f" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: 6, fontSize: 11 }}
                    labelStyle={{ color: '#9ca3af' }}
                    formatter={v => [`$${parseFloat(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Equity']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#e07a5f" strokeWidth={2} fillOpacity={1} fill="url(#pfGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
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
                <th className="pb-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                [0, 1, 2].map(i => (
                  <tr key={i} className="border-b border-gray-200 dark:border-gray-700/50">
                    <td className="py-3 font-bold text-gray-300 dark:text-gray-600">——</td>
                    <td className="py-3 text-gray-300 dark:text-gray-600">—</td>
                    <td className="py-3 text-right text-gray-300 dark:text-gray-600">———</td>
                    <td className="py-3 text-right text-gray-300 dark:text-gray-600">——</td>
                    <td className="py-3" />
                  </tr>
                ))
              ) : !portfolio?.positions?.length ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-gray-400 dark:text-gray-600 italic">
                    No positions yet
                  </td>
                </tr>
              ) : (
                portfolio.positions.map((p, i) => {
                  const gain = fmtPct(p.latest_price, p.average_cost);
                  const pos = gain.startsWith('+');
                  const maxQty = Math.floor(parseFloat(p.quantity));
                  const isActive = sellTarget?.symbol === p.symbol;

                  const sellQtyNum = parseInt(sellQty, 10);
                  const currentPrice = parseFloat(p.latest_price || 0);
                  const saleValue = isActive && sellQtyNum > 0 && currentPrice > 0 ? sellQtyNum * currentPrice : 0;
                  const brokerFee = saleValue > 0 && feeRate != null ? saleValue * feeRate : null;
                  const estimatedProceeds = brokerFee != null ? saleValue - brokerFee : null;

                  return (
                    <tr key={i} className="border-b border-gray-200 dark:border-gray-700/50 last:border-0">
                      <td className="py-3 font-bold">{p.symbol}</td>
                      <td className="py-3 text-gray-500 dark:text-gray-400">{parseFloat(p.quantity)}</td>
                      <td className="py-3 text-right font-semibold break-all">{fmt(p.market_value)}</td>
                      <td className={`py-3 text-right font-bold break-all ${pos ? 'text-[#e07a5f]' : 'text-gray-500 dark:text-gray-400'}`}>{gain}</td>
                      <td className="py-3 text-right">
                        {isActive ? (
                          <span className="flex flex-col items-end gap-1">
                            <span className="flex items-center justify-end gap-1">
                              <input
                                type="number" min="1" max={maxQty}
                                value={sellQty}
                                onChange={e => { setSellQty(e.target.value); setSellError(null); }}
                                className="w-14 px-1 py-0.5 text-xs rounded border border-gray-400 dark:border-gray-600 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 text-center"
                                placeholder="qty"
                                autoFocus
                              />
                              <button
                                onClick={handleSell}
                                disabled={sellSubmitting}
                                className="text-xs px-2 py-0.5 rounded bg-[#e07a5f] text-white font-medium disabled:opacity-50"
                              >
                                {sellSubmitting ? '…' : 'Confirm'}
                              </button>
                              <button
                                onClick={() => { setSellTarget(null); setSellQty(''); setSellError(null); }}
                                className="text-xs px-1.5 py-0.5 rounded border border-gray-400 dark:border-gray-600 text-gray-500"
                              >✕</button>
                            </span>
                            {saleValue > 0 && (
                              <span className="text-right leading-relaxed" style={{ fontSize: '10px' }}>
                                <span className="text-gray-500 dark:text-gray-400">{fmt(saleValue)}</span>
                                {brokerFee != null && (
                                  <span className="text-gray-400 dark:text-gray-600"> − {fmt(brokerFee)} broker</span>
                                )}
                                <span className="text-gray-400 dark:text-gray-600"> − exchange fee</span>
                                {estimatedProceeds != null && (
                                  <span className="font-semibold text-gray-700 dark:text-gray-300"> ≈ {fmt(estimatedProceeds)}</span>
                                )}
                              </span>
                            )}
                          </span>
                        ) : (
                          <button
                            onClick={() => { setSellTarget({ symbol: p.symbol, maxQty }); setSellQty(''); setSellError(null); }}
                            className="text-xs px-2.5 py-1 rounded border border-gray-400 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-[#e07a5f] hover:text-[#e07a5f] transition-colors"
                          >
                            Sell
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
              {sellError && (
                <tr>
                  <td colSpan={5} className="pb-2 text-right text-xs text-red-500">{sellError}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Allocation + Activity */}
        <div className="lg:col-span-3 space-y-4">
          <div className={`${CARD} p-4 sm:p-5`}>
            <h3 className="italic font-bold text-sm mb-3">Allocation</h3>
            {loading ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic">Collecting data…</p>
            ) : allocationData.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-600 italic">No positions</p>
            ) : (
              <AllocationChart data={allocationData} />
            )}
          </div>

          <div className={`${CARD} p-4 sm:p-5`}>
            <h3 className="italic font-bold text-sm mb-3">Summary</h3>
            {loading ? (
              <div className="space-y-2 text-xs text-gray-300 dark:text-gray-600">
                {['Market value', 'Unrealized P&L', 'Realized P&L'].map(label => (
                  <div key={label} className="flex justify-between">
                    <span>{label}</span><span>—</span>
                  </div>
                ))}
              </div>
            ) : portfolio ? (
              <div className="space-y-2 text-xs">
                {[
                  ['Market value', fmt(portfolio.total_market_value)],
                  ['Unrealized P&L', fmt(portfolio.unrealized_pnl)],
                  ['Realized P&L', fmt(portfolio.realized_pnl)],
                  ['Cash reserved', fmt(portfolio.cash.reserved)],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between items-baseline gap-2 border-b border-dashed border-gray-300 dark:border-gray-700 pb-1.5 last:border-0">
                    <span className="text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
                    <span className="font-bold text-right break-all min-w-0">{val}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>

      </div>

      <TransactionModal type="deposit" isOpen={depositOpen} onClose={() => setDepositOpen(false)} onSuccess={load} />
      <TransactionModal type="withdraw" isOpen={withdrawOpen} onClose={() => setWithdrawOpen(false)} onSuccess={load} />
    </div>
  );
}
