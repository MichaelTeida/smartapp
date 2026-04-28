import mongoose, { Schema, type Document } from 'mongoose'

export interface IUser extends Document {
  clerkId: string
  xp: number
  categoryProgress: Map<string, { basic: number; advanced: number }>
  mistakes: string[]
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true },
    xp: { type: Number, default: 0 },
    categoryProgress: {
      type: Map,
      of: new Schema({ basic: { type: Number, default: 0 }, advanced: { type: Number, default: 0 } }, { _id: false }),
      default: new Map(),
    },
    mistakes: { type: [String], default: [] },
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
