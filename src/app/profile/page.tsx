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
    level >= 8 ? { title: 'Mistrz', color: 'from-amber-400 to-orange-500', icon: '🏆' } :
    level >= 5 ? { title: 'Ekspert', color: 'from-purple-400 to-pink-500', icon: '⭐' } :
    level >= 3 ? { title: 'Adept', color: 'from-cyan-400 to-blue-500', icon: '📘' } :
    { title: 'Początkujący', color: 'from-emerald-400 to-teal-500', icon: '🌱' }

  return (
    <div className="min-h-[100dvh] bg-[#0a0e1a] text-white">
      <header className="px-4 sm:px-8 pt-6 pb-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-zinc-400 hover:text-white transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </a>
            <h1 className="text-xl font-black">
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Profil</span>
            </h1>
          </div>
          <UserButton />
        </div>
      </header>

      <main className="px-4 sm:px-8 max-w-2xl mx-auto pb-12">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Level Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-zinc-800/50 border border-zinc-700/40"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl">{grade.icon}</div>
                <div className="flex-1">
                  <div className="text-sm text-zinc-500">Poziom {level}</div>
                  <div className={`text-2xl font-black bg-gradient-to-r ${grade.color} bg-clip-text text-transparent`}>
                    {grade.title}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-amber-400">{currentXp}</div>
                  <div className="text-xs text-zinc-500">XP</div>
                </div>
              </div>

              <div className="h-3 bg-zinc-900 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${grade.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-xs text-zinc-500">
                <span>Poziom {level}</span>
                <span>{currentXp} / {nextXp} XP</span>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-3"
            >
              <StatCard label="Poziom" value={`${level}`} icon="📊" />
              <StatCard label="Łączne XP" value={`${currentXp}`} icon="⚡" />
              <StatCard label="Błędy do poprawy" value={`${currentMistakes.length}`} icon="🔄" />
            </motion.div>

            {/* Mistakes Section */}
            {currentMistakes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-5 rounded-2xl bg-zinc-800/50 border border-zinc-700/40"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-zinc-200">Pytania do powtórki</h3>
                  <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-full">{currentMistakes.length} błędów</span>
                </div>
                <p className="text-sm text-zinc-500">
                  Masz {currentMistakes.length} pytań, na które odpowiedziałeś źle. Użyj trybu &quot;Popraw błędy&quot; aby je przećwiczyć.
                </p>
                <a
                  href="/"
                  className="inline-block mt-3 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
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
              className="p-5 rounded-2xl bg-zinc-800/30 border border-zinc-700/20 text-center"
            >
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-sm text-zinc-500">
                Rozwiązuj quizy codziennie, aby zdobywać XP i awansować na wyższe poziomy!
              </p>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/30 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-black text-white">{value}</div>
      <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
    </div>
  )
}
