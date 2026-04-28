'use client'

import { motion } from 'framer-motion'
import type { QuizResult as QR } from '@/types/quiz'
import { useQuizStore } from '@/store/quizStore'

import { Trophy, Star, Zap, BookX } from 'lucide-react'

interface Props {
  result: QR
  onReset: () => void
  onReplay: () => void
}

export default function QuizResult({ result, onReset, onReplay }: Props) {
  const xp = useQuizStore(s => s.xp)
  const pct = result.score

  const grade =
    pct >= 90 ? { icon: <Trophy className="w-16 h-16" />, label: 'Mistrzostwo!', color: 'text-amber-400' } :
    pct >= 70 ? { icon: <Star className="w-16 h-16" />, label: 'Świetnie!', color: 'text-emerald-400' } :
    pct >= 50 ? { icon: <Zap className="w-16 h-16" />, label: 'Nieźle!', color: 'text-cyan-400' } :
    { icon: <BookX className="w-16 h-16" />, label: 'Do poprawy', color: 'text-red-400' }

  return (
    <div className="min-h-[100dvh] bg-transparent flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className={`mb-4 ${grade.color}`}
          >
            {grade.icon}
          </motion.div>
          <h2 className={`text-3xl font-black ${grade.color}`}>{grade.label}</h2>
        </div>

        <div className="bg-slate-800/40 backdrop-blur border border-slate-700/40 shadow-xl shadow-black/20 rounded-[2rem] p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Stat label="Wynik" value={`${pct}%`} />
            <Stat label="XP łącznie" value={`${xp}`} />
            <Stat label="Poprawne" value={`${result.correctAnswers}/${result.totalQuestions}`} color="text-emerald-400" />
            <Stat label="Błędy" value={`${result.wrongAnswers}`} color="text-red-400" />
          </div>

          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#1e293b" strokeWidth="10"/>
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
            className="flex-1 py-3.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-lg shadow-black/20"
          >
            Menu
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onReplay}
            className="flex-1 py-3.5 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white transition-all shadow-lg shadow-violet-500/25"
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
      <div className="text-xs text-slate-400 mt-0.5 font-medium">{label}</div>
    </div>
  )
}
