import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
  Mail,
  RefreshCw,
  Save,
  ShieldCheck,
  UserCircle,
} from 'lucide-react';

const CARD = 'bg-[#f0f0f0] dark:bg-[#252525] border border-gray-400 dark:border-gray-700 rounded-xl transition-colors';
const INPUT = 'w-full bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#e07a5f]';
const BUTTON = 'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

function decodeToken(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');
    return JSON.parse(atob(padded.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function formatDate(value) {
  if (!value) return 'Not available';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(value) {
  if (!value) return 'Not available';
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusMessage({ type, children }) {
  if (!children) return null;
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;
  const styles = type === 'success'
    ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300'
    : 'border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300';

  return (
    <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${styles}`}>
      <Icon size={14} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {label}
      </span>
      {children}
    </label>
  );
}


export default function Account() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({ username: '', email: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [showPassword, setShowPassword] = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [error, setError] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  const token = sessionStorage.getItem('token');
  const tokenPayload = useMemo(() => decodeToken(token), [token]);
  const tokenExpiresAt = tokenPayload?.exp ? new Date(tokenPayload.exp * 1000) : null;

  const handleUnauthorized = useCallback(() => {
    sessionStorage.removeItem('token');
    navigate('/login', { replace: true });
  }, [navigate]);

  const request = useCallback(async (path, options = {}) => {
    const headers = {
      Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    };

    const response = await fetch(path, { ...options, headers });
    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const detail = Array.isArray(data.detail)
        ? data.detail.map(item => item.msg).join(', ')
        : data.detail;
      throw new Error(detail || 'Request failed');
    }

    return data;
  }, [handleUnauthorized]);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await request('/auth/me');
      setProfile(data);
      setProfileForm({ username: data.username || '', email: data.email || '' });
    } catch (err) {
      if (err.message !== 'Session expired') setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const initials = useMemo(() => {
    const source = profile?.username || profile?.email || 'Account';
    return source
      .split(/[.\s_-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('') || 'A';
  }, [profile]);

  const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setError('');

    const username = profileForm.username.trim();
    const email = profileForm.email.trim();
    if (!username) {
      setError('Username is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Enter a valid email address');
      return;
    }

    setProfileSaving(true);
    try {
      const data = await request('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ username, email }),
      });
      setProfile(data);
      setProfileForm({ username: data.username, email: data.email });
      setProfileMessage('Profile updated');
    } catch (err) {
      if (err.message !== 'Session expired') setError(err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setError('');

    if (!passwordForm.current) {
      setError('Current password is required');
      return;
    }
    if (passwordForm.next.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setError('New passwords do not match');
      return;
    }

    setPasswordSaving(true);
    try {
      await request('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({
          current_password: passwordForm.current,
          new_password: passwordForm.next,
        }),
      });
      setPasswordForm({ current: '', next: '', confirm: '' });
      setPasswordMessage('Password updated');
    } catch (err) {
      if (err.message !== 'Session expired') setError(err.message);
    } finally {
      setPasswordSaving(false);
    }
  };

  const signOut = () => {
    sessionStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  const passwordInput = (name, label, value) => (
    <Field label={label}>
      <div className="relative">
        <input
          type={showPassword[name] ? 'text' : 'password'}
          value={value}
          onChange={e => setPasswordForm(form => ({ ...form, [name]: e.target.value }))}
          className={`${INPUT} pr-10`}
          autoComplete={name === 'current' ? 'current-password' : 'new-password'}
        />
        <button
          type="button"
          onClick={() => setShowPassword(state => ({ ...state, [name]: !state[name] }))}
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label={showPassword[name] ? 'Hide password' : 'Show password'}
        >
          {showPassword[name] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </Field>
  );

  if (loading) {
    return (
      <div className={`${CARD} flex min-h-96 items-center justify-center p-6`}>
        <div className="flex items-center gap-3 text-sm font-mono text-gray-500 dark:text-gray-400">
          <RefreshCw size={16} className="animate-spin" />
          Loading account...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-gray-900 dark:text-white">
      <div className={`${CARD} overflow-hidden`}>
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#e07a5f] text-xl font-black text-white shadow-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-black tracking-tight">{profile?.username || 'Account'}</h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-green-300 bg-green-50 px-2 py-1 text-xs font-bold text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300">
                  <ShieldCheck size={12} />
                  Active
                </span>
              </div>
              <p className="mt-1 flex items-center gap-2 truncate text-sm text-gray-500 dark:text-gray-400">
                <Mail size={14} className="shrink-0" />
                {profile?.email}
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Member since {formatDate(profile?.created_at)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={signOut}
            className={`${BUTTON} border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800`}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>

      {error && <StatusMessage type="error">{error}</StatusMessage>}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="space-y-4">
          <form onSubmit={saveProfile} className={`${CARD} p-5`}>
            <div className="mb-5 flex items-center gap-3">
              <UserCircle size={20} className="text-[#e07a5f]" />
              <div>
                <h2 className="text-lg font-black">Profile</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Manage your public account details.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Username">
                <input
                  value={profileForm.username}
                  onChange={e => setProfileForm(form => ({ ...form, username: e.target.value }))}
                  className={INPUT}
                  autoComplete="username"
                />
              </Field>
              <Field label="Email">
                <input
                  value={profileForm.email}
                  onChange={e => setProfileForm(form => ({ ...form, email: e.target.value }))}
                  className={INPUT}
                  type="email"
                  autoComplete="email"
                />
              </Field>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <StatusMessage type="success">{profileMessage}</StatusMessage>
              <button
                type="submit"
                disabled={profileSaving}
                className={`${BUTTON} bg-[#e07a5f] text-white hover:bg-[#cb674f] sm:ml-auto`}
              >
                <Save size={15} />
                {profileSaving ? 'Saving...' : 'Save profile'}
              </button>
            </div>
          </form>

          <form onSubmit={changePassword} className={`${CARD} p-5`}>
            <div className="mb-5 flex items-center gap-3">
              <KeyRound size={20} className="text-[#e07a5f]" />
              <div>
                <h2 className="text-lg font-black">Security</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Change your password without ending the session.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {passwordInput('current', 'Current password', passwordForm.current)}
              {passwordInput('next', 'New password', passwordForm.next)}
              {passwordInput('confirm', 'Confirm password', passwordForm.confirm)}
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <StatusMessage type="success">{passwordMessage}</StatusMessage>
              <button
                type="submit"
                disabled={passwordSaving}
                className={`${BUTTON} bg-[#e07a5f] text-white hover:bg-[#cb674f] sm:ml-auto`}
              >
                <ShieldCheck size={15} />
                {passwordSaving ? 'Updating...' : 'Update password'}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className={`${CARD} p-5`}>
            <div className="mb-5 flex items-center gap-3">
              <ShieldCheck size={20} className="text-[#e07a5f]" />
              <div>
                <h2 className="text-lg font-black">Session</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">Current authenticated browser session.</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4 rounded-lg bg-white px-3 py-3 dark:bg-[#1a1a1a]">
                <span className="text-gray-500 dark:text-gray-400">User ID</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{profile?.id || tokenPayload?.sub || 'Unknown'}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg bg-white px-3 py-3 dark:bg-[#1a1a1a]">
                <span className="text-gray-500 dark:text-gray-400">Token expires</span>
                <span className="text-right font-bold text-gray-900 dark:text-gray-100">{formatDateTime(tokenExpiresAt)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg bg-white px-3 py-3 dark:bg-[#1a1a1a]">
                <span className="text-gray-500 dark:text-gray-400">Authentication</span>
                <span className="font-bold text-green-600 dark:text-green-300">Bearer JWT</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
