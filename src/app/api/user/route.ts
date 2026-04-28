import { NextRequest } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) return Response.json({ error: 'email required' }, { status: 400 })

  await dbConnect()
  const user = await User.findOne({ email })
  if (!user) return Response.json({ error: 'not found' }, { status: 404 })

  return Response.json(user)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email } = body
  if (!email) return Response.json({ error: 'email required' }, { status: 400 })

  await dbConnect()
  const user = await User.findOneAndUpdate(
    { email },
    { $setOnInsert: { email, xp: 0, mistakes: [] } },
    { upsert: true, new: true }
  )

  return Response.json(user)
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { email, xp, mistakes, categoryProgress } = body
  if (!email) return Response.json({ error: 'email required' }, { status: 400 })

  await dbConnect()

  const update: Record<string, unknown> = {}
  if (typeof xp === 'number') update.xp = xp
  if (Array.isArray(mistakes)) update.mistakes = mistakes
  if (categoryProgress) update.categoryProgress = categoryProgress

  const user = await User.findOneAndUpdate({ email }, { $set: update }, { new: true })
  if (!user) return Response.json({ error: 'not found' }, { status: 404 })

  return Response.json(user)
}
