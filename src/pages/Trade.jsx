import TradingChart from "../components/TradingChart";

export default function Trade({ isDark }) {
  return (
    <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg h-125 flex items-center justify-center">
      <TradingChart isDark={isDark} />
    </div>
  );
}
