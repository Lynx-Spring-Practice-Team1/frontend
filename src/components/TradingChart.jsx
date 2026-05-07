import React, { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import { useMarketData, TICKERS } from '../context/MarketDataContext';

const TradingChart = ({ isDark = false }) => {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);

    const [activeTicker, setActiveTicker] = useState('AAPL');
    const activeTickerRef = useRef('AAPL');

    const { latestUpdate, getCandleData } = useMarketData();

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

    const colors = {
        light: { textColor: '#333333', background: '#ffffff' },
        dark: { textColor: '#d1d5db', background: 'transparent' },
    };
    const currentColors = isDark ? colors.dark : colors.light;

    const tickerButtonActiveStyle = {
        backgroundColor: isDark ? '#3d2e26' : 'rgb(235, 219, 211)',
        color: isDark ? '#ffffff' : 'rgb(51, 51, 51)',
        borderColor: '#d9774a',
    };

    // Initialize chart once and load any persisted candles
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
            height: 300,
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
            chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chartRef.current.remove();
        };
    }, []);

    // Sync theme changes
    useEffect(() => {
        chartRef.current?.applyOptions({
            layout: {
                textColor: currentColors.textColor,
                background: { type: 'solid', color: currentColors.background },
            },
        });
    }, [isDark, currentColors.textColor, currentColors.background]);

    // Forward live candle updates from the context to the chart series
    useEffect(() => {
        if (!latestUpdate || latestUpdate.ticker !== activeTickerRef.current) return;
        seriesRef.current?.update(latestUpdate.candle);
    }, [latestUpdate]);

    const handleTickerChange = (ticker) => {
        activeTickerRef.current = ticker;
        setActiveTicker(ticker);

        if (!seriesRef.current) return;

        seriesRef.current.setData(getCandleData(ticker));
        chartRef.current.timeScale().fitContent();
    };

    const handleGoToRealtime = () => {
        chartRef.current?.timeScale().scrollToRealTime();
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <div style={tickerButtonContainerStyle}>
                {TICKERS.map((ticker) => (
                    <button
                        key={ticker}
                        style={activeTicker === ticker
                            ? { ...tickerButtonStyle, ...tickerButtonActiveStyle }
                            : tickerButtonStyle}
                        onClick={() => handleTickerChange(ticker)}
                    >
                        {ticker}
                    </button>
                ))}
            </div>
            <div ref={chartContainerRef} />
            <div style={buttonContainerStyle}>
                <button style={buttonStyle} onClick={handleGoToRealtime}>
                    Go to realtime
                </button>
            </div>
        </div>
    );
};

const tickerButtonContainerStyle = {
    display: 'flex',
    gap: '8px',
    marginBottom: '10px',
};

const buttonContainerStyle = {
    display: 'flex',
    gap: '8px',
    marginTop: '10px',
};

const buttonStyle = {
    fontFamily: 'sans-serif',
    fontSize: '16px',
    padding: '8px 24px',
    backgroundColor: '#f0f3fa',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
};

export default TradingChart;
