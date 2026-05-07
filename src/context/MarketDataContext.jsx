import { createContext, useContext, useEffect, useRef, useState } from 'react';

const WS_URL = 'ws://localhost:8080/ws?api_key=test-api-key&api_secret=test-api-secret';
export const TICKERS = ['AAPL', 'JPM'];
const CANDLE_INTERVAL_SEC = 300; // 5-min candles (sim clock advances 1 market-min per tick)
const STORAGE_KEY = 'tradingChart_candles';
const MAX_STORED_CANDLES = 2000;

function bucketTime(marketTime) {
    const sec = Math.floor(new Date(marketTime).getTime() / 1000);
    return Math.floor(sec / CANDLE_INTERVAL_SEC) * CANDLE_INTERVAL_SEC;
}

function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed.history || !parsed.current) return null;
        return parsed;
    } catch {
        return null;
    }
}

function saveToStorage(history, current) {
    try {
        const trimmed = {};
        for (const ticker of TICKERS) {
            const h = history[ticker] ?? [];
            trimmed[ticker] = h.length > MAX_STORED_CANDLES
                ? h.slice(h.length - MAX_STORED_CANDLES)
                : h;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ history: trimmed, current }));
    } catch {
        // Quota exceeded or private mode — silently ignore
    }
}

const MarketDataContext = createContext(null);

export function MarketDataProvider({ children }) {
    // Refs hold the candle data — no re-render on every tick
    const candleHistoryRef = useRef(null);
    const currentCandleRef = useRef(null);
    if (candleHistoryRef.current === null) {
        const stored = loadFromStorage();
        candleHistoryRef.current = stored?.history ?? { AAPL: [], JPM: [] };
        currentCandleRef.current = stored?.current  ?? { AAPL: null, JPM: null };
    }

    const lastSaveRef = useRef(0);

    // Signals chart consumers that a candle was updated, carrying the ticker
    // and the new candle value so consumers don't need to reach into refs.
    const [latestUpdate, setLatestUpdate] = useState(null);

    useEffect(() => {
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            ws.send(JSON.stringify({
                type: 'SUBSCRIBE',
                payload: { channel: 'PRICE_FEED', tickers: TICKERS },
            }));
        };

        ws.onmessage = (event) => {
            let msg;
            try { msg = JSON.parse(event.data); } catch { return; }

            if (msg.type !== 'PRICE_UPDATE') return;

            const { ticker, price, market_time } = msg.payload ?? {};
            if (!ticker || price == null || !market_time) return;
            if (!TICKERS.includes(ticker)) return;

            const bucketSec = bucketTime(market_time);
            const current = currentCandleRef.current[ticker];

            if (!current || current.time !== bucketSec) {
                if (current) {
                    candleHistoryRef.current[ticker] = [
                        ...candleHistoryRef.current[ticker],
                        current,
                    ];
                }
                currentCandleRef.current[ticker] = {
                    time: bucketSec,
                    open: price,
                    high: price,
                    low: price,
                    close: price,
                };
            } else {
                currentCandleRef.current[ticker] = {
                    ...current,
                    high: Math.max(current.high, price),
                    low: Math.min(current.low, price),
                    close: price,
                };
            }

            setLatestUpdate({ ticker, candle: currentCandleRef.current[ticker] });

            const now = Date.now();
            if (now - lastSaveRef.current > 2000) {
                saveToStorage(candleHistoryRef.current, currentCandleRef.current);
                lastSaveRef.current = now;
            }
        };

        ws.onerror = (err) => console.error('WebSocket error:', err);

        return () => ws.close();
    }, []);

    // Returns all candles (finalized history + in-progress) for a ticker
    function getCandleData(ticker) {
        const history = candleHistoryRef.current[ticker] ?? [];
        const current = currentCandleRef.current[ticker];
        return current ? [...history, current] : [...history];
    }

    return (
        <MarketDataContext.Provider value={{ latestUpdate, getCandleData }}>
            {children}
        </MarketDataContext.Provider>
    );
}

export function useMarketData() {
    return useContext(MarketDataContext);
}
