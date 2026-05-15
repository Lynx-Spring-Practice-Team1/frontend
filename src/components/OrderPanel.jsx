import { useState } from 'react';

const ACCENT = '#d9774a';

export default function OrderPanel({
    isDark = false,
    activeTicker = '',
    currentPrice = 0,
    onSubmit,
    showSymbolInput = false,
    symbolOptions = null,
    onTickerChange,
    positions = [],
}) {
    const [symbol, setSymbol] = useState(activeTicker);
    const [side, setSide] = useState('BUY');
    const [orderType, setOrderType] = useState('Market');
    const [quantity, setQuantity] = useState('');
    const [limitPrice, setLimitPrice] = useState('');
    const [flash, setFlash] = useState(null); // 'success' | 'error'
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const useDropdown = showSymbolInput && Array.isArray(symbolOptions) && symbolOptions.length > 0;
    const dropdownControlled = useDropdown && typeof onTickerChange === 'function';
    const dropdownValue = dropdownControlled ? activeTicker : symbol;

    const isMarket = orderType === 'Market';
    const effectiveTicker = useDropdown
        ? dropdownValue
        : showSymbolInput
            ? symbol.trim().toUpperCase()
            : activeTicker;
    const qty = parseFloat(quantity) || 0;
    const execPrice = isMarket ? currentPrice : (parseFloat(limitPrice) || 0);
    const estimated = execPrice > 0 && qty > 0
        ? (execPrice * qty).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
        : '—';

    const inputClass = `w-full rounded-lg border px-3 py-2 text-sm outline-none ${
        isDark ? 'bg-[#1a1a1a] border-gray-700 text-white' : 'bg-[#f0f0f0] border-gray-400 text-gray-900'
    }`;

    const handlePlace = async () => {
        if (!effectiveTicker) return triggerFlash('error', 'Enter a symbol');
        if (qty <= 0) return triggerFlash('error', 'Enter a quantity');
        if (!isMarket && execPrice <= 0) return triggerFlash('error', 'Enter a limit price');
        if (side === 'SELL') {
            const pos = positions.find(p => p.symbol === effectiveTicker);
            const held = pos ? Math.floor(parseFloat(pos.quantity)) : 0;
            if (held <= 0) return triggerFlash('error', `No ${effectiveTicker} shares to sell`);
            if (qty > held) return triggerFlash('error', `Only ${held} share${held !== 1 ? 's' : ''} available`);
        }

        setSubmitting(true);
        try {
            await onSubmit?.({
                symbol: effectiveTicker,
                side,
                type: orderType,
                qty,
                price: execPrice,
            });

            setQuantity('');
            setLimitPrice('');
            if (showSymbolInput && !useDropdown) setSymbol('');
            triggerFlash('success', 'Order placed');
        } catch (err) {
            triggerFlash('error', err.message || 'Order failed');
        } finally {
            setSubmitting(false);
        }
    };

    const triggerFlash = (type, text) => {
        setFlash(type);
        setMessage(text);
        setTimeout(() => setFlash(null), 2200);
    };

    return (
        <div className={`rounded-xl border p-4 flex flex-col gap-3 ${isDark ? 'bg-[#252525] border-gray-700' : 'bg-[#f0f0f0] border-gray-400'}`}>

            {showSymbolInput && (
                <div className="flex flex-col gap-1">
                    <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Symbol</label>
                    {useDropdown ? (
                        <div className="relative">
                            <select
                                value={dropdownValue}
                                onChange={e => {
                                    if (dropdownControlled) onTickerChange(e.target.value);
                                    else setSymbol(e.target.value);
                                }}
                                className={`${inputClass} appearance-none pr-8 cursor-pointer`}
                            >
                                {symbolOptions.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <span className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>▾</span>
                        </div>
                    ) : (
                        <input
                            type="text"
                            value={symbol}
                            maxLength={5}
                            placeholder="Ticker symbol"
                            onChange={e => setSymbol(e.target.value.toUpperCase())}
                            className={inputClass}
                        />
                    )}
                </div>
            )}

            <div className={`flex rounded-lg overflow-hidden border ${isDark ? 'border-gray-700' : 'border-gray-400'}`}>
                {['BUY', 'SELL'].map(s => (
                    <button
                        key={s}
                        onClick={() => { setSide(s); if (s === 'SELL') setOrderType('Market'); }}
                        className="flex-1 py-2 text-sm font-bold tracking-wide cursor-pointer border-none transition-colors"
                        style={
                            side === s
                                ? { backgroundColor: ACCENT, color: '#fff' }
                                : { backgroundColor: 'transparent', color: isDark ? '#d1d5db' : '#374151' }
                        }
                    >
                        {s}
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-1">
                <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Order type</label>
                <div className="relative">
                    <select
                        value={orderType}
                        onChange={e => setOrderType(e.target.value)}
                        disabled={side === 'SELL'}
                        className={`${inputClass} appearance-none pr-8 ${side === 'SELL' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <option value="Market">Market</option>
                        <option value="Limit">Limit</option>
                    </select>
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>▾</span>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Quantity</label>
                <input
                    type="number"
                    value={quantity}
                    min="1"
                    placeholder="0"
                    onChange={e => setQuantity(e.target.value)}
                    className={inputClass}
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Limit price</label>
                <input
                    type={isMarket ? 'text' : 'number'}
                    value={isMarket ? '' : limitPrice}
                    onChange={e => !isMarket && setLimitPrice(e.target.value)}
                    placeholder="—"
                    disabled={isMarket}
                    className={`${inputClass} ${isMarket ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
            </div>

            <div
                className="flex items-center justify-between rounded-lg px-3 py-2"
                style={{ backgroundColor: isDark ? '#3d2e26' : 'rgb(249, 236, 228)' }}
            >
                <span className={`text-xs italic ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Estimated</span>
                <span className="text-sm font-semibold" style={{ color: isDark ? '#e8a882' : ACCENT }}>
                    {estimated}
                </span>
            </div>

            {flash && (
                <div
                    className={`text-xs text-center py-1.5 rounded-lg font-medium transition-opacity ${
                        flash === 'success'
                            ? 'text-green-500 bg-green-500/10'
                            : 'text-red-400 bg-red-500/10'
                    }`}
                >
                    {message}
                </div>
            )}

            <button
                onClick={handlePlace}
                disabled={submitting}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer border-none hover:opacity-90 active:opacity-75 transition-opacity disabled:opacity-60"
                style={{ backgroundColor: ACCENT }}
            >
                {submitting ? 'Placing…' : `Place ${side.charAt(0) + side.slice(1).toLowerCase()} →`}
            </button>
        </div>
    );
}
