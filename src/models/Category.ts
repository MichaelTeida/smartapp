import mongoose, { Schema, type Document } from 'mongoose'

const QuizOptionSchema = new Schema({ text: String, isCorrect: Boolean, wrongExplanation: String }, { _id: false })
const QuizQuestionSchema = new Schema({ id: String, question: String, options: [QuizOptionSchema], correctExplanation: String }, { _id: false })

export interface ICategory extends Document {
  category: string
  levels: {
    Podstawowy: typeof QuizQuestionSchema[]
    Zaawansowany: typeof QuizQuestionSchema[]
  }
}

const CategorySchema = new Schema<ICategory>({
  category: { type: String, required: true, unique: true },
  levels: {
    Podstawowy: [QuizQuestionSchema],
    Zaawansowany: [QuizQuestionSchema],
  },
})

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema)
