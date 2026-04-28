'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { QuizQuestion, Difficulty, GameMode, QuizResult } from '@/types/quiz'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface AnswerRecord {
  questionId: string
  selectedIndex: number
  correct: boolean
}

interface QuizState {
  category: string | null
  difficulty: Difficulty | null
  mode: GameMode | null
  questions: QuizQuestion[]
  currentIndex: number
  selectedAnswer: number | null
  answered: boolean
  answers: AnswerRecord[]
  xp: number
  mistakes: string[]
  finished: boolean
  syncing: boolean

  startQuiz: (category: string, difficulty: Difficulty, mode: GameMode, questions: QuizQuestion[]) => void
  selectAnswer: (index: number) => void
  nextQuestion: () => void
  getResult: () => QuizResult
  reset: () => void
  replay: () => void
  syncFromServer: () => Promise<void>
  syncToServer: () => Promise<void>
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      category: null,
      difficulty: null,
      mode: null,
      questions: [],
      currentIndex: 0,
      selectedAnswer: null,
      answered: false,
      answers: [],
      xp: 0,
      mistakes: [],
      finished: false,
      syncing: false,

      startQuiz: (category, difficulty, mode, questions) => {
        let pool = shuffle(questions)
        if (mode === 'egzamin') pool = pool.slice(0, 20)
        set({
          category,
          difficulty,
          mode,
          questions: pool,
          currentIndex: 0,
          selectedAnswer: null,
          answered: false,
          answers: [],
          finished: false,
        })
      },

      selectAnswer: (index) => {
        const { answered, questions, currentIndex, answers, mistakes, xp } = get()
        if (answered) return

        const q = questions[currentIndex]
        const correct = q.options[index].isCorrect
        const newAnswers = [...answers, { questionId: q.id, selectedIndex: index, correct }]
        const newMistakes = correct
          ? mistakes
          : mistakes.includes(q.id) ? mistakes : [...mistakes, q.id]

        set({
          selectedAnswer: index,
          answered: true,
          answers: newAnswers,
          xp: correct ? xp + 10 : xp,
          mistakes: newMistakes,
        })
      },

      nextQuestion: () => {
        const { currentIndex, questions, mode } = get()
        const next = currentIndex + 1

        if (mode === 'nieskonczonosc' && next >= questions.length) {
          set({ currentIndex: 0, questions: shuffle(questions), selectedAnswer: null, answered: false })
          return
        }

        if (next >= questions.length) {
          set({ finished: true })
          get().syncToServer()
          return
        }

        set({ currentIndex: next, selectedAnswer: null, answered: false })
      },

      getResult: () => {
        const { answers, questions } = get()
        const correct = answers.filter(a => a.correct).length
        return {
          totalQuestions: questions.length,
          correctAnswers: correct,
          wrongAnswers: answers.length - correct,
          score: Math.round((correct / questions.length) * 100),
          answers,
        }
      },

      replay: () => {
        const { category, difficulty, mode, questions } = get()
        if (!category || !difficulty || !mode) return
        let pool = shuffle(questions)
        if (mode === 'egzamin') pool = pool.slice(0, 20)
        set({
          questions: pool,
          currentIndex: 0,
          selectedAnswer: null,
          answered: false,
          answers: [],
          finished: false,
        })
      },

      reset: () => set({
        category: null,
        difficulty: null,
        mode: null,
        questions: [],
        currentIndex: 0,
        selectedAnswer: null,
        answered: false,
        answers: [],
        finished: false,
      }),

      syncFromServer: async () => {
        try {
          set({ syncing: true })
          const res = await fetch('/api/user')
          if (res.ok) {
            const user = await res.json()
            set({ xp: user.xp ?? 0, mistakes: user.mistakes ?? [] })
          } else if (res.status === 404) {
            await fetch('/api/user', { method: 'POST' })
          }
        } catch { /* offline fallback to localStorage */ }
        finally { set({ syncing: false }) }
      },

      syncToServer: async () => {
        try {
          const { xp, mistakes } = get()
          await fetch('/api/user', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ xp, mistakes }),
          })
        } catch { /* silent fail, localStorage has the data */ }
      },
    }),
    {
      name: 'mindforge-quiz',
      partialize: (state) => ({ xp: state.xp, mistakes: state.mistakes }),
    }
  )
)
