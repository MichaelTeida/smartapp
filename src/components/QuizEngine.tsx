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
      if (ki !== -1 && !answered) {
        selectAnswer(ki)
        return
      }
      if ((e.key === 'Enter' || e.key === ' ') && answered) {
        e.preventDefault()
        handleNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [answered, selectAnswer, handleNext])

  useEffect(() => {
    if (answered && selectedAnswer !== null && question?.options[selectedAnswer]?.isCorrect) {
      setShowConfetti(true)
    }
  }, [answered, selectedAnswer, question])

  if (finished) {
    return <QuizResult result={getResult()} onReset={reset} onReplay={replay} />
  }

  if (!question) return null

  const correctIdx = question.options.findIndex(o => o.isCorrect)
  const isCorrect = selectedAnswer !== null && question.options[selectedAnswer].isCorrect

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0a0e1a]">
      <Confetti active={showConfetti} />

      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <button onClick={reset} className="text-zinc-400 hover:text-white transition-colors shrink-0" aria-label="Zamknij quiz">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
          <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
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
            <h2 className="text-lg sm:text-2xl font-bold text-white mb-6 sm:mb-8 leading-relaxed">
              {question.question}
            </h2>

            <div className="grid gap-2 sm:gap-3">
              {question.options.map((opt, i) => {
                let style = 'border-zinc-700/50 bg-zinc-800/40 hover:bg-zinc-700/50 hover:border-zinc-600 text-zinc-100'

                if (answered) {
                  if (i === correctIdx) {
                    style = 'border-emerald-500 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                  } else if (i === selectedAnswer && !isCorrect) {
                    style = 'border-red-500 bg-red-500/15 text-red-300 ring-1 ring-red-500/30'
                  } else {
                    style = 'border-zinc-800 bg-zinc-900/50 text-zinc-600'
                  }
                }

                return (
                  <motion.button
                    key={i}
                    onClick={() => !answered && selectAnswer(i)}
                    disabled={answered}
                    whileHover={!answered ? { scale: 1.01 } : {}}
                    whileTap={!answered ? { scale: 0.99 } : {}}
                    className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer disabled:cursor-default min-h-[3rem] ${style}`}
                  >
                    <span className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold ${answered && i === correctIdx
                        ? 'bg-emerald-500 text-white'
                        : answered && i === selectedAnswer && !isCorrect
                          ? 'bg-red-500 text-white'
                          : 'bg-zinc-700/60 text-zinc-300'
                      }`}>
                      <span className="opacity-50 text-[10px] mr-0.5">{keys[i]}</span>
                      {labels[i]}
                    </span>
                    <span className="text-sm sm:text-base leading-snug">{opt.text}</span>
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
            className={`border-t-2 ${isCorrect
                ? 'bg-emerald-950/80 border-emerald-500/40'
                : 'bg-red-950/80 border-red-500/40'
              }`}
          >
            <div className="max-w-2xl mx-auto px-4 sm:px-8 py-4 sm:py-5">
              <div className="flex items-start gap-3 mb-2 sm:mb-3">
                {isCorrect ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-emerald-400">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-red-400">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                )}
                <h3 className={`text-lg font-bold ${isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
                  {isCorrect ? 'Znakomicie!' : 'Błąd!'}
                </h3>
              </div>

              {!isCorrect && selectedAnswer !== null && question.options[selectedAnswer].wrongExplanation && (
                <p className="text-red-200/80 text-sm mb-2 pl-10">
                  {question.options[selectedAnswer].wrongExplanation}
                </p>
              )}

              <p className={`text-sm leading-relaxed pl-10 ${isCorrect ? 'text-emerald-200/80' : 'text-zinc-300/80'}`}>
                {question.correctExplanation}
              </p>

              <div className="mt-3 sm:mt-4 flex justify-end">
                <motion.button
                  onClick={handleNext}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold text-sm tracking-wide transition-all ${isCorrect
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/25'
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
