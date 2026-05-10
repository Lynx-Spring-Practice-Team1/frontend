import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { variants } from '../components/auth/authConstants'
import AuthLogo from '../components/auth/AuthLogo'
import AuthTabs from '../components/auth/AuthTabs'
import LoginForm from '../components/auth/LoginForm'
import SignupForm from '../components/auth/SignupForm'

export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState(location.pathname === '/signup' ? 'signup' : 'login')
  const [dir, setDir] = useState(0)
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const next = location.pathname === '/signup' ? 'signup' : 'login'
    if (next !== mode) {
      setDir(next === 'signup' ? 1 : -1)
      setMode(next)
    }
  }, [location.pathname])

  const switchTo = (next) => {
    if (next === mode) return
    setDir(next === 'signup' ? 1 : -1)
    setMode(next)
    navigate('/' + next, { replace: true })
    setShowPw(false)
    setShowConfirm(false)
  }

  const onChange = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    if (errors[k]) setErrors(err => ({ ...err, [k]: '' }))
  }

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

 const handleSubmit = async (e) => { 
  e.preventDefault();
  const newErrors = {};

  // --- Validation Logic ---
  if (!form.email || !isValidEmail(form.email)) {
    newErrors.email = 'Please enter a valid email address';
  }

  if (mode === 'signup') {
    if (!form.name || form.name.trim() === '') {
      newErrors.name = 'Full name is required';
    }
    if (!form.password || form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (form.password !== form.confirm) {
      newErrors.confirm = 'Passwords do not match';
    }
  } else {
    // For login, just check if password exists
    if (!form.password) {
      newErrors.password = 'Password is required';
    }
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  // Send to API Getaway
  setErrors({});
  setIsLoading(true);

  const isSignup = mode === 'signup';
  const endpoint = isSignup ? '/auth/signup' : '/auth/signin';
  const url = `http://localhost:8000${endpoint}`;

  const payload = isSignup 
    ? { name: form.name, email: form.email, password: form.password }
    : { email: form.email, password: form.password };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    console.log('API Response:', data);
    
  } catch (err) {
    setErrors({ server: 'Connection error. Is the server running?' });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] dark:bg-[#111111] p-4 transition-colors duration-200">
      <div className="w-full max-w-95">

        <AuthLogo />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.06 }}
          className="rounded-2xl border overflow-hidden shadow-2xl bg-white border-gray-300 dark:bg-[#252525] dark:border-gray-700"
        >
          <AuthTabs mode={mode} onSwitch={switchTo} />

          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div
                key={mode}
                custom={dir}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.21, ease: [0.4, 0, 0.2, 1] }}
                className="p-6"
              >
                {mode === 'login' ? (
                  <LoginForm
                    form={form}
                    onChange={onChange}
                    showPw={showPw}
                    onTogglePw={() => setShowPw(p => !p)}
                    onSubmit={handleSubmit}
                    onSwitch={switchTo}
                    errors={errors}
                  />
                ) : (
                  <SignupForm
                    form={form}
                    onChange={onChange}
                    showPw={showPw}
                    onTogglePw={() => setShowPw(p => !p)}
                    showConfirm={showConfirm}
                    onToggleConfirm={() => setShowConfirm(p => !p)}
                    onSubmit={handleSubmit}
                    onSwitch={switchTo}
                    errors={errors}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
