import React, { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import { useMarketData } from '../context/useMarketData';
import { fetchCandles } from '../context/marketDataApi';

const FIVE_MINUTES_SEC = 5 * 60;
const DAY_SEC = 24 * 60 * 60;

const RANGE_CONFIG = {
    '1d': { value: '1d', label: '1D', rangeSeconds: DAY_SEC, bucketSizeSec: FIVE_MINUTES_SEC },
    '1w': { value: '1w', label: '1W', rangeSeconds: 7 * DAY_SEC, bucketSizeSec: 30 * 60 },
    '1m': { value: '1m', label: '1M', rangeSeconds: 30 * DAY_SEC, bucketSizeSec: 2 * 60 * 60 },
    all: { value: 'all', label: 'All', rangeSeconds: null, bucketSizeSec: DAY_SEC },
};

const CHART_RANGES = Object.values(RANGE_CONFIG);

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

function aggregateCandles(candles, bucketSizeSec = FIVE_MINUTES_SEC) {
    const data = sanitizeCandles(candles);
    if (bucketSizeSec <= FIVE_MINUTES_SEC) return data;

    return data.reduce((acc, candle) => {
        const bucketTime = Math.floor(candle.time / bucketSizeSec) * bucketSizeSec;
        const current = acc[acc.length - 1];

        if (current?.time === bucketTime) {
            current.high = Math.max(current.high, candle.high);
            current.low = Math.min(current.low, candle.low);
            current.close = candle.close;
            return acc;
        }

        acc.push({
            time: bucketTime,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
        });
        return acc;
    }, []);
}

function trimCandlesToRange(candles, range = 'all') {
    const data = sanitizeCandles(candles);
    const rangeSeconds = RANGE_CONFIG[range]?.rangeSeconds;
    if (!rangeSeconds || data.length === 0) return data;

    const latestTime = data[data.length - 1].time;
    const startTime = latestTime - rangeSeconds;
    return data.filter(candle => candle.time >= startTime);
}

function mergeCandle(candles, candle) {
    return sanitizeCandles([...candles, candle]);
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
    const chartRangeRef = useRef('1d');
    const rawDataRef = useRef([]);
    const visibleDataRef = useRef([]);
    const liveFollowRef = useRef(true);
    const suppressRangeChangeRef = useRef(false);
    const [chartRange, setChartRange] = useState('1d');

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
    const rangeButtonStyle = {
        fontFamily: 'sans-serif', fontSize: '13px', fontWeight: '600',
        padding: '6px 12px',
        backgroundColor: isDark ? '#2a2a2a' : '#f0f3fa',
        color: isDark ? '#d1d5db' : '#333',
        border: '1px solid transparent',
        borderRadius: '8px',
        cursor: 'pointer',
    };
    const rangeButtonActiveStyle = {
        borderColor: '#d9774a',
        color: isDark ? '#f2c6ad' : '#b85827',
        backgroundColor: isDark ? '#3d2e26' : 'rgb(249, 236, 228)',
    };

    const scrollToRealtime = () => {
        try { chartRef.current?.timeScale().scrollToRealTime(); } catch {
            // Ignore scroll calls that race with chart teardown.
        }
    };

    const getAggregatedData = (candles = rawDataRef.current, range = chartRangeRef.current) => {
        const trimmed = trimCandlesToRange(candles, range);
        return aggregateCandles(trimmed, RANGE_CONFIG[range]?.bucketSizeSec ?? FIVE_MINUTES_SEC);
    };

    const setSeriesData = (candles, { fit = false, follow = false } = {}) => {
        try {
            if (!seriesRef.current) return;
            const data = sanitizeCandles(candles);
            visibleDataRef.current = data;
            seriesRef.current.setData(data);
            if (data.length === 0) return;

            if (fit) {
                suppressRangeChangeRef.current = true;
                chartRef.current?.timeScale().fitContent();
                window.setTimeout(() => { suppressRangeChangeRef.current = false; }, 0);
            } else if (follow) {
                suppressRangeChangeRef.current = true;
                scrollToRealtime();
                window.setTimeout(() => { suppressRangeChangeRef.current = false; }, 0);
            }
        } catch (e) {
            console.error('[TradingChart] setSeriesData failed:', e);
        }
    };

    const renderCurrentRange = ({ fit = false, follow = false } = {}) => {
        setSeriesData(getAggregatedData(), { fit, follow });
    };

    // Safely rebuild the entire series from the current data buffer.
    // Used as a fallback when update() rejects a candle (time went backwards, desync, etc.)
    const safeResetSeries = () => {
        try {
            const fallbackRawData = sanitizeCandles(getCandleData(activeTickerRef.current));
            rawDataRef.current = fallbackRawData;
            renderCurrentRange({ fit: true });
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

            rawDataRef.current = sanitizeCandles(getCandleData(activeTickerRef.current));
            renderCurrentRange({ fit: true });
        } catch (e) {
            console.error('[TradingChart] init failed:', e);
        }

        return () => {
            try { chartRef.current?.remove(); } catch {
                // Ignore chart cleanup errors from already-disposed instances.
            }
            chartRef.current = null;
            seriesRef.current = null;
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // User interaction: if the user scrolls/zooms away from the latest candle, pause live-follow.
    useEffect(() => {
        const timeScale = chartRef.current?.timeScale();
        if (!timeScale) return;

        const handleVisibleRangeChange = (logicalRange) => {
            if (suppressRangeChangeRef.current || !logicalRange) return;
            const lastIndex = visibleDataRef.current.length - 1;
            if (lastIndex < 0) return;
            liveFollowRef.current = logicalRange.to >= lastIndex - 1;
        };

        timeScale.subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
        return () => {
            try { timeScale.unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange); } catch {
                // Ignore cleanup if the chart was already removed.
            }
        };
    }, []);

    // Load historical data for the selected ticker and simulated range.
    useEffect(() => {
        if (!historyLoaded || !seriesRef.current || !activeTicker) return;
        activeTickerRef.current = activeTicker;
        chartRangeRef.current = chartRange;
        liveFollowRef.current = true;

        let cancelled = false;
        fetchCandles(activeTicker, chartRange)
            .then(candles => {
                if (cancelled) return;
                rawDataRef.current = sanitizeCandles(candles.length > 0 ? candles : getCandleData(activeTicker));
                renderCurrentRange({ fit: true });
            })
            .catch(() => {
                if (!cancelled) safeResetSeries();
            });

        return () => { cancelled = true; };
    }, [activeTicker, chartRange, historyLoaded, getCandleData]); // eslint-disable-line react-hooks/exhaustive-deps

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
        try { chartRef.current?.applyOptions({ height }); } catch {
            // Ignore resize calls that race with chart teardown.
        }
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
            rawDataRef.current = mergeCandle(rawDataRef.current, candle);
            renderCurrentRange({ follow: liveFollowRef.current });
        } catch (e) {
            // lightweight-charts throws when time goes backwards (DB desync, service restart).
            // Recover by rebuilding the full series from the sanitized in-memory buffer.
            console.warn('[TradingChart] update() rejected — rebuilding series:', e.message);
            safeResetSeries();
        }
    }, [latestUpdate]); // eslint-disable-line react-hooks/exhaustive-deps

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
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                <button
                    type="button"
                    style={rangeButtonStyle}
                    onClick={() => {
                        liveFollowRef.current = true;
                        scrollToRealtime();
                    }}
                >
                    Go to realtime
                </button>
                {CHART_RANGES.map(range => (
                    <button
                        key={range.value}
                        type="button"
                        style={
                            chartRange === range.value
                                ? { ...rangeButtonStyle, ...rangeButtonActiveStyle }
                                : rangeButtonStyle
                        }
                        onClick={() => setChartRange(range.value)}
                    >
                        {range.label}
                    </button>
                ))}
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
