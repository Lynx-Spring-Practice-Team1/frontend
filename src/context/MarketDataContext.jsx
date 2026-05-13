import { createContext, useContext, useEffect, useRef, useState } from 'react';

function buildWsUrl() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/api/ws?token=${encodeURIComponent(token)}`;
}

export const TICKERS = ['AAPL', 'ARKA', 'JPM', 'MNVS'];
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
      time: Number(r.time),
      open: Number(r.open),
      high: Number(r.high),
      low: Number(r.low),
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
    // Backend unavailable - silently ignore chart persistence.
  }
}

const MarketDataContext = createContext(null);

export function MarketDataProvider({ children }) {
  const candleHistoryRef = useRef(null);
  const currentCandleRef = useRef(null);
  const loadedRef = useRef(false);

  if (candleHistoryRef.current === null) {
    candleHistoryRef.current = Object.fromEntries(TICKERS.map(t => [t, []]));
    currentCandleRef.current = Object.fromEntries(TICKERS.map(t => [t, null]));
  }

  const lastDbSaveRef = useRef(0);
  const [latestUpdate, setLatestUpdate] = useState(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [lastOrderUpdate, setLastOrderUpdate] = useState(null);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    Promise.all(
      TICKERS.map(async ticker => {
        const candles = await fetchCandles(ticker);
        if (candles.length === 0) return;
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
      const url = buildWsUrl();
      if (!url) return;
      ws = new WebSocket(url);

      ws.onopen = () => {};

      ws.onmessage = (event) => {
        let msg;
        try { msg = JSON.parse(event.data); } catch { return; }

        if (msg.type === 'ORDER_UPDATE') {
          setLastOrderUpdate(msg.payload ?? null);
          return;
        }

        if (msg.type !== 'PRICE_UPDATE') return;

        const { ticker, price, market_time } = msg.payload ?? {};
        if (!ticker || price == null || !market_time) return;
        if (!TICKERS.includes(ticker)) return;

        const bucketSec = bucketTime(market_time);
        const current = currentCandleRef.current[ticker];

        if (!current || current.time !== bucketSec) {
          if (current) {
            upsertCandle(ticker, current);
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
    <MarketDataContext.Provider value={{ latestUpdate, getCandleData, historyLoaded, tickers: TICKERS, lastOrderUpdate }}>
      {children}
    </MarketDataContext.Provider>
  );
}

export function useMarketData() {
  return useContext(MarketDataContext);
}
