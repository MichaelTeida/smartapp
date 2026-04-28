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

  startQuiz: (category: string, difficulty: Difficulty, mode: GameMode, questions: QuizQuestion[]) => void
  selectAnswer: (index: number) => void
  nextQuestion: () => void
  getResult: () => QuizResult
  reset: () => void
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
    }),
    {
      name: 'mindforge-quiz',
      partialize: (state) => ({ xp: state.xp, mistakes: state.mistakes }),
    }
  )
)
