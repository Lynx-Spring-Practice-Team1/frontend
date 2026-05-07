import React, { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import { useMarketData, TICKERS } from '../context/MarketDataContext';

const TradingChart = ({ isDark = false, activeTicker = 'AAPL', onTickerChange, height = 400 }) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const activeTickerRef = useRef(activeTicker);

    const { latestUpdate, getCandleData, historyLoaded } = useMarketData();

    const colors = {
        light: { textColor: '#333333', background: '#e8e8e8' },
        dark:  { textColor: '#d1d5db', background: 'transparent' },
    };
    const currentColors = isDark ? colors.dark : colors.light;

    const tickerButtonStyle = {
        fontFamily: 'sans-serif',
        fontSize: '14px',
        fontWeight: '600',
        padding: '6px 20px',
        backgroundColor: isDark ? '#3d2e26' : 'rgb(235, 219, 211)',
        color: isDark ? '#ffffff' : 'rgb(51, 51, 51)',
        border: '2px solid transparent',
        borderRadius: '8px',
        borderColor: isDark ? '#3d2e26' : 'rgb(235, 219, 211)',
        cursor: 'pointer',
    };

    const tickerButtonActiveStyle = {
        borderColor: '#d9774a',
    };

    const goToRealtimeStyle = {
        fontFamily: 'sans-serif',
        fontSize: '14px',
        padding: '6px 20px',
        backgroundColor: isDark ? '#2a2a2a' : '#f0f3fa',
        color: isDark ? '#d1d5db' : '#333',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
    };

    useEffect(() => {
        chartRef.current = createChart(chartContainerRef.current, {
            layout: {
                textColor: currentColors.textColor,
                background: { type: 'solid', color: currentColors.background },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
            height: height,
            width: chartContainerRef.current.clientWidth,
        });

        seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });

        const initial = getCandleData(activeTickerRef.current);
        if (initial.length > 0) {
            seriesRef.current.setData(initial);
            chartRef.current.timeScale().fitContent();
        }

        const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chartRef.current.remove();
        };
    }, []);

    useEffect(() => {
        if (!historyLoaded || !seriesRef.current) return;
        const data = getCandleData(activeTickerRef.current);
        if (data.length > 0) {
            seriesRef.current.setData(data);
            chartRef.current?.timeScale().fitContent();
        }
    }, [historyLoaded]);

    useEffect(() => {
        chartRef.current?.applyOptions({
            layout: {
                textColor: currentColors.textColor,
                background: { type: 'solid', color: currentColors.background },
            },
        });
    }, [isDark, currentColors.textColor, currentColors.background]);

    useEffect(() => {
        chartRef.current?.applyOptions({ height });
    }, [height]);

    useEffect(() => {
        if (!latestUpdate || latestUpdate.ticker !== activeTickerRef.current) return;
        seriesRef.current?.update(latestUpdate.candle);
    }, [latestUpdate]);

    useEffect(() => {
        if (activeTicker === activeTickerRef.current) return;
        activeTickerRef.current = activeTicker;
        if (!seriesRef.current) return;
        seriesRef.current.setData(getCandleData(activeTicker));
        chartRef.current?.timeScale().fitContent();
    }, [activeTicker]);

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                {TICKERS.map(ticker => (
                    <button
                        key={ticker}
                        style={
                            activeTicker === ticker
                                ? { ...tickerButtonStyle, ...tickerButtonActiveStyle }
                                : tickerButtonStyle
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
                    onClick={() => chartRef.current?.timeScale().scrollToRealTime()}
                >
                    Go to realtime
                </button>
            </div>
        </div>
    );
};

export default TradingChart;
