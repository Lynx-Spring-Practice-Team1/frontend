import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Trade from '../pages/Trade';
import Watchlist from '../pages/Watchlist';
import Portfolio from '../pages/Portfolio';
import Orders from '../pages/Orders';
import Research from '../pages/Research';
import Account from '../pages/Account';
import AuthPage from '../pages/AuthPage';

function ProtectedRoute({ element }) {
  return sessionStorage.getItem('token') ? element : <Navigate to="/login" replace />;
}

export default function AppRoutes({ isDark }) {
  return (
    <Routes>
      <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
      <Route path="/trade"     element={<ProtectedRoute element={<Trade isDark={isDark} />} />} />
      <Route path="/watchlist" element={<ProtectedRoute element={<Watchlist isDark={isDark} />} />} />
      <Route path="/portfolio" element={<ProtectedRoute element={<Portfolio />} />} />
      <Route path="/orders"    element={<ProtectedRoute element={<Orders isDark={isDark} />} />} />
      <Route path="/research"  element={<ProtectedRoute element={<Research />} />} />
      <Route path="/account"   element={<ProtectedRoute element={<Account />} />} />
      <Route path="/login"     element={<AuthPage />} />
      <Route path="/signup"    element={<AuthPage />} />
      <Route path="*"          element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
