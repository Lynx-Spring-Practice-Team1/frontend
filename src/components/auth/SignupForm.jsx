import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { ACCENT } from './authConstants'
import AuthInput from './AuthInput'

export default function SignupForm({ form, onChange, showPw, onTogglePw, showConfirm, onToggleConfirm, onSubmit, onSwitch, errors }) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <AuthInput
        icon={User}
        type="text"
        placeholder="Username"
        value={form.username}
        onChange={onChange('username')}
        required
        error={errors?.username}
      />

      <AuthInput
        icon={Mail}
        type="email"
        placeholder="Email address"
        value={form.email}
        onChange={onChange('email')}
        required
        error={errors?.email}
      />

      <AuthInput
        icon={Lock}
        type={showPw ? 'text' : 'password'}
        placeholder="Password"
        value={form.password}
        onChange={onChange('password')}
        required
        error={errors?.password}
        rightButton={{
          onClick: onTogglePw,
          icon: showPw ? <EyeOff size={14} /> : <Eye size={14} />,
        }}
      />

      <AuthInput
        icon={Lock}
        type={showConfirm ? 'text' : 'password'}
        placeholder="Confirm password"
        value={form.confirm}
        onChange={onChange('confirm')}
        required
        error={errors?.confirm}
        rightButton={{
          onClick: onToggleConfirm,
          icon: showConfirm ? <EyeOff size={14} /> : <Eye size={14} />,
        }}
      />

      <button
        type="submit"
        className="w-full py-2.5 rounded-lg text-sm font-mono font-bold text-white tracking-widest flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:opacity-75 mt-1"
        style={{ background: ACCENT }}
      >
        CREATE ACCOUNT
        <ArrowRight size={14} strokeWidth={2.5} />
      </button>

      <p className="text-center text-xs font-mono text-[#999] dark:text-[#555]">
        Have an account?{' '}
        <button
          type="button"
          onClick={() => onSwitch('login')}
          className="hover:opacity-75 transition-opacity"
          style={{ color: ACCENT }}
        >
          Log in
        </button>
      </p>
    </form>
  )
}
