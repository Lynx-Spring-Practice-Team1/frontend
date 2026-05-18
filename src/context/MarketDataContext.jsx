import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_TICKERS, fetchCandles } from './marketDataApi';
import { MarketDataContext } from './marketDataContext';

async function buildWsUrl() {
  const token = sessionStorage.getItem('token');
  if (!token) return null;
  try {
    const res = await fetch('/api/ws-ticket', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const { ticket } = await res.json();
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/api/ws?ticket=${encodeURIComponent(ticket)}`;
  } catch {
    return null;
  }
}

const CANDLE_INTERVAL_SEC = 300; // 5-min candles
const MARKET_EVENTS_LIMIT = 50;

function bucketTime(marketTime) {
  const sec = Math.floor(new Date(marketTime).getTime() / 1000);
  return Math.floor(sec / CANDLE_INTERVAL_SEC) * CANDLE_INTERVAL_SEC;
}

async function upsertCandle(_ticker, _candle) {
  // Candle persistence is handled server-side by the price-history-service consumer.
  // The browser no longer writes directly to the candle store.
}

function authHeaders() {
  const token = sessionStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchMarketEvents() {
  const res = await fetch(`/api/market/events?limit=${MARKET_EVENTS_LIMIT}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load market events');
  return res.json();
}

function normalizeMarketEvent(message) {
  const event = message?.type === 'MARKET_EVENT' ? message.payload : message;
  if (!event?.event_id) return null;
  return event;
}

function prependMarketEvent(events, event) {
  const normalized = normalizeMarketEvent(event);
  if (!normalized) return events;
  return [
    normalized,
    ...events.filter(item => item.event_id !== normalized.event_id),
  ].slice(0, MARKET_EVENTS_LIMIT);
}

function normalizeTicker(ticker) {
  return String(ticker ?? '').trim().toUpperCase();
}

export function MarketDataProvider({ children }) {
  const candleHistoryRef = useRef(Object.fromEntries(DEFAULT_TICKERS.map(t => [t, []])));
  const currentCandleRef = useRef(Object.fromEntries(DEFAULT_TICKERS.map(t => [t, null])));
  const loadedRef = useRef(false);
  const tickersRef = useRef(DEFAULT_TICKERS);

  const lastDbSaveRef = useRef(0);
  const [tickers, setTickers] = useState(DEFAULT_TICKERS);
  const [latestUpdate, setLatestUpdate] = useState(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [lastOrderUpdate, setLastOrderUpdate] = useState(null);
  const [marketEvents, setMarketEvents] = useState([]);
  const [marketEventsLoaded, setMarketEventsLoaded] = useState(false);
  const [marketEventsError, setMarketEventsError] = useState(null);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    Promise.all(
      DEFAULT_TICKERS.map(async ticker => {
        const candles = await fetchCandles(ticker);
        if (candles.length === 0) return;
        candleHistoryRef.current[ticker] = candles.slice(0, -1);
        currentCandleRef.current[ticker] = candles[candles.length - 1];
      }),
    ).then(() => setHistoryLoaded(true));

    fetchMarketEvents()
      .then(rows => {
        setMarketEvents(rows.map(normalizeMarketEvent).filter(Boolean).slice(0, MARKET_EVENTS_LIMIT));
        setMarketEventsError(null);
      })
      .catch(() => setMarketEventsError('Unable to load market events.'))
      .finally(() => setMarketEventsLoaded(true));
  }, []);

  useEffect(() => {
    let ws = null;
    let reconnectTimer = null;
    let active = true;

    async function connect() {
      const url = await buildWsUrl();
      if (!url) return;
      ws = new WebSocket(url);

      ws.onopen = () => { };

      ws.onmessage = (event) => {
        let msg;
        try { msg = JSON.parse(event.data); } catch { return; }

        if (msg.type === 'ORDER_UPDATE') {
          console.log('ORDER_UPDATE received:', JSON.stringify(msg, null, 2));
          setLastOrderUpdate(msg.payload ?? null);
          return;
        }

        if (msg.type === 'MARKET_EVENT') {
          setMarketEvents(prev => prependMarketEvent(prev, msg));
          return;
        }

        if (msg.type !== 'PRICE_UPDATE') return;

        const { price, market_time } = msg.payload ?? {};
        const ticker = normalizeTicker(msg.payload?.ticker);
        if (!ticker || price == null || !market_time) return;

        if (!Object.prototype.hasOwnProperty.call(candleHistoryRef.current, ticker)) {
          candleHistoryRef.current[ticker] = [];
          currentCandleRef.current[ticker] = null;
        }

        if (!tickersRef.current.includes(ticker)) {
          tickersRef.current = [...tickersRef.current, ticker];
          setTickers(tickersRef.current);
        }

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
          for (const t of tickersRef.current) {
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

  const getCandleData = useCallback((ticker) => {
    const history = candleHistoryRef.current[ticker] ?? [];
    const current = currentCandleRef.current[ticker];
    return current ? [...history, current] : [...history];
  }, []);

  return (
    <MarketDataContext.Provider value={{
      latestUpdate,
      getCandleData,
      historyLoaded,
      tickers,
      lastOrderUpdate,
      marketEvents,
      marketEventsLoaded,
      marketEventsError,
    }}>
      {children}
    </MarketDataContext.Provider>
  );
}
