import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '@/lib/mongodb'
import Category from '@/models/Category'

export async function GET() {
  await dbConnect()
  const categories = await Category.find({}, { category: 1, _id: 0 })
  return Response.json(categories.map(c => c.category))
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json()
  const { category, levels } = body

  if (!category || !levels?.Podstawowy || !levels?.Zaawansowany) {
    return Response.json({ error: 'Invalid format: needs category, levels.Podstawowy, levels.Zaawansowany' }, { status: 400 })
  }

  await dbConnect()
  const result = await Category.findOneAndUpdate(
    { category },
    { $set: { category, levels } },
    { upsert: true, new: true }
  )

  return Response.json({ ok: true, category: result.category, questions: result.levels.Podstawowy.length + result.levels.Zaawansowany.length })
}
