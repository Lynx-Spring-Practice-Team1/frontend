import React, { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import { useMarketData } from '../context/MarketDataContext';

// ── Candle validation & sanitization ─────────────────────────────────────────

function isValidCandle(c) {
    return (
        c != null &&
        Number.isFinite(Number(c.time)) && Number(c.time) > 0 &&
        Number.isFinite(Number(c.open)) &&
        Number.isFinite(Number(c.high)) &&
        Number.isFinite(Number(c.low)) &&
        Number.isFinite(Number(c.close))
    );
}

// Filters invalid entries, sorts by time ascending, deduplicates (last entry wins per timestamp).
// lightweight-charts requires strictly ascending time with no duplicates — this enforces it.
function sanitizeCandles(candles) {
    if (!Array.isArray(candles)) return [];
    const valid = candles
        .filter(isValidCandle)
        .map(c => ({
            time:  Number(c.time),
            open:  Number(c.open),
            high:  Number(c.high),
            low:   Number(c.low),
            close: Number(c.close),
        }));
    valid.sort((a, b) => a.time - b.time);
    return valid.reduce((acc, c) => {
        if (acc.length > 0 && acc[acc.length - 1].time === c.time) {
            acc[acc.length - 1] = c; // deduplicate: keep last
        } else {
            acc.push(c);
        }
        return acc;
    }, []);
}

// ── Error boundary — last line of defence against page blackout ───────────────

class ChartErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { crashed: false };
    }

    static getDerivedStateFromError() {
        return { crashed: true };
    }

    componentDidCatch(error, info) {
        console.error('[TradingChart] render crash caught by boundary:', error, info);
    }

    render() {
        if (this.state.crashed) {
            const { height = 400, isDark = false } = this.props;
            return (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', height, gap: 12,
                    color: isDark ? '#9ca3af' : '#6b7280',
                }}>
                    <p style={{ fontSize: 13, fontStyle: 'italic', margin: 0 }}>
                        Chart encountered an error
                    </p>
                    <button
                        onClick={() => this.setState({ crashed: false })}
                        style={{
                            fontSize: 13, padding: '6px 16px', borderRadius: 8,
                            border: '1px solid #d9774a', color: '#d9774a',
                            background: 'transparent', cursor: 'pointer',
                        }}
                    >
                        Reload chart
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// ── Chart inner component ─────────────────────────────────────────────────────

const TradingChartInner = ({ isDark = false, activeTicker = '', onTickerChange, height = 400 }) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const activeTickerRef = useRef(activeTicker);

    const { latestUpdate, getCandleData, historyLoaded, tickers } = useMarketData();

    const colors = {
        light: { textColor: '#333333', background: '#e8e8e8' },
        dark:  { textColor: '#d1d5db', background: 'transparent' },
    };
    const currentColors = isDark ? colors.dark : colors.light;

    const tickerButtonStyle = {
        fontFamily: 'sans-serif', fontSize: '14px', fontWeight: '600',
        padding: '6px 20px',
        backgroundColor: isDark ? '#3d2e26' : 'rgb(235, 219, 211)',
        color: isDark ? '#ffffff' : 'rgb(51, 51, 51)',
        border: '2px solid transparent', borderRadius: '8px',
        borderColor: isDark ? '#3d2e26' : 'rgb(235, 219, 211)',
        cursor: 'pointer',
    };
    const tickerButtonActiveStyle = { borderColor: '#d9774a' };
    const goToRealtimeStyle = {
        fontFamily: 'sans-serif', fontSize: '14px', padding: '6px 20px',
        backgroundColor: isDark ? '#2a2a2a' : '#f0f3fa',
        color: isDark ? '#d1d5db' : '#333',
        border: 'none', borderRadius: '8px', cursor: 'pointer',
    };

    // Safely rebuild the entire series from the current data buffer.
    // Used as a fallback when update() rejects a candle (time went backwards, desync, etc.)
    const safeResetSeries = () => {
        try {
            if (!seriesRef.current) return;
            const data = sanitizeCandles(getCandleData(activeTickerRef.current));
            if (data.length > 0) {
                seriesRef.current.setData(data);
                chartRef.current?.timeScale().fitContent();
            }
        } catch (e) {
            console.error('[TradingChart] safeResetSeries failed:', e);
        }
    };

    // Chart initialisation
    useEffect(() => {
        if (!chartContainerRef.current) return;
        try {
            chartRef.current = createChart(chartContainerRef.current, {
                layout: {
                    textColor: currentColors.textColor,
                    background: { type: 'solid', color: currentColors.background },
                },
                timeScale: { timeVisible: true, secondsVisible: false },
                autoSize: true,
                height,
            });

            seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
                upColor: '#26a69a', downColor: '#ef5350',
                borderVisible: false,
                wickUpColor: '#26a69a', wickDownColor: '#ef5350',
            });

            const initial = sanitizeCandles(getCandleData(activeTickerRef.current));
            if (initial.length > 0) {
                seriesRef.current.setData(initial);
                chartRef.current.timeScale().fitContent();
            }
        } catch (e) {
            console.error('[TradingChart] init failed:', e);
        }

        return () => {
            try { chartRef.current?.remove(); } catch (_) {}
            chartRef.current = null;
            seriesRef.current = null;
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Load historical data once the context has finished fetching
    useEffect(() => {
        if (!historyLoaded || !seriesRef.current) return;
        safeResetSeries();
    }, [historyLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

    // Theme changes
    useEffect(() => {
        try {
            chartRef.current?.applyOptions({
                layout: {
                    textColor: currentColors.textColor,
                    background: { type: 'solid', color: currentColors.background },
                },
            });
        } catch (e) {
            console.error('[TradingChart] applyOptions (theme) failed:', e);
        }
    }, [isDark, currentColors.textColor, currentColors.background]);

    // Height changes
    useEffect(() => {
        try { chartRef.current?.applyOptions({ height }); } catch (_) {}
    }, [height]);

    // Live price tick — the most common crash source
    useEffect(() => {
        if (!latestUpdate || latestUpdate.ticker !== activeTickerRef.current) return;
        if (!isValidCandle(latestUpdate.candle)) return; // drop malformed ticks silently

        const candle = {
            time:  Number(latestUpdate.candle.time),
            open:  Number(latestUpdate.candle.open),
            high:  Number(latestUpdate.candle.high),
            low:   Number(latestUpdate.candle.low),
            close: Number(latestUpdate.candle.close),
        };

        try {
            seriesRef.current?.update(candle);
        } catch (e) {
            // lightweight-charts throws when time goes backwards (DB desync, service restart).
            // Recover by rebuilding the full series from the sanitized in-memory buffer.
            console.warn('[TradingChart] update() rejected — rebuilding series:', e.message);
            safeResetSeries();
        }
    }, [latestUpdate]); // eslint-disable-line react-hooks/exhaustive-deps

    // Ticker switch
    useEffect(() => {
        if (activeTicker === activeTickerRef.current) return;
        activeTickerRef.current = activeTicker;
        safeResetSeries();
    }, [activeTicker]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <div
                className="thin-scrollbar"
                style={{ display: 'flex', gap: '8px', marginBottom: '10px', overflowX: 'auto', paddingBottom: '4px' }}
            >
                {tickers.map(ticker => (
                    <button
                        key={ticker}
                        style={
                            activeTicker === ticker
                                ? { ...tickerButtonStyle, ...tickerButtonActiveStyle, flexShrink: 0 }
                                : { ...tickerButtonStyle, flexShrink: 0 }
                        }
                        onClick={() => onTickerChange?.(ticker)}
                    >
                        {ticker}
                    </button>
                ))}
            </div>
            <div ref={chartContainerRef} />
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                    style={goToRealtimeStyle}
                    onClick={() => {
                        try { chartRef.current?.timeScale().scrollToRealTime(); } catch (_) {}
                    }}
                >
                    Go to realtime
                </button>
            </div>
        </div>
    );
};

// ── Public export — wrapped in error boundary ─────────────────────────────────

const TradingChart = (props) => (
    <ChartErrorBoundary height={props.height} isDark={props.isDark}>
        <TradingChartInner {...props} />
    </ChartErrorBoundary>
);

export default TradingChart;
