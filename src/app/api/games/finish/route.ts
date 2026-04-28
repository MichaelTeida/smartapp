import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { correctAnswers, newMistakes = [], resolvedMistakes = [] } = body

  if (typeof correctAnswers !== 'number') {
    return Response.json({ error: 'invalid data' }, { status: 400 })
  }

  // Obliczamy XP po stronie serwera (np. 10 XP za poprawną odpowiedź)
  const earnedXp = correctAnswers * 10

  await dbConnect()

  // Zabezpieczona aktualizacja w bazie - dodajemy XP, usuwamy naprawione błędy, dodajemy nowe
  const user = await User.findOneAndUpdate(
    { clerkId },
    {
      $setOnInsert: { clerkId },
      $inc: { xp: earnedXp },
      $addToSet: { mistakes: { $each: newMistakes } }
    },
    { upsert: true, new: true }
  )

  // Jeśli gracz poprawił jakieś błędy (np. w trybie Popraw błędy), usuwamy je
  let finalUser = user
  if (resolvedMistakes.length > 0) {
    finalUser = await User.findOneAndUpdate(
      { clerkId },
      { $pullAll: { mistakes: resolvedMistakes } },
      { new: true }
    )
  }

  return Response.json(finalUser)
}
