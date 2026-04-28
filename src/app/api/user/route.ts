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
  let user = await User.findOne({ clerkId })

  if (!user) {
    user = await User.create({ clerkId, xp: 0, mistakes: [] })
  }

  return Response.json(user)
}

export async function POST(req: NextRequest) {
  const clerkId = await getClerkId()
  if (!clerkId) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { xp, mistakes } = body

  await dbConnect()
  const user = await User.findOneAndUpdate(
    { clerkId },
    {
      $setOnInsert: { clerkId },
      $set: {
        ...(typeof xp === 'number' ? { xp } : {}),
        ...(Array.isArray(mistakes) ? { mistakes } : {}),
      },
    },
    { upsert: true, new: true }
  )

  return Response.json(user)
}

export async function PATCH(req: NextRequest) {
  const clerkId = await getClerkId()
  if (!clerkId) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json()
  const { xp, mistakes } = body

  await dbConnect()

  const user = await User.findOneAndUpdate(
    { clerkId },
    {
      $setOnInsert: { clerkId },
      $set: {
        ...(typeof xp === 'number' ? { xp } : {}),
        ...(Array.isArray(mistakes) ? { mistakes } : {}),
      },
    },
    { upsert: true, new: true }
  )

  return Response.json(user)
}
