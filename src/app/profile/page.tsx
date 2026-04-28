'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth, UserButton, RedirectToSignIn } from '@clerk/nextjs'
import { useQuizStore } from '@/store/quizStore'
import { useSyncUser } from '@/hooks/useSyncUser'

interface UserStats {
  xp: number
  mistakes: string[]
  categoryProgress: Record<string, { basic: number; advanced: number }>
}

const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2500, 4000, 6000, 10000]

function getLevel(xp: number) {
  let lvl = 1
  for (let i = 0; i < levelThresholds.length; i++) {
    if (xp >= levelThresholds[i]) lvl = i + 1
  }
  const current = levelThresholds[lvl - 1] || 0
  const next = levelThresholds[lvl] || current + 1000
  const progress = ((xp - current) / (next - current)) * 100
  return { level: lvl, progress: Math.min(progress, 100), nextXp: next }
}

import { Trophy, Star, Book, Sprout, ChevronLeft, BarChart2, Zap, RefreshCcw, Target } from 'lucide-react'

export default function ProfilePage() {
  const { isSignedIn, isLoaded } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const xp = useQuizStore(s => s.xp)
  const mistakes = useQuizStore(s => s.mistakes)
  useSyncUser()

  useEffect(() => {
    if (!isSignedIn) return
    fetch('/api/user')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [isSignedIn])

  if (!isLoaded) return null
  if (!isSignedIn) return <RedirectToSignIn />

  const currentXp = stats?.xp ?? xp
  const currentMistakes = stats?.mistakes ?? mistakes
  const { level, progress, nextXp } = getLevel(currentXp)

  const grade =
    level >= 8 ? { title: 'Mistrz', color: 'from-amber-400 to-orange-500', icon: <Trophy className="w-10 h-10 text-amber-400" /> } :
    level >= 5 ? { title: 'Ekspert', color: 'from-purple-400 to-pink-500', icon: <Star className="w-10 h-10 text-purple-400" /> } :
    level >= 3 ? { title: 'Adept', color: 'from-cyan-400 to-blue-500', icon: <Book className="w-10 h-10 text-cyan-400" /> } :
    { title: 'Początkujący', color: 'from-emerald-400 to-teal-500', icon: <Sprout className="w-10 h-10 text-emerald-400" /> }

  return (
    <div className="flex-1 bg-transparent text-white w-full h-full flex flex-col">
      <header className="px-6 py-6 border-b border-white/5 bg-[#171c2e]/50 backdrop-blur-sm sm:rounded-t-[2.5rem]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/app" className="text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-slate-800 rounded-lg shrink-0">
              <ChevronLeft className="w-6 h-6" />
            </a>
            <h1 className="text-2xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Profil</span>
            </h1>
          </div>
          <UserButton />
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-8 py-8 sm:py-12 max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
          </div>
        ) : (
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Level Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-[2rem] bg-slate-800/40 border border-slate-700/40 shadow-xl shadow-black/20"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-2xl shadow-inner">{grade.icon}</div>
                <div className="flex-1">
                  <div className="text-sm text-slate-400 mb-1 font-medium tracking-wide">Poziom {level}</div>
                  <div className={`text-3xl font-black bg-gradient-to-r ${grade.color} bg-clip-text text-transparent`}>
                    {grade.title}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-amber-400">{currentXp}</div>
                  <div className="text-xs text-slate-500 font-bold tracking-widest mt-1">XP</div>
                </div>
              </div>

              <div className="h-4 bg-slate-900/80 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${grade.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between mt-3 text-xs text-slate-400 font-medium">
                <span>Poziom {level}</span>
                <span>{currentXp} / {nextXp} XP</span>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-4"
            >
              <StatCard label="Poziom" value={`${level}`} icon={<BarChart2 className="w-6 h-6 text-violet-400" />} />
              <StatCard label="Łączne XP" value={`${currentXp}`} icon={<Zap className="w-6 h-6 text-amber-400 fill-amber-400" />} />
              <StatCard label="Błędy" value={`${currentMistakes.length}`} icon={<RefreshCcw className="w-6 h-6 text-fuchsia-400" />} />
            </motion.div>

            {/* Mistakes Section */}
            {currentMistakes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-[2rem] bg-slate-800/40 border border-slate-700/40 shadow-xl shadow-black/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-200 text-lg">Pytania do powtórki</h3>
                  <span className="text-xs font-bold text-fuchsia-400 bg-fuchsia-500/10 px-3 py-1.5 rounded-full border border-fuchsia-500/20">{currentMistakes.length} błędów</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Masz {currentMistakes.length} pytań, na które odpowiedziałeś źle. Użyj trybu &quot;Popraw błędy&quot; aby je przećwiczyć.
                </p>
                <a
                  href="/app"
                  className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Rozpocznij powtórkę →
                </a>
              </motion.div>
            )}

            {/* Activity hint */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-6 rounded-[2rem] bg-[#171c2e]/40 border border-[#171c2e] shadow-xl text-center flex flex-col items-center"
            >
              <Target className="w-10 h-10 text-slate-500 mb-4" />
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                Rozwiązuj quizy codziennie, aby zdobywać XP i awansować na wyższe poziomy!
              </p>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="p-5 rounded-[1.5rem] bg-slate-800/40 border border-slate-700/40 text-center flex flex-col items-center shadow-lg shadow-black/20">
      <div className="mb-3 p-3 bg-slate-900/50 rounded-xl shadow-inner">{icon}</div>
      <div className="text-2xl font-black text-white tracking-tight">{value}</div>
      <div className="text-xs text-slate-400 mt-1 font-medium tracking-wide">{label}</div>
    </div>
  )
}
