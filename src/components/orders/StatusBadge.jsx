const STATUS_CFG = {
    PENDING:          { label: 'Pending',   cls: (d) => `text-blue-400   ${d ? 'bg-blue-900/20'   : 'bg-blue-50'}` },
    ACCEPTED:         { label: 'Pending',   cls: (d) => `text-orange-400  ${d ? 'bg-orange-900/20'  : 'bg-orange-50'}` },
    PARTIALLY_FILLED: { label: 'Partial',   cls: (d) => `text-amber-400  ${d ? 'bg-amber-900/20'  : 'bg-amber-50'}` },
    FILLED:           { label: 'Filled',    cls: (d) => `text-green-500  ${d ? 'bg-green-900/20'  : 'bg-green-50'}` },
    CANCELLED:        { label: 'Cancelled', cls: (d) => d ? 'text-gray-500 bg-gray-800/50' : 'text-gray-400 bg-gray-200' },
    REJECTED:         { label: 'Rejected',  cls: (d) => `text-red-400    ${d ? 'bg-red-900/20'    : 'bg-red-50'}` },
    EXPIRED:          { label: 'Expired',   cls: (d) => d ? 'text-gray-600 bg-gray-800/30' : 'text-gray-400 bg-gray-100' },
    UNKNOWN:          { label: 'Unknown',   cls: (d) => d ? 'text-gray-500 bg-gray-800/30' : 'text-gray-400 bg-gray-100' },
};

export default function StatusBadge({ status, isDark }) {
    const cfg = STATUS_CFG[status] ?? { ...STATUS_CFG.UNKNOWN, label: status || 'Unknown' };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls(isDark)}`}>
            {cfg.label}
        </span>
    );
}
