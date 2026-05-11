import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { ACCENT } from './authConstants'
import AuthInput from './AuthInput'

export default function LoginForm({ form, onChange, showPw, onTogglePw, onSubmit, onSwitch, errors }) {
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
        icon={Lock}
        type={showPw ? 'text' : 'password'}
        placeholder="Password"
        value={form.password}
        onChange={onChange('password')}
        required
        rightButton={{
          onClick: onTogglePw,
          icon: showPw ? <EyeOff size={14} /> : <Eye size={14} />,
        }}
      />

      <div className="flex justify-end -mt-1">
        <button
          type="button"
          className="text-xs font-mono text-[#999] dark:text-[#555] hover:text-[#d9774a] dark:hover:text-[#d9774a] transition-colors"
        >
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        className="w-full py-2.5 rounded-lg text-sm font-mono font-bold text-white tracking-widest flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:opacity-75 mt-1"
        style={{ background: ACCENT }}
      >
        LOG IN
        <ArrowRight size={14} strokeWidth={2.5} />
      </button>

      <p className="text-center text-xs font-mono text-[#999] dark:text-[#555]">
        No account?{' '}
        <button
          type="button"
          onClick={() => onSwitch('signup')}
          className="hover:opacity-75 transition-opacity"
          style={{ color: ACCENT }}
        >
          Sign up
        </button>
      </p>
    </form>
  )
}
