import { motion } from 'framer-motion'
import { ACCENT } from './authConstants'
import logoIcon from '../../assets/t1b.png'

export default function AuthLogo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex items-center justify-center gap-2.5 mb-8"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
        style={{ background: ACCENT }}
      >
        <img src={logoIcon} alt="Broker" className="w-15 h-8" />
      </div>
      <span className="font-mono font-bold text-[1.4rem] text-gray-900 dark:text-white tracking-tight">
        Broker
      </span>
    </motion.div>
  )
}
