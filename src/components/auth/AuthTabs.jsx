import { ACCENT } from './authConstants'

export default function AuthTabs({ mode, onSwitch }) {
  return (
    <div className="grid grid-cols-2 border-b border-gray-300 dark:border-gray-700">
      {[['login', 'LOG IN'], ['signup', 'SIGN UP']].map(([m, label]) => (
        <button
          key={m}
          type="button"
          onClick={() => onSwitch(m)}
          className={[
            'py-3.5 text-xs font-mono font-bold tracking-widest transition-colors duration-200',
            mode === m
              ? 'text-white'
              : 'text-gray-400 hover:text-gray-700 dark:text-[#555] dark:hover:text-gray-300',
          ].join(' ')}
          style={mode === m ? { background: ACCENT } : {}}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
