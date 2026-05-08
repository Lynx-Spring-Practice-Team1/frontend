import { useState } from 'react';

const ACCENT = '#d9774a';

export default function OrderPanel({
    isDark = false,
    activeTicker = 'AAPL',
    currentPrice = 0,
    onSubmit,
    showSymbolInput = false,
}) {
    const [symbol, setSymbol]       = useState(activeTicker);
    const [side, setSide]           = useState('BUY');
    const [orderType, setOrderType] = useState('Market');
    const [quantity, setQuantity]   = useState('');
    const [limitPrice, setLimitPrice] = useState('');
    const [flash, setFlash]         = useState(null); // 'success' | 'error'

    const isMarket      = orderType === 'Market';
    const effectiveTicker = showSymbolInput ? symbol.trim().toUpperCase() : activeTicker;
    const qty           = parseFloat(quantity) || 0;
    const execPrice     = isMarket ? currentPrice : (parseFloat(limitPrice) || 0);
    const estimated     = execPrice > 0 && qty > 0
        ? (execPrice * qty).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
        : '—';

    const inputClass = `w-full rounded-lg border px-3 py-2 text-sm outline-none ${
        isDark ? 'bg-[#111] border-[#444] text-white' : 'bg-[#f0f0f0] border-[#d0d0d0] text-gray-900'
    }`;

    const handlePlace = () => {
        if (!effectiveTicker) return triggerFlash('error');
        if (qty <= 0)          return triggerFlash('error');
        if (!isMarket && execPrice <= 0) return triggerFlash('error');

        onSubmit?.({
            symbol: effectiveTicker,
            side,
            type: orderType,
            qty,
            price: execPrice,
        });

        setQuantity('');
        setLimitPrice('');
        if (showSymbolInput) setSymbol('');
        triggerFlash('success');
    };

    const triggerFlash = (type) => {
        setFlash(type);
        setTimeout(() => setFlash(null), 1800);
    };

    return (
        <div className={`rounded-xl border p-4 flex flex-col gap-3 ${isDark ? 'bg-[#1a1a1a] border-[#333]' : 'bg-[#e8e8e8] border-[#d8d8d8]'}`}>

            {/* Symbol input — only shown on Orders page */}
            {showSymbolInput && (
                <div className="flex flex-col gap-1">
                    <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Symbol</label>
                    <input
                        type="text"
                        value={symbol}
                        maxLength={5}
                        placeholder="e.g. AAPL"
                        onChange={e => setSymbol(e.target.value.toUpperCase())}
                        className={inputClass}
                    />
                </div>
            )}

            {/* BUY / SELL toggle */}
            <div className={`flex rounded-lg overflow-hidden border ${isDark ? 'border-[#444]' : 'border-[#d0d0d0]'}`}>
                {['BUY', 'SELL'].map(s => (
                    <button
                        key={s}
                        onClick={() => setSide(s)}
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

            {/* Order type */}
            <div className="flex flex-col gap-1">
                <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Order type</label>
                <div className="relative">
                    <select
                        value={orderType}
                        onChange={e => setOrderType(e.target.value)}
                        className={`${inputClass} appearance-none pr-8 cursor-pointer`}
                    >
                        <option value="Market">Market</option>
                        <option value="Limit">Limit</option>
                    </select>
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>▾</span>
                </div>
            </div>

            {/* Quantity */}
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

            {/* Limit price */}
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

            {/* Estimated */}
            <div
                className="flex items-center justify-between rounded-lg px-3 py-2"
                style={{ backgroundColor: isDark ? '#3d2e26' : 'rgb(249, 236, 228)' }}
            >
                <span className={`text-xs italic ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Estimated</span>
                <span className="text-sm font-semibold" style={{ color: isDark ? '#e8a882' : ACCENT }}>
                    {estimated}
                </span>
            </div>

            {/* Flash feedback */}
            {flash && (
                <div
                    className={`text-xs text-center py-1.5 rounded-lg font-medium transition-opacity ${
                        flash === 'success'
                            ? 'text-green-500 bg-green-500/10'
                            : 'text-red-400 bg-red-500/10'
                    }`}
                >
                    {flash === 'success' ? 'Order placed!' : 'Fill in all required fields'}
                </div>
            )}

            {/* Place button */}
            <button
                onClick={handlePlace}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer border-none hover:opacity-90 active:opacity-75 transition-opacity"
                style={{ backgroundColor: ACCENT }}
            >
                Place {side.charAt(0) + side.slice(1).toLowerCase()} →
            </button>
        </div>
    );
}
