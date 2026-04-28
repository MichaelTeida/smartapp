export interface QuizOption {
  text: string
  isCorrect: boolean
  wrongExplanation: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: QuizOption[]
  correctExplanation: string
}

export interface CategoryData {
  category: string
  levels: {
    Podstawowy: QuizQuestion[]
    Zaawansowany: QuizQuestion[]
  }
}

export type Difficulty = 'Podstawowy' | 'Zaawansowany'
export type GameMode = 'egzamin' | 'nieskonczonosc' | 'popraw-bledy'

export interface QuizResult {
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  score: number
  answers: {
    questionId: string
    selectedIndex: number
    correct: boolean
  }[]
}
