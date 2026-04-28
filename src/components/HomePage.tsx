'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserButton } from '@clerk/nextjs'
import { useQuizStore } from '@/store/quizStore'
import { useSyncUser } from '@/hooks/useSyncUser'
import type { CategoryData, Difficulty, GameMode } from '@/types/quiz'
import QuizEngine from '@/components/QuizEngine'

import {
  Terminal, Server, Atom, Target, Cpu, BookOpen, Dna, Calculator, Globe, FileText,
  Infinity as InfinityIcon, RefreshCcw, ChevronLeft, Zap, ArrowRight,
} from 'lucide-react'

const getCategoryIcon = (name: string) => {
  const s = 'w-6 h-6'
  switch (name) {
    case 'Programowanie': return <Terminal className={`${s} text-emerald-400`} />
    case 'IT': return <Server className={`${s} text-blue-400`} />
    case 'React': return <Atom className={`${s} text-cyan-400`} />
    case 'Test od rekrutera IT': return <Target className={`${s} text-red-400`} />
    case 'Informatyka': return <Cpu className={`${s} text-purple-400`} />
    case 'Język Polski': return <BookOpen className={`${s} text-amber-400`} />
    case 'Biologia': return <Dna className={`${s} text-green-400`} />
    case 'Matematyka': return <Calculator className={`${s} text-orange-400`} />
    case 'Geografia': return <Globe className={`${s} text-sky-400`} />
    default: return <FileText className={`${s} text-zinc-500`} />
  }
}

const modeInfo: { id: GameMode; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'egzamin', label: 'Egzamin', desc: '20 losowych pytań, wynik na końcu', icon: <FileText className="w-5 h-5 text-emerald-400" /> },
  { id: 'nieskonczonosc', label: 'Nieskończoność', desc: 'Pytania w nieskończoność, tryb treningowy', icon: <InfinityIcon className="w-5 h-5 text-cyan-400" /> },
  { id: 'popraw-bledy', label: 'Popraw błędy', desc: 'Pytania, na które wcześniej odpowiedziałeś źle', icon: <RefreshCcw className="w-5 h-5 text-amber-400" /> },
]

type Step = 'home' | 'difficulty' | 'mode' | 'playing'

export default function HomePage() {
  const [step, setStep] = useState<Step>('home')
  const [selectedCat, setSelectedCat] = useState<string | null>(null)
  const [selectedDiff, setSelectedDiff] = useState<Difficulty | null>(null)
  const [mounted, setMounted] = useState(false)

  const { startQuiz, mistakes, questions, xp } = useQuizStore()
  useSyncUser()
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => { setCategories(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function getCategoryByName(name: string) { return categories.find(c => c.category === name) }
  function pickCategory(name: string) { setSelectedCat(name); setStep('difficulty') }
  function pickDifficulty(d: Difficulty) { setSelectedDiff(d); setStep('mode') }

  function pickMode(m: GameMode) {
    if (!selectedCat || !selectedDiff) return
    const cat = getCategoryByName(selectedCat)
    if (!cat) return
    let pool = cat.levels[selectedDiff]
    if (m === 'popraw-bledy') {
      const all = [...cat.levels.Podstawowy, ...cat.levels.Zaawansowany]
      pool = all.filter(q => mistakes.includes(q.id))
      if (pool.length === 0) { alert('Brak błędów do poprawienia w tej kategorii!'); return }
    }
    startQuiz(selectedCat, selectedDiff, m, pool)
    setStep('playing')
  }

  function goBack() {
    if (step === 'mode') setStep('difficulty')
    else if (step === 'difficulty') setStep('home')
  }

  if (step === 'playing' && questions.length > 0) return <QuizEngine />

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Header */}
      <header className="px-6 h-16 flex items-center border-b border-zinc-800/60">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AnimatePresence mode="popLayout">
              {step !== 'home' && (
                <motion.button
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  onClick={goBack}
                  className="text-zinc-500 hover:text-white transition-colors p-1 -ml-1 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
            <span className="text-lg font-black tracking-tight text-white">Mindforge</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/profile"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition-colors text-sm font-semibold text-zinc-300"
            >
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              {mounted ? xp : 0} XP
            </a>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 py-10 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-1">Wybierz kategorię</h2>
                <p className="text-sm text-zinc-500">Ucz się, ćwicz i zdobywaj XP</p>
              </div>

              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="w-6 h-6 border-2 border-zinc-700 border-t-violet-400 rounded-full animate-spin" />
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-16 text-zinc-600">Brak kategorii. Dodaj je w panelu admina.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categories.map((cat, i) => {
                    const total = cat.levels.Podstawowy.length + cat.levels.Zaawansowany.length
                    return (
                      <motion.button
                        key={cat.category}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => pickCategory(cat.category)}
                        className="group flex items-center gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all text-left"
                      >
                        <div className="shrink-0 w-11 h-11 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                          {getCategoryIcon(cat.category)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-zinc-100 truncate">{cat.category}</div>
                          <div className="text-xs text-zinc-500">{total} pytań</div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {step === 'difficulty' && selectedCat && (
            <motion.div key="difficulty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  {getCategoryIcon(selectedCat)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedCat}</h2>
                  <p className="text-sm text-zinc-500">Wybierz poziom trudności</p>
                </div>
              </div>

              <div className="grid gap-3 max-w-md">
                {(['Podstawowy', 'Zaawansowany'] as Difficulty[]).map(d => {
                  const cat = getCategoryByName(selectedCat)
                  const count = cat ? cat.levels[d].length : 0
                  return (
                    <motion.button
                      key={d}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => pickDifficulty(d)}
                      className="flex items-center justify-between p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all"
                    >
                      <div className="text-left">
                        <div className="font-semibold text-zinc-100 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${d === 'Podstawowy' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          {d}
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">{count} pytań</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-600" />
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {step === 'mode' && (
            <motion.div key="mode" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-1">Wybierz tryb gry</h2>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <span>{selectedCat}</span>
                  <span className="text-zinc-700">·</span>
                  <span>{selectedDiff}</span>
                </div>
              </div>

              <div className="grid gap-3 max-w-md">
                {modeInfo.map(m => (
                  <motion.button
                    key={m.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => pickMode(m.id)}
                    className="flex items-center gap-4 p-5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all text-left"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                      {m.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-100">{m.label}</div>
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
