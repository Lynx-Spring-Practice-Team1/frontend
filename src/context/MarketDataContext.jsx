import { createContext, useContext, useEffect, useRef, useState } from 'react';

const WS_URL = 'ws://localhost:8080/ws?api_key=test-api-key&api_secret=test-api-secret';
export const TICKERS = ['AAPL', 'JPM'];
const CANDLE_INTERVAL_SEC = 300; // 5-min candles

function bucketTime(marketTime) {
  const sec = Math.floor(new Date(marketTime).getTime() / 1000);
  return Math.floor(sec / CANDLE_INTERVAL_SEC) * CANDLE_INTERVAL_SEC;
}

async function fetchCandles(ticker) {
  try {
    const res = await fetch(`/api/candles?ticker=${ticker}`);
    if (!res.ok) return [];
    const rows = await res.json();
    return rows.map(r => ({
      time:  Number(r.time),
      open:  Number(r.open),
      high:  Number(r.high),
      low:   Number(r.low),
      close: Number(r.close),
    }));
  } catch {
    return [];
  }
}

async function upsertCandle(ticker, candle) {
  try {
    await fetch('/api/candles', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker, ...candle }),
    });
  } catch {
    // Backend unavailable — silently ignore
  }
}

const MarketDataContext = createContext(null);

export function MarketDataProvider({ children }) {
  const candleHistoryRef = useRef(null);
  const currentCandleRef = useRef(null);
  const loadedRef        = useRef(false);

  if (candleHistoryRef.current === null) {
    candleHistoryRef.current = { AAPL: [], JPM: [] };
    currentCandleRef.current = { AAPL: null, JPM: null };
  }

  const lastDbSaveRef = useRef(0);
  const [latestUpdate, setLatestUpdate] = useState(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Load candle history from DB on mount
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    Promise.all(
      TICKERS.map(async ticker => {
        const candles = await fetchCandles(ticker);
        if (candles.length === 0) return;
        // Last stored candle may be an in-progress one — restore it as current
        candleHistoryRef.current[ticker] = candles.slice(0, -1);
        currentCandleRef.current[ticker] = candles[candles.length - 1];
      }),
    ).then(() => setHistoryLoaded(true));
  }, []);

  useEffect(() => {
    let ws = null;
    let reconnectTimer = null;
    let active = true;

    function connect() {
      ws = new WebSocket(WS_URL);

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
        const current   = currentCandleRef.current[ticker];

        if (!current || current.time !== bucketSec) {
          if (current) {
            // Candle finalized — persist immediately
            upsertCandle(ticker, current);
            candleHistoryRef.current[ticker] = [
              ...candleHistoryRef.current[ticker],
              current,
            ];
          }
          currentCandleRef.current[ticker] = {
            time:  bucketSec,
            open:  price,
            high:  price,
            low:   price,
            close: price,
          };
        } else {
          currentCandleRef.current[ticker] = {
            ...current,
            high:  Math.max(current.high, price),
            low:   Math.min(current.low,  price),
            close: price,
          };
        }

        setLatestUpdate({ ticker, candle: currentCandleRef.current[ticker] });

        // Persist in-progress candles every 30 s so we survive a page refresh
        const now = Date.now();
        if (now - lastDbSaveRef.current > 30_000) {
          for (const t of TICKERS) {
            const c = currentCandleRef.current[t];
            if (c) upsertCandle(t, c);
          }
          lastDbSaveRef.current = now;
        }
      };

      ws.onerror = (err) => console.error('WebSocket error:', err);

      ws.onclose = () => {
        if (!active) return;
        reconnectTimer = setTimeout(connect, 3000);
      };
    }

    connect();

    return () => {
      active = false;
      clearTimeout(reconnectTimer);
      if (ws) {
        ws.onerror = null;
        ws.onclose = null;
        ws.close();
      }
    };
  }, []);

  function getCandleData(ticker) {
    const history = candleHistoryRef.current[ticker] ?? [];
    const current = currentCandleRef.current[ticker];
    return current ? [...history, current] : [...history];
  }

  return (
    <MarketDataContext.Provider value={{ latestUpdate, getCandleData, historyLoaded }}>
      {children}
    </MarketDataContext.Provider>
  );
}

export function useMarketData() {
  return useContext(MarketDataContext);
}
