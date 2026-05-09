export const ACCENT = '#d9774a';

export const ACTIVE_STATUSES = ['PENDING', 'PARTIALLY_FILLED'];

export const TABS = ['Active', 'Filled', 'Cancelled', 'Rejected', 'Expired', 'All'];

export const COLUMNS = ['TIME', 'SYMBOL', 'SIDE', 'TYPE', 'QTY', 'PRICE', 'STATUS', 'ACTION'];

export const INITIAL_ORDERS = [
    { id: 1, time: '10:42', symbol: 'AAPL',  instrument_type: 'STOCK', side: 'BUY',  type: 'LIMIT',  qty: 10, price: 184.00, status: 'PENDING',   filled_quantity: 0, exchange_fee: 0 },
    { id: 2, time: '09:31', symbol: 'NVDA',  instrument_type: 'STOCK', side: 'SELL', type: 'LIMIT',  qty: 5,  price: 880.00, status: 'PENDING',   filled_quantity: 0, exchange_fee: 0 },
    { id: 3, time: 'Yest',  symbol: 'TSLA',  instrument_type: 'STOCK', side: 'BUY',  type: 'MARKET', qty: 8,  price: 248.10, status: 'FILLED',    filled_quantity: 8, exchange_fee: 1.99 },
    { id: 4, time: 'Yest',  symbol: 'MSFT',  instrument_type: 'STOCK', side: 'BUY',  type: 'LIMIT',  qty: 15, price: 410.00, status: 'CANCELLED', filled_quantity: 0, exchange_fee: 0 },
    { id: 5, time: '14:22', symbol: 'AMZN',  instrument_type: 'STOCK', side: 'BUY',  type: 'LIMIT',  qty: 3,  price: 178.50, status: 'FILLED',    filled_quantity: 3, exchange_fee: 0.54 },
    { id: 6, time: 'Yest',  symbol: 'GOOGL', instrument_type: 'STOCK', side: 'SELL', type: 'LIMIT',  qty: 2,  price: 175.00, status: 'CANCELLED', filled_quantity: 0, exchange_fee: 0 },
    { id: 7, time: '08:55', symbol: 'META',  instrument_type: 'STOCK', side: 'BUY',  type: 'MARKET', qty: 5,  price: 502.30, status: 'FILLED',    filled_quantity: 5, exchange_fee: 2.51 },
];
