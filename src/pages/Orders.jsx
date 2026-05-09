import { ACTIVE_STATUSES } from '../components/orders/constants.js';
import useOrders from '../components/orders/useOrders.js';
import StatCard from '../components/orders/StatCard.jsx';
import OrdersTable from '../components/orders/OrdersTable.jsx';
import AccountSummary from '../components/orders/AccountSummary.jsx';
import TodayActivity from '../components/orders/TodayActivity.jsx';
import OrderPanel from '../components/OrderPanel';

export default function Orders({ isDark = false }) {
    const { orders, placeOrder, cancelOrder } = useOrders();

    const isActive     = o => ACTIVE_STATUSES.includes(o.status);
    const activeCount  = orders.filter(isActive).length;
    const filledCount  = orders.filter(o => o.status === 'FILLED').length;
    const cancelledCount = orders.filter(o => o.status === 'CANCELLED').length;
    const openValue    = orders
        .filter(isActive)
        .reduce((sum, o) => sum + o.price * o.qty, 0)
        .toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    const fillDenom = filledCount + cancelledCount;
    const fillRate  = fillDenom > 0 ? Math.round(filledCount / fillDenom * 100) : 0;

    return (
        <div className="flex flex-col lg:flex-row gap-5">

            <div className="flex-1 flex flex-col gap-4 min-w-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard isDark={isDark} label="Active Orders" value={activeCount}    sub="Pending / Partial" valueClass="text-blue-400" />
                    <StatCard isDark={isDark} label="Filled Today"  value={filledCount}    sub="Executed"          valueClass="text-green-500" />
                    <StatCard isDark={isDark} label="Cancelled"     value={cancelledCount} sub="Today" />
                    <StatCard isDark={isDark} label="Active Value"  value={openValue}      sub="At limit price" />
                </div>
                <OrdersTable isDark={isDark} orders={orders} cancelOrder={cancelOrder} />
            </div>

            <div className="lg:w-72 lg:shrink-0 flex flex-col sm:flex-row lg:flex-col gap-4">
                <div className="flex-1 lg:flex-none min-w-0">
                    <OrderPanel
                        isDark={isDark}
                        activeTicker="AAPL"
                        currentPrice={184.00}
                        showSymbolInput={true}
                        onSubmit={placeOrder}
                    />
                </div>
                <AccountSummary isDark={isDark} />
                <TodayActivity
                    isDark={isDark}
                    totalOrders={orders.length}
                    filledCount={filledCount}
                    cancelledCount={cancelledCount}
                    fillRate={fillRate}
                />
            </div>
        </div>
    );
}
