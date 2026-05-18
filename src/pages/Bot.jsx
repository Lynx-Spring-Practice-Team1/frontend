import { useCallback, useEffect, useState } from 'react';
import {
    AlertCircle,
    CheckCircle2,
    SlidersHorizontal,
    Play,
    Square,
    TrendingUp,
    ChevronDown,
} from 'lucide-react';
import { useMarketData } from '../context/useMarketData';

const CARD = 'bg-[#f0f0f0] dark:bg-[#252525] border border-gray-400 dark:border-gray-700 rounded-xl transition-colors';
const INPUT = 'w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#e07a5f]';
const BUTTON = 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

const DEFAULT_CONFIG = {
    stop_loss_pct: 0.02,
    max_balance_pct: 0.20,
    max_open_orders: 3,
    daily_loss_limit_pct: 0.05,
    max_drawdown_pct: 0.10,
    fast_period: 5,
    slow_period: 20,
};

const CONFIG_META = {
    stop_loss_pct:        { label: 'Stop Loss %',          desc: 'Cut position when unrealized loss hits this (e.g. 0.02 = 2%)',    step: 0.001 },
    max_balance_pct:      { label: 'Max Balance Per Trade', desc: 'Max fraction of wallet used per order (e.g. 0.20 = 20%)',         step: 0.01  },
    max_open_orders:      { label: 'Max Open Orders',       desc: 'Bot stops placing new orders above this count',                   step: 1     },
    daily_loss_limit_pct: { label: 'Daily Loss Limit %',    desc: 'Bot auto-pauses if daily loss exceeds this (e.g. 0.05 = 5%)',    step: 0.001 },
    max_drawdown_pct:     { label: 'Max Drawdown %',        desc: 'Bot auto-pauses if balance drops this % from peak',              step: 0.001 },
    fast_period:          { label: 'EMA Fast Period',       desc: 'Fast EMA window in ticks (default 5)',                           step: 1     },
    slow_period:          { label: 'EMA Slow Period',       desc: 'Slow EMA window in ticks (default 20)',                          step: 1     },
};

const statusColorMap = {
    active:      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700',
    paused:      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700',
    halted:      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700',
    deactivated: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-300 dark:border-gray-600',
    error:       'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700',
};

function StatusMessage({ type, children }) {
    if (!children) return null;
    const Icon = type === 'success' ? CheckCircle2 : AlertCircle;
    const styles = type === 'success'
        ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300'
        : 'border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300';
    return (
        <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${styles}`}>
            <Icon size={14} className="mt-0.5 shrink-0" />
            <span>{children}</span>
        </div>
    );
}

function ActivateForm({ onSuccess }) {
    const { tickers } = useMarketData();
    const [selected, setSelected] = useState([]);
    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const [tweaksOpen, setTweaksOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null); // { activated, skipped, failed }

    const toggle = (ticker) => {
        setSelected(prev =>
            prev.includes(ticker) ? prev.filter(t => t !== ticker) : [...prev, ticker]
        );
    };

    const selectAll = () => setSelected([...tickers]);
    const clearAll = () => setSelected([]);

    const handleConfigChange = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
    };

    const isDefault = JSON.stringify(config) === JSON.stringify(DEFAULT_CONFIG);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selected.length === 0) return;
        setLoading(true);
        setResults(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Not authenticated');

            const res = await fetch('/api/bots/activate-all', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ symbols: selected, strategy_config: config }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to activate bots');
            }

            const data = await res.json();
            setResults({
                activated: data.activated.map(a => a.symbol),
                skipped: data.skipped,
                failed: [],
            });
            setSelected([]);
            if (onSuccess) setTimeout(onSuccess, 800);
        } catch (err) {
            setResults({ activated: [], skipped: [], failed: [err.message] });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={CARD}>
            <div className="p-6 border-b border-gray-300 dark:border-gray-600 flex items-center gap-3">
                <TrendingUp size={22} className="text-[#d9774a]" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 italic">Activate Trading Bots</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Ticker grid */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Select Tickers
                            {selected.length > 0 && (
                                <span className="ml-2 text-[#d9774a]">({selected.length} selected)</span>
                            )}
                        </span>
                        <div className="flex gap-2">
                            <button type="button" onClick={selectAll}
                                className="text-xs text-[#d9774a] hover:underline font-bold">
                                Select All
                            </button>
                            <span className="text-gray-300 dark:text-gray-600">|</span>
                            <button type="button" onClick={clearAll}
                                className="text-xs text-gray-500 dark:text-gray-400 hover:underline">
                                Clear
                            </button>
                        </div>
                    </div>

                    <div className="h-44 overflow-y-auto rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a1a1a] p-2">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1">
                            {tickers.map(ticker => {
                                const checked = selected.includes(ticker);
                                return (
                                    <button
                                        key={ticker}
                                        type="button"
                                        onClick={() => toggle(ticker)}
                                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-mono font-bold transition-colors ${
                                            checked
                                                ? 'bg-[#d9774a] text-white'
                                                : 'bg-gray-100 dark:bg-[#252525] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {ticker}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Tweaks + Activate row */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setTweaksOpen(o => !o)}
                        className={`${BUTTON} border px-3 py-2 gap-1.5 ${
                            tweaksOpen || !isDefault
                                ? 'border-[#d9774a] text-[#d9774a] bg-orange-50 dark:bg-orange-950/20'
                                : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                        <SlidersHorizontal size={15} />
                        Tweaks
                        {!isDefault && <span className="h-2 w-2 rounded-full bg-[#d9774a]" />}
                    </button>

                    <button
                        type="submit"
                        disabled={loading || selected.length === 0}
                        className={`${BUTTON} flex-1 bg-[#d9774a] hover:bg-[#c56a3d] text-white`}
                    >
                        <Play size={15} />
                        {loading
                            ? 'Activating…'
                            : selected.length === 0
                                ? 'Select tickers above'
                                : `Activate ${selected.length} Bot${selected.length > 1 ? 's' : ''}`}
                    </button>
                </div>

                {/* Tweaks panel */}
                {tweaksOpen && (
                    <div className="rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                        <div className="px-4 py-2.5 bg-gray-100 dark:bg-[#1e1e1e] border-b border-gray-300 dark:border-gray-600 flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                Bot Parameters (applied to all selected tickers)
                            </span>
                            {!isDefault && (
                                <button type="button" onClick={() => setConfig(DEFAULT_CONFIG)}
                                    className="text-xs text-[#d9774a] hover:underline">
                                    Reset to defaults
                                </button>
                            )}
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.entries(CONFIG_META).map(([key, meta]) => (
                                <label key={key} className="block">
                                    <span className="mb-1 block text-xs font-bold text-gray-600 dark:text-gray-400">{meta.label}</span>
                                    <input
                                        type="number"
                                        step={meta.step}
                                        value={config[key]}
                                        onChange={e => handleConfigChange(key, e.target.value)}
                                        className={INPUT}
                                    />
                                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{meta.desc}</p>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Activation results */}
                {results && (
                    <div className="space-y-1.5 text-xs">
                        {results.activated.length > 0 && (
                            <div className="flex items-start gap-2 rounded-lg border border-green-300 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300 px-3 py-2">
                                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                                <span>Activated: <strong>{results.activated.join(', ')}</strong></span>
                            </div>
                        )}
                        {results.skipped.length > 0 && (
                            <div className="flex items-start gap-2 rounded-lg border border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-300 px-3 py-2">
                                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                <span>Already running (skipped): <strong>{results.skipped.join(', ')}</strong></span>
                            </div>
                        )}
                        {results.failed.length > 0 && (
                            <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300 px-3 py-2">
                                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                <span>{results.failed.join(', ')}</span>
                            </div>
                        )}
                    </div>
                )}
            </form>
        </div>
    );
}

function BotSessionCard({ session, onRefresh, onAction }) {
    const [actionLoading, setActionLoading] = useState(null);
    const sid = session.session_id;

    const handleAction = async (action) => {
        setActionLoading(action);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/bots/${action}?session_id=${sid}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || `Failed to ${action} bot`);
            }
            onAction(action, null);
            onRefresh();
        } catch (err) {
            onAction(action, err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const isActive = session.status === 'active';
    const isPaused = session.status === 'paused';

    return (
        <div className={`${CARD} p-4`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">{session.symbol}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${statusColorMap[session.status] || statusColorMap.deactivated}`}>
                            {session.status.toUpperCase()}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-mono truncate">
                        {String(sid).slice(0, 8)}…
                    </p>
                </div>
                <button
                    onClick={async () => {
                        setActionLoading('remove');
                        try {
                            const token = localStorage.getItem('token');
                            const res = await fetch(`/api/bots/remove/${sid}`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` },
                            });
                            if (!res.ok) {
                                const err = await res.json();
                                throw new Error(err.detail || 'Failed to remove bot');
                            }
                            onAction('remove', null);
                            onRefresh();
                        } catch (err) {
                            onAction('remove', err.message);
                        } finally {
                            setActionLoading(null);
                        }
                    }}
                    disabled={actionLoading !== null}
                    className="h-7 w-7 flex items-center justify-center rounded border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                    <X size={13} />
                </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                <div className="bg-gray-100 dark:bg-[#1a1a1a] rounded p-2">
                    <p className="text-gray-400 uppercase tracking-wider mb-0.5">P&L Today</p>
                    <p className={`font-bold ${(session.daily_pnl || 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        ${parseFloat(session.daily_pnl || 0).toFixed(2)}
                    </p>
                </div>
                <div className="bg-gray-100 dark:bg-[#1a1a1a] rounded p-2">
                    <p className="text-gray-400 uppercase tracking-wider mb-0.5">Trades</p>
                    <p className="font-bold text-gray-900 dark:text-gray-100">{session.trades_count || 0}</p>
                </div>
                <div className="bg-gray-100 dark:bg-[#1a1a1a] rounded p-2">
                    <p className="text-gray-400 uppercase tracking-wider mb-0.5">Win Rate</p>
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                        {session.win_rate ? (session.win_rate * 100).toFixed(1) : '—'}%
                    </p>
                </div>
            </div>

            {session.position_side && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-2 mb-4 text-xs text-blue-700 dark:text-blue-300">
                    <strong>Open:</strong> {session.position_side} {parseFloat(session.entry_quantity || 0).toFixed(4)} @ ${parseFloat(session.entry_price || 0).toFixed(2)}
                </div>
            )}

            <div className="flex gap-2">
                {!isActive && (
                    <button onClick={() => handleAction('start')} disabled={actionLoading !== null}
                        className={`${BUTTON} flex-1 bg-green-600 hover:bg-green-700 text-white`}>
                        <Play size={13} /> Start
                    </button>
                )}
                {isActive && (
                    <>
                        <button onClick={() => handleAction('stop')} disabled={actionLoading !== null}
                            className={`${BUTTON} flex-1 bg-red-600 hover:bg-red-700 text-white`}>
                            <Square size={13} /> Stop
                        </button>
                        {!isPaused ? (
                            <button onClick={() => handleAction('pause')} disabled={actionLoading !== null}
                                className={`${BUTTON} flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`}>
                                <Pause size={13} /> Pause
                            </button>
                        ) : (
                            <button onClick={() => handleAction('resume')} disabled={actionLoading !== null}
                                className={`${BUTTON} flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`}>
                                <Play size={13} /> Resume
                            </button>
                        )}
                    </>
                )}
                <button onClick={() => handleAction('restart')} disabled={actionLoading !== null}
                    className={`${BUTTON} border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800`}
                    title="Restart">
                    <RotateCcw size={13} />
                </button>
            </div>
        </div>
    );
}

export default function Bot() {
    const [runningCount, setRunningCount] = useState(0);
    const [stopping, setStopping] = useState(false);
    const [message, setMessage] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Lightweight poll — only fetch the count, not full session data
    useEffect(() => {
        let active = true;
        async function poll() {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/bots/', { headers: { 'Authorization': `Bearer ${token}` } });
                if (!res.ok || !active) return;
                const data = await res.json();
                const items = data.items || [];
                setRunningCount(items.filter(s => s.status === 'active').length);
            } catch { /* ignore */ }
        }
        poll();
        const id = setInterval(poll, 15_000);
        return () => { active = false; clearInterval(id); };
    }, [refreshTrigger]);

    const handleStopAll = async () => {
        setStopping(true);
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/bots/stop-all', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Stop all failed');
            }
            const data = await res.json();
            setMessage({ type: 'success', text: `Stopped ${data.stopped} bot(s)` });
            setTimeout(() => setRefreshTrigger(p => p + 1), 600);
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setStopping(false);
            setTimeout(() => setMessage(''), 4000);
        }
    };

    return (
        <div className="space-y-6">
            <ActivateForm onSuccess={() => setRefreshTrigger(p => p + 1)} />

            <div className="flex items-center gap-3">
                <button
                    onClick={handleStopAll}
                    disabled={stopping || runningCount === 0}
                    className={`${BUTTON} bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 disabled:opacity-40`}
                >
                    <Square size={15} />
                    {stopping ? 'Stopping…' : `Stop${runningCount > 0 ? ` (${runningCount})` : ''}`}
                </button>
                {message && <StatusMessage type={message.type}>{message.text}</StatusMessage>}
            </div>
        </div>
    );
}
