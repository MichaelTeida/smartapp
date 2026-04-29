'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth, UserButton, RedirectToSignIn } from '@clerk/nextjs'
import { useQuizStore } from '@/store/quizStore'
import { useSyncUser } from '@/hooks/useSyncUser'
import { useTheme } from '@/components/theme-provider'
import { Trophy, Star, Book, Sprout, ChevronLeft, BarChart2, Zap, RefreshCcw, Target, Sun, Moon } from 'lucide-react'

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

export default function ProfilePage() {
  const { isSignedIn, isLoaded } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const xp = useQuizStore(s => s.xp)
  const mistakes = useQuizStore(s => s.mistakes)
  const { resolved, setTheme } = useTheme()
  useSyncUser()

  useEffect(() => {
    if (!isSignedIn) return
    fetch('/api/user')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [isSignedIn])

  if (!isLoaded) return null
  if (!isSignedIn) return <RedirectToSignIn />

  const currentXp = stats?.xp ?? xp
  const currentMistakes = stats?.mistakes ?? mistakes
  const { level, progress, nextXp } = getLevel(currentXp)

  const grade =
    level >= 8 ? { title: 'Mistrz', color: 'from-amber-400 to-orange-500', icon: <Trophy className="w-10 h-10 text-amber-500 dark:text-amber-400" /> } :
    level >= 5 ? { title: 'Ekspert', color: 'from-purple-400 to-pink-500', icon: <Star className="w-10 h-10 text-purple-500 dark:text-purple-400" /> } :
    level >= 3 ? { title: 'Adept', color: 'from-cyan-400 to-blue-500', icon: <Book className="w-10 h-10 text-cyan-500 dark:text-cyan-400" /> } :
    { title: 'Początkujący', color: 'from-emerald-400 to-teal-500', icon: <Sprout className="w-10 h-10 text-emerald-500 dark:text-emerald-400" /> }

  return (
    <div className="flex-1 w-full h-full flex flex-col min-h-[100dvh]">
      <header className="glass m-[var(--gap-main)] mb-0 px-6 py-5" data-variant="panel">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/app" className="btn-glass w-9 h-9 p-0 shrink-0">
              <ChevronLeft className="w-5 h-5" />
            </a>
            <h1 className="text-2xl font-black tracking-tight gradient-text">Profil</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
              className="btn-glass w-9 h-9 p-0 shrink-0"
              aria-label="Przełącz motyw"
            >
              {resolved === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-8 py-8 sm:py-12 max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
          </div>
        ) : (
          <div className="space-y-6 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-6" data-variant="panel"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 glass rounded-2xl">{grade.icon}</div>
                <div className="flex-1">
                  <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1 font-medium tracking-wide">Poziom {level}</div>
                  <div className={`text-3xl font-black bg-gradient-to-r ${grade.color} bg-clip-text text-transparent`}>
                    {grade.title}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-amber-500 dark:text-amber-400">{currentXp}</div>
                  <div className="text-xs text-zinc-400 dark:text-zinc-500 font-bold tracking-widest mt-1">XP</div>
                </div>
              </div>

              <div className="h-4 glass rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${grade.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between mt-3 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                <span>Poziom {level}</span>
                <span>{currentXp} / {nextXp} XP</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-4"
            >
              <StatCard label="Poziom" value={`${level}`} icon={<BarChart2 className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />} />
              <StatCard label="Łączne XP" value={`${currentXp}`} icon={<Zap className="w-6 h-6 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />} />
              <StatCard label="Błędy" value={`${currentMistakes.length}`} icon={<RefreshCcw className="w-6 h-6 text-fuchsia-500 dark:text-fuchsia-400" />} />
            </motion.div>

            {currentMistakes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass p-6" data-variant="panel"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-zinc-700 dark:text-zinc-200 text-lg">Pytania do powtórki</h3>
                  <span className="text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400 glass px-3 py-1.5 rounded-full">{currentMistakes.length} błędów</span>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Masz {currentMistakes.length} pytań, na które odpowiedziałeś źle. Użyj trybu &quot;Popraw błędy&quot; aby je przećwiczyć.
                </p>
                <a
                  href="/app"
                  className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
                >
                  Rozpocznij powtórkę →
                </a>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass p-6 text-center flex flex-col items-center" data-variant="panel"
            >
              <Target className="w-10 h-10 text-zinc-400 dark:text-zinc-500 mb-4" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
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
    <div className="glass p-5 text-center flex flex-col items-center" data-variant="card">
      <div className="mb-3 p-3 glass rounded-xl">{icon}</div>
      <div className="text-2xl font-black text-zinc-800 dark:text-white tracking-tight">{value}</div>
      <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 font-medium tracking-wide">{label}</div>
    </div>
  )
}
