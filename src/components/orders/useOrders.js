import { useCallback, useEffect, useState } from 'react';
import { useMarketData } from '../../context/useMarketData';

function authHeaders(json = false) {
  const token = localStorage.getItem('token');
  return {
    ...(json ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function formatTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function normalizeOrder(order) {
  return {
    id: order.id,
    exchange_order_id: order.exchange_order_id ?? null,
    time: formatTime(order.created_at),
    symbol: order.symbol,
    instrument_type: 'STOCK',
    side: order.side,
    type: order.order_type,
    qty: order.quantity,
    price: order.price == null ? null : Number(order.price),
    filled_price: order.filled_price == null ? null : Number(order.filled_price),
    status: order.status,
    filled_quantity: order.filled_quantity ?? 0,
    exchange_fee: order.exchange_fee == null ? 0 : Number(order.exchange_fee),
  };
}

export default function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { lastOrderUpdate } = useMarketData();

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/orders/', { headers: authHeaders() });
      if (!response.ok) throw new Error(`Failed to load orders (${response.status})`);
      const data = await response.json();
      setOrders(data.map(normalizeOrder));
    } catch (err) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Directly patch the matching order in state — no API call needed
  useEffect(() => {
    if (!lastOrderUpdate) return;
    const { order_id, status, filled_quantity, average_fill_price, exchange_fee } = lastOrderUpdate;
    if (!order_id || !status) return;

    setOrders(prev => {
      const idx = prev.findIndex(o => o.exchange_order_id === order_id);
      if (idx === -1) return prev;           // unknown order, leave unchanged
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        status,
        filled_quantity: Number(filled_quantity) || updated[idx].filled_quantity,
        filled_price:    Number(average_fill_price) || updated[idx].filled_price,
        exchange_fee:    exchange_fee != null ? Number(exchange_fee) : updated[idx].exchange_fee,
      };
      return updated;
    });
  }, [lastOrderUpdate]);

  const placeOrder = async ({ symbol, side, type, qty, price }) => {
    const orderType = type.toUpperCase();
    const payload = {
      symbol,
      side,
      order_type: orderType,
      quantity: Number(qty),
      ...(orderType === 'LIMIT'
        ? { price: Number(price) }
        : (price > 0 ? { market_price_estimate: Number(price) } : {})),
    };

    const response = await fetch('/api/orders/', {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.detail || `Order rejected (${response.status})`);
    }

    await loadOrders();
  };

  const cancelOrder = async (id) => {
    const response = await fetch(`/api/orders/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.detail || `Cancel failed (${response.status})`);
      return;
    }

    await loadOrders();
  };

  return { orders, loading, error, reload: loadOrders, placeOrder, cancelOrder };
}
