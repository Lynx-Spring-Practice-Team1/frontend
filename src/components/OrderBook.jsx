const ACCENT = '#d9774a';

const MOCK_ASKS = [
    { price: 184.335, size: 60 },
    { price: 184.325, size: 80 },
    { price: 184.315, size: 100 },
];

const MOCK_BIDS = [
    { price: 184.295, size: 110 },
    { price: 184.285, size: 140 },
    { price: 184.275, size: 170 },
];

export default function OrderBook({ isDark = false }) {
    return (
        <div className={`rounded-xl border p-4 ${isDark ? 'bg-[#1a1a1a] border-[#333]' : 'bg-[#e8e8e8] border-[#d8d8d8]'}`}>
            <h3 className={`text-sm font-bold italic mb-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                Order book
            </h3>
            <div className="flex flex-col gap-1">
                {MOCK_ASKS.map(row => (
                    <div key={row.price} className="flex justify-between text-xs">
                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                            {row.price.toFixed(3)}
                        </span>
                        <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                            {row.size}
                        </span>
                    </div>
                ))}
                <div className={`border-t my-1 ${isDark ? 'border-[#444]' : 'border-gray-200'}`} />
                {MOCK_BIDS.map(row => (
                    <div key={row.price} className="flex justify-between text-xs">
                        <span style={{ color: ACCENT }}>{row.price.toFixed(3)}</span>
                        <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                            {row.size}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
