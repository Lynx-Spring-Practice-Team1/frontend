import { useState } from 'react';
import { INITIAL_ORDERS, ACTIVE_STATUSES } from './constants.js';

export default function useOrders() {
    const [orders, setOrders] = useState(INITIAL_ORDERS);

    const placeOrder = ({ symbol, side, type, qty, price }) => {
        const time = new Date().toTimeString().slice(0, 5);
        setOrders(prev => [{
            id: Date.now(),
            time,
            symbol,
            instrument_type: 'STOCK',
            side,
            type: type.toUpperCase(),
            qty,
            price,
            status: 'PENDING',
            filled_quantity: 0,
            exchange_fee: 0,
        }, ...prev]);
    };

    // DELETE only valid for PENDING or PARTIALLY_FILLED (spec §4.3)
    const cancelOrder = (id) => {
        setOrders(prev => prev.map(o =>
            o.id === id && ACTIVE_STATUSES.includes(o.status)
                ? { ...o, status: 'CANCELLED' }
                : o
        ));
    };

    return { orders, placeOrder, cancelOrder };
}
