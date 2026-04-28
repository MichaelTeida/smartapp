'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuizStore } from '@/store/quizStore'
import { getCategories, getCategoryByName } from '@/lib/categories'
import type { Difficulty, GameMode } from '@/types/quiz'
import QuizEngine from '@/components/QuizEngine'

const categoryIcons: Record<string, string> = {
  'Programowanie': '💻', 'IT': '🖥️', 'React': '⚛️',
  'Test od rekrutera IT': '🎯', 'Informatyka': '🔬',
  'Język Polski': '📖', 'Biologia': '🧬',
  'Matematyka': '📐', 'Geografia': '🌍',
}

const modeInfo: { id: GameMode; label: string; desc: string; icon: string }[] = [
  { id: 'egzamin', label: 'Egzamin', desc: '20 losowych pytań, wynik na końcu', icon: '📝' },
  { id: 'nieskonczonosc', label: 'Nieskończoność', desc: 'Pytania w nieskończoność, tryb treningowy', icon: '♾️' },
  { id: 'popraw-bledy', label: 'Popraw błędy', desc: 'Pytania, na które wcześniej odpowiedziałeś źle', icon: '🔄' },
]

type Step = 'home' | 'difficulty' | 'mode' | 'playing'

export default function HomePage() {
  const [step, setStep] = useState<Step>('home')
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [selectedDiff, setSelectedDiff] = useState<Difficulty | null>(null)

  const { startQuiz, mistakes, questions } = useQuizStore()
  const categories = getCategories()

  function pickCategory(name: string) {
    setSelectedCat(name)
    setStep('difficulty')
  }

  function pickDifficulty(d: Difficulty) {
    setSelectedDiff(d)
    setStep('mode')
  }

  function pickMode(m: GameMode) {
    if (!selectedCat || !selectedDiff) return
    const cat = getCategoryByName(selectedCat)
    if (!cat) return

    let pool = cat.levels[selectedDiff]

    if (m === 'popraw-bledy') {
      pool = pool.filter(q => mistakes.includes(q.id))
      if (pool.length === 0) {
        alert('Brak błędów do poprawienia w tej kategorii!')
        return
      }
    }

    startQuiz(selectedCat, selectedDiff, m, pool)
    setStep('playing')
  }

  function goBack() {
    if (step === 'mode') setStep('difficulty')
    else if (step === 'difficulty') setStep('home')
  }

  if (step === 'playing' && questions.length > 0) {
    return <QuizEngine />
  }

  return (
    <div className="min-h-[100dvh] bg-[#0a0e1a] text-white">
      {/* Header */}
      <header className="px-4 sm:px-8 pt-6 pb-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step !== 'home' && (
              <button onClick={goBack} className="text-zinc-400 hover:text-white transition-colors mr-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </button>
            )}
            <h1 className="text-2xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Mindforge
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-zinc-800/60 px-3 py-1.5 rounded-full border border-zinc-700/50">
            <span className="text-amber-400 text-sm">⚡</span>
            <span className="text-sm font-bold text-zinc-200">
              {useQuizStore.getState().xp} XP
            </span>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-8 pb-12 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-8 mt-4">
                <h2 className="text-xl font-bold text-zinc-200 mb-1">Wybierz kategorię</h2>
                <p className="text-sm text-zinc-500">Ucz się, ćwicz i zdobywaj XP</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map((cat, i) => {
                  const total = cat.levels.Podstawowy.length + cat.levels.Zaawansowany.length
                  return (
                    <motion.button
                      key={cat.category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => pickCategory(cat.category)}
                      className="group flex items-center gap-4 p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/40 hover:bg-zinc-800/70 hover:border-zinc-600 transition-all text-left"
                    >
                      <span className="text-3xl shrink-0 group-hover:scale-110 transition-transform">
                        {categoryIcons[cat.category] || '📋'}
                      </span>
                      <div>
                        <div className="font-bold text-zinc-100 group-hover:text-white transition-colors">
                          {cat.category}
                        </div>
                        <div className="text-xs text-zinc-500">{total} pytań</div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {step === 'difficulty' && selectedCat && (
            <motion.div
              key="difficulty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-8 mt-4">
                <h2 className="text-xl font-bold text-zinc-200 mb-1">
                  {categoryIcons[selectedCat]} {selectedCat}
                </h2>
                <p className="text-sm text-zinc-500">Wybierz poziom trudności</p>
              </div>

              <div className="grid gap-3 max-w-md">
                {(['Podstawowy', 'Zaawansowany'] as Difficulty[]).map(d => {
                  const cat = getCategoryByName(selectedCat)
                  const count = cat ? cat.levels[d].length : 0
                  return (
                    <motion.button
                      key={d}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => pickDifficulty(d)}
                      className="flex items-center justify-between p-5 rounded-xl bg-zinc-800/40 border border-zinc-700/40 hover:bg-zinc-800/70 hover:border-zinc-600 transition-all"
                    >
                      <div className="text-left">
                        <div className="font-bold text-lg text-zinc-100">
                          {d === 'Podstawowy' ? '🟢' : '🔴'} {d}
                        </div>
                        <div className="text-xs text-zinc-500 mt-0.5">{count} pytań dostępnych</div>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500"><path d="M9 18l6-6-6-6"/></svg>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {step === 'mode' && (
            <motion.div
              key="mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-8 mt-4">
                <h2 className="text-xl font-bold text-zinc-200 mb-1">Wybierz tryb gry</h2>
                <p className="text-sm text-zinc-500">
                  {categoryIcons[selectedCat!]} {selectedCat} · {selectedDiff}
                </p>
              </div>

              <div className="grid gap-3 max-w-md">
                {modeInfo.map(m => (
                  <motion.button
                    key={m.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => pickMode(m.id)}
                    className="flex items-center gap-4 p-5 rounded-xl bg-zinc-800/40 border border-zinc-700/40 hover:bg-zinc-800/70 hover:border-zinc-600 transition-all text-left"
                  >
                    <span className="text-2xl shrink-0">{m.icon}</span>
                    <div>
                      <div className="font-bold text-zinc-100">{m.label}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{m.desc}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
