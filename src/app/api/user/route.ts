import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

async function getClerkId() {
  const { userId } = await auth()
  return userId
}

export async function GET() {
  const clerkId = await getClerkId()
  if (!clerkId) return Response.json({ error: 'unauthorized' }, { status: 401 })

  await dbConnect()
  const user = await User.findOne({ clerkId })
  if (!user) return Response.json({ error: 'not found' }, { status: 404 })

  return Response.json(user)
}

export async function POST() {
  const clerkId = await getClerkId()
  if (!clerkId) return Response.json({ error: 'unauthorized' }, { status: 401 })

  await dbConnect()
  const user = await User.findOneAndUpdate(
    { clerkId },
    { $setOnInsert: { clerkId, xp: 0, mistakes: [] } },
    { upsert: true, new: true }
  )

  return Response.json(user)
}

export async function PATCH(req: NextRequest) {
  const clerkId = await getClerkId()
  if (!clerkId) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json()
  const { xp, mistakes, categoryProgress } = body

  await dbConnect()

  const update: Record<string, unknown> = {}
  if (typeof xp === 'number') update.xp = xp
  if (Array.isArray(mistakes)) update.mistakes = mistakes
  if (categoryProgress) update.categoryProgress = categoryProgress

  const user = await User.findOneAndUpdate({ clerkId }, { $set: update }, { new: true })
  if (!user) return Response.json({ error: 'not found' }, { status: 404 })

  return Response.json(user)
}
