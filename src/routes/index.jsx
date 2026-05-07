import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Trade from '../pages/Trade';
import Watchlist from '../pages/Watchlist';
import Portfolio from '../pages/Portfolio';
import Orders from '../pages/Orders';
import Research from '../pages/Research';
import Account from '../pages/Account';

export default function AppRoutes({ isDark }) {
  return (
    <Routes>
      <Route path="/"          element={<Dashboard />} />
      <Route path="/trade"     element={<Trade isDark={isDark} />} />
      <Route path="/watchlist" element={<Watchlist />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/orders"    element={<Orders />} />
      <Route path="/research"  element={<Research />} />
      <Route path="/account"   element={<Account />} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  );
}
