import { inputClass } from './authConstants'

export default function AuthInput({ icon: Icon, type, placeholder, value, onChange, required, rightButton, error }) {
  return (
    <div className="relative">
      <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888] dark:text-[#555]" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`${rightButton ? `${inputClass} pr-10` : inputClass} ${error ? 'border-red-500' : ''}`}
      />
      {rightButton && (
        <button
          type="button"
          onClick={rightButton.onClick}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] dark:text-[#555] hover:text-[#d9774a] dark:hover:text-[#d9774a] transition-colors"
        >
          {rightButton.icon}
        </button>
      )}
      {error && <p className="text-xs text-red-500 mt-1.5 ml-3">{error}</p>}
    </div>
  )
}
