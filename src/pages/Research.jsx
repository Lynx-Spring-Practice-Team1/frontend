import { useState, useMemo } from 'react';
import { Activity, Clock, Radio, Zap, TrendingUp, TrendingDown, AlertTriangle, BarChart2 } from 'lucide-react';
import { useMarketData } from '../context/useMarketData';

const ACCENT = '#d9774a';
const CARD = 'bg-[#f0f0f0] dark:bg-[#252525] border border-gray-400 dark:border-gray-700 rounded-xl transition-colors';
const COLUMNS = ['TIME', 'TYPE', 'SCOPE', 'TARGET', 'HEADLINE', 'IMPACT', 'TICKS'];

const EVENT_BADGE_CLS = {
  BULL_RUN: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
  BEAR_CRASH: 'text-red-500    dark:text-red-400    bg-red-50    dark:bg-red-900/20',
  SECTOR_BOOM: 'text-blue-500   dark:text-blue-400   bg-blue-50   dark:bg-blue-900/20',
  SECTOR_SLUMP: 'text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
  STOCK_SHOCK: 'text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
  HALT: 'text-gray-500   dark:text-gray-400   bg-gray-200  dark:bg-gray-800/50',
};

function EventTypeBadge({ type }) {
  const cls = EVENT_BADGE_CLS[type] ?? 'text-[#8f4321] dark:text-[#f2b48c] bg-[#f4e4dc] dark:bg-[#3d2e26]';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}>
      {type}
    </span>
  );
}

function formatMarketTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatMagnitude(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(2) : '0.00';
}

function SummaryCard({ icon: Icon, label, value, sub, valueClass }) {
  return (
    <div className={`${CARD} p-4 flex flex-col gap-1 min-w-0`}>
      <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 mb-1">
        <Icon size={14} className="shrink-0" />
        <span className="text-xs uppercase tracking-wider font-medium truncate">{label}</span>
      </div>
      <span className={`text-2xl font-bold truncate ${valueClass ?? 'text-gray-900 dark:text-gray-100'}`}>{value}</span>
      {sub && <span className="text-xs text-gray-400 dark:text-gray-600">{sub}</span>}
    </div>
  );
}

function EventsTable({ events, eventsLoaded, eventsError }) {
  const [activeTab, setActiveTab] = useState('All');

  const eventTypes = useMemo(
    () => [...new Set(events.map(e => e.event_type))],
    [events],
  );

  const tabs = ['All', ...eventTypes];

  const tabCount = (tab) =>
    tab === 'All' ? events.length : events.filter(e => e.event_type === tab).length;

  const filtered = activeTab === 'All'
    ? events
    : events.filter(e => e.event_type === activeTab);

  return (
    <div className="rounded-xl border overflow-hidden bg-[#f0f0f0] dark:bg-[#252525] border-gray-400 dark:border-gray-700">

      {/* Tab bar — identical pattern to OrdersTable */}
      <div className="flex flex-wrap gap-2 p-3 border-b border-gray-300 dark:border-gray-700">
        {tabs.map(tab => {
          const active = activeTab === tab;
          const count = tabCount(tab);
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer border transition-all ${active
                ? 'text-white border-transparent'
                : 'border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-600'
                }`}
              style={active ? { backgroundColor: ACCENT, borderColor: ACCENT } : {}}
            >
              {tab}{count > 0 && ` (${count})`}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-700">
              {COLUMNS.map(col => (
                <th key={col} className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-400 dark:text-gray-500">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!eventsLoaded && !eventsError && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-10 text-center italic text-gray-400 dark:text-gray-600">
                  Loading market events…
                </td>
              </tr>
            )}
            {eventsError && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-6 text-center text-sm font-semibold text-red-500 dark:text-red-400">
                  {eventsError}
                </td>
              </tr>
            )}
            {eventsLoaded && !eventsError && filtered.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-10 text-center italic text-gray-400 dark:text-gray-600">
                  No {activeTab === 'All' ? '' : `${activeTab} `}events recorded
                </td>
              </tr>
            )}
            {filtered.map(event => (
              <tr
                key={event.event_id}
                className="border-b border-dashed border-gray-300 dark:border-gray-700 hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors last:border-0"
              >
                <td className="px-4 py-3 font-mono text-sm text-gray-400 dark:text-gray-500 whitespace-nowrap">
                  {formatMarketTime(event.market_time)}
                </td>
                <td className="px-4 py-3">
                  <EventTypeBadge type={event.event_type} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {event.scope ?? '—'}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {event.target ?? '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate" title={event.headline}>
                  {event.headline}
                </td>
                <td className="px-4 py-3 font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatMagnitude(event.magnitude)}×
                </td>
                <td className="px-4 py-3 font-mono text-sm text-gray-700 dark:text-gray-300">
                  {event.duration_ticks ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Research() {
  const { marketEvents = [], marketEventsLoaded, marketEventsError } = useMarketData() ?? {};

  const avgMagnitude = useMemo(() => {
    if (!marketEvents.length) return '—';
    const avg = marketEvents.reduce((s, e) => s + Number(e.magnitude || 0), 0) / marketEvents.length;
    return `${avg.toFixed(2)}×`;
  }, [marketEvents]);

  const bullCount = marketEvents.filter(e => ['BULL_RUN', 'SECTOR_BOOM'].includes(e.event_type)).length;
  const bearCount = marketEvents.filter(e => ['BEAR_CRASH', 'SECTOR_SLUMP'].includes(e.event_type)).length;
  const sentiment = bullCount > bearCount ? 'Bullish' : bearCount > bullCount ? 'Bearish' : 'Neutral';
  const sentimentClass = bullCount > bearCount
    ? 'text-emerald-600 dark:text-emerald-400'
    : bearCount > bullCount
      ? 'text-red-500 dark:text-red-400'
      : 'text-gray-500 dark:text-gray-400';

  const latestEvent = marketEvents[0];

  return (
    <div className="space-y-4 min-w-0 text-gray-900 dark:text-white">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black italic tracking-tight">Market Events</h1>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto rounded-lg border border-gray-400 dark:border-gray-700 bg-[#f0f0f0] dark:bg-[#252525] px-3 py-2">
          <Radio size={13} className="text-[#d9774a]" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Live</span>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard icon={BarChart2} label="Total Events" value={marketEventsLoaded ? String(marketEvents.length) : '—'} sub="All recorded" />
        <SummaryCard icon={Zap} label="Avg Impact" value={marketEventsLoaded ? avgMagnitude : '—'} sub="Magnitude" />
        <SummaryCard icon={TrendingUp} label="Sentiment" value={marketEventsLoaded ? sentiment : '—'} valueClass={marketEventsLoaded ? sentimentClass : undefined} sub={`${bullCount} bull · ${bearCount} bear`} />
        <SummaryCard icon={Clock} label="Latest" value={latestEvent ? latestEvent.event_type : '—'} sub={latestEvent ? formatMarketTime(latestEvent.market_time) : 'No events yet'} />
      </div>

      {/* Events table */}
      <EventsTable
        events={marketEvents}
        eventsLoaded={marketEventsLoaded}
        eventsError={marketEventsError}
      />

    </div>
  );
}
