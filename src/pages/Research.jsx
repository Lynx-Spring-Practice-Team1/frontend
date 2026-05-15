import { Activity, Clock, Radio, Zap } from 'lucide-react';
import { useMarketData } from '../context/MarketDataContext';

function formatMarketTime(value) {
  if (!value) return 'Pending time';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatMagnitude(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return '0.00';
  return parsed.toFixed(2);
}

function EventCard({ event }) {
  return (
    <article className="rounded-lg border border-gray-300 dark:border-gray-700 bg-[#f0f0f0] dark:bg-[#252525] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-[#d9774a] bg-[#f4e4dc] px-2 py-1 text-xs font-bold text-[#8f4321] dark:bg-[#3d2e26] dark:text-[#f2b48c]">
              {event.event_type}
            </span>
            <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
              {event.scope} / {event.target}
            </span>
          </div>
          <h2 className="mt-3 text-base font-bold text-gray-900 dark:text-gray-100">
            {event.headline}
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-300 sm:min-w-[260px]">
          <div className="rounded-md border border-gray-300 dark:border-gray-700 p-2">
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Zap size={14} />
              Impact
            </div>
            <p className="mt-1 font-bold text-gray-900 dark:text-gray-100">
              {formatMagnitude(event.magnitude)}
            </p>
          </div>
          <div className="rounded-md border border-gray-300 dark:border-gray-700 p-2">
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Activity size={14} />
              Ticks
            </div>
            <p className="mt-1 font-bold text-gray-900 dark:text-gray-100">
              {event.duration_ticks}
            </p>
          </div>
          <div className="rounded-md border border-gray-300 dark:border-gray-700 p-2">
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <Clock size={14} />
              Time
            </div>
            <p className="mt-1 font-bold text-gray-900 dark:text-gray-100">
              {formatMarketTime(event.market_time)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Research() {
  const { marketEvents = [], marketEventsLoaded, marketEventsError } = useMarketData() ?? {};

  return (
    <section className="font-sans text-gray-900 dark:text-white transition-colors duration-200">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black italic tracking-tight">Market Events</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Exchange events affecting symbols, sectors, and the full market.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-[#f0f0f0] px-3 py-2 text-sm text-gray-600 dark:border-gray-700 dark:bg-[#252525] dark:text-gray-300">
          <Radio size={16} className="text-[#d9774a]" />
          Live
        </div>
      </div>

      {marketEventsError && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {marketEventsError}
        </div>
      )}

      {!marketEventsLoaded && (
        <div className="rounded-lg border border-gray-300 bg-[#f0f0f0] p-6 text-sm text-gray-500 dark:border-gray-700 dark:bg-[#252525] dark:text-gray-400">
          Loading market events...
        </div>
      )}

      {marketEventsLoaded && marketEvents.length === 0 && !marketEventsError && (
        <div className="rounded-lg border border-gray-300 bg-[#f0f0f0] p-6 text-sm text-gray-500 dark:border-gray-700 dark:bg-[#252525] dark:text-gray-400">
          No market events yet.
        </div>
      )}

      {marketEvents.length > 0 && (
        <div className="space-y-3">
          {marketEvents.map(event => (
            <EventCard key={event.event_id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}
