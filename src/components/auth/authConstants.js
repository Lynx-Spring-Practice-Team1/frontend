export const ACCENT = '#d9774a'

export const variants = {
  enter: (dir) => ({ x: dir > 0 ? 52 : -52, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -52 : 52, opacity: 0 }),
}

export const inputClass = [
  'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors pl-10 font-mono',
  'bg-[#f0f0f0] border-[#d0d0d0] text-gray-900 placeholder-gray-400 focus:border-[#d9774a]',
  'dark:bg-[#111] dark:border-[#3a3a3a] dark:text-white dark:placeholder-[#555] dark:focus:border-[#d9774a]',
].join(' ')
