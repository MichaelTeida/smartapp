'use client'

import { useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuizStore } from '@/store/quizStore'
import QuizResult from './QuizResult'
import Confetti from './Confetti'

const keys = ['1', '2', '3', '4']
const labels = ['A', 'B', 'C', 'D']

export default function QuizEngine() {
  const {
    questions, currentIndex, selectedAnswer, answered, mode, finished,
    selectAnswer, nextQuestion, getResult, reset, replay,
  } = useQuizStore()

  const [showConfetti, setShowConfetti] = useState(false)
  const question = questions[currentIndex]

  const handleNext = useCallback(() => {
    if (!answered) return
    setShowConfetti(false)
    nextQuestion()
  }, [answered, nextQuestion])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const ki = keys.indexOf(e.key)
      if (ki !== -1 && !answered) { selectAnswer(ki); return }
      if ((e.key === 'Enter' || e.key === ' ') && answered) { e.preventDefault(); handleNext() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [answered, selectAnswer, handleNext])

  useEffect(() => {
    if (answered && selectedAnswer !== null && question?.options[selectedAnswer]?.isCorrect) {
      setShowConfetti(true)
    }
  }, [answered, selectedAnswer, question])

  if (finished) return <QuizResult result={getResult()} onReset={reset} onReplay={replay} />
  if (!question) return null

  const correctIdx = question.options.findIndex(o => o.isCorrect)
  const isCorrect = selectedAnswer !== null && question.options[selectedAnswer].isCorrect

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Confetti active={showConfetti} />

      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <button onClick={reset} className="text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors shrink-0" aria-label="Zamknij quiz">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
          <div className="flex-1 h-3 glass rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + (answered ? 1 : 0)) / questions.length) * 100}%` }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
          </div>
          <span className="text-zinc-400 text-sm font-mono min-w-[3.5rem] text-right shrink-0">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={`q-${currentIndex}-${question.id}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="text-lg sm:text-3xl font-bold text-zinc-800 dark:text-white mb-8 sm:mb-10 leading-relaxed tracking-wide">
              {question.question}
            </h2>

            <div className="grid gap-3 sm:gap-4">
              {question.options.map((opt, i) => {
                let style = 'glass cursor-pointer'
                let badgeStyle = 'glass'

                if (answered) {
                  if (i === correctIdx) {
                    style = 'bg-emerald-500/15 dark:bg-emerald-500/15 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30'
                    badgeStyle = 'bg-emerald-500 text-white'
                  } else if (i === selectedAnswer && !isCorrect) {
                    style = 'bg-red-500/15 dark:bg-red-500/15 border-2 border-red-500 text-red-700 dark:text-red-300 ring-1 ring-red-500/30'
                    badgeStyle = 'bg-red-500 text-white'
                  } else {
                    style = 'glass opacity-40'
                  }
                }

                return (
                  <motion.button
                    key={i}
                    onClick={() => !answered && selectAnswer(i)}
                    disabled={answered}
                    whileHover={!answered ? { scale: 1.01 } : {}}
                    whileTap={!answered ? { scale: 0.99 } : {}}
                    className={`flex items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-[var(--radius-panel)] text-left transition-all duration-200 disabled:cursor-default min-h-[4rem] ${style}`}
                  >
                    <span className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-sm sm:text-base font-bold ${badgeStyle}`}>
                      <span className="opacity-40 text-[10px] mr-1 hidden sm:inline">{keys[i]}</span>
                      {labels[i]}
                    </span>
                    <span className="text-base sm:text-lg leading-snug font-medium text-zinc-700 dark:text-zinc-200">{opt.text}</span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`glass rounded-t-[var(--radius-panel)] border-t-2 ${isCorrect
              ? 'border-emerald-500/40'
              : 'border-red-500/40'
            }`}
          >
            <div className="max-w-2xl mx-auto px-4 sm:px-8 py-4 sm:py-5">
              <div className="flex items-start gap-3 mb-2 sm:mb-3">
                {isCorrect ? (
                  <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200 }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-emerald-500 dark:text-emerald-400">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-red-500 dark:text-red-400">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                )}
                <h3 className={`text-lg font-bold ${isCorrect ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-600 dark:text-red-300'}`}>
                  {isCorrect ? 'Znakomicie!' : 'Błąd!'}
                </h3>
              </div>

              {!isCorrect && selectedAnswer !== null && question.options[selectedAnswer].wrongExplanation && (
                <p className="text-red-600/80 dark:text-red-200/80 text-sm mb-2 pl-10">
                  {question.options[selectedAnswer].wrongExplanation}
                </p>
              )}

              <p className={`text-sm leading-relaxed pl-10 ${isCorrect ? 'text-emerald-700/80 dark:text-emerald-200/80' : 'text-zinc-600 dark:text-zinc-300/80'}`}>
                {question.correctExplanation}
              </p>

              <div className="mt-3 sm:mt-4 flex justify-end">
                <motion.button
                  onClick={handleNext}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`btn-glass px-6 sm:px-8 py-2.5 sm:py-3 h-auto font-bold text-sm tracking-wide ${isCorrect
                    ? 'bg-emerald-500/80 text-white hover:bg-emerald-400/80'
                    : 'bg-red-500/80 text-white hover:bg-red-400/80'
                  }`}
                >
                  {mode === 'nieskonczonosc' || currentIndex < questions.length - 1
                    ? 'Dalej →'
                    : 'Zobacz wynik'}
                  <span className="ml-2 text-[10px] opacity-60">Enter</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
