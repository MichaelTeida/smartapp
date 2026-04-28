'use client'

import { motion } from 'framer-motion'
import type { QuizResult as QR } from '@/types/quiz'
import { useQuizStore } from '@/store/quizStore'

interface Props {
  result: QR
  onReset: () => void
}

export default function QuizResult({ result, onReset }: Props) {
  const xp = useQuizStore(s => s.xp)
  const pct = result.score

  const grade =
    pct >= 90 ? { emoji: '🏆', label: 'Mistrzostwo!', color: 'text-amber-400' } :
    pct >= 70 ? { emoji: '🎉', label: 'Świetnie!', color: 'text-emerald-400' } :
    pct >= 50 ? { emoji: '💪', label: 'Nieźle!', color: 'text-cyan-400' } :
    { emoji: '📚', label: 'Do poprawy', color: 'text-red-400' }

  return (
    <div className="min-h-[100dvh] bg-[#0a0e1a] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="text-6xl mb-4"
          >
            {grade.emoji}
          </motion.div>
          <h2 className={`text-3xl font-black ${grade.color}`}>{grade.label}</h2>
        </div>

        <div className="bg-zinc-800/50 backdrop-blur border border-zinc-700/50 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Stat label="Wynik" value={`${pct}%`} />
            <Stat label="XP łącznie" value={`${xp}`} />
            <Stat label="Poprawne" value={`${result.correctAnswers}/${result.totalQuestions}`} color="text-emerald-400" />
            <Stat label="Błędy" value={`${result.wrongAnswers}`} color="text-red-400" />
          </div>

          {/* Score ring */}
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#27272a" strokeWidth="10"/>
                <motion.circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke={pct >= 70 ? '#10b981' : pct >= 50 ? '#06b6d4' : '#ef4444'}
                  strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={314}
                  initial={{ strokeDashoffset: 314 }}
                  animate={{ strokeDashoffset: 314 - (314 * pct) / 100 }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black text-white">{pct}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onReset}
            className="flex-1 py-3.5 rounded-xl font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all"
          >
            Menu
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.location.reload()}
            className="flex-1 py-3.5 rounded-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white transition-all shadow-lg shadow-emerald-500/20"
          >
            Zagraj ponownie
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

function Stat({ label, value, color = 'text-white' }: { label: string; value: string; color?: string }) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
    </div>
  )
}
