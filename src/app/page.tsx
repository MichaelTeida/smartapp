'use client'

import { motion } from 'framer-motion'
import { SignInButton, useAuth } from '@clerk/nextjs'
import { MonitorPlay, Trophy, Zap, BrainCircuit, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] },
})

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth()

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-16 relative">
      <main className="max-w-3xl mx-auto flex flex-col items-center text-center">

        <motion.div {...fade(0)} className="mb-10 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/80">
          <BrainCircuit className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-medium text-zinc-400">Przestań czytać. Zacznij się sprawdzać.</span>
        </motion.div>

        <motion.h1 {...fade(0.1)} className="text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
          Elitarna kuźnia
          <br />
          <span className="text-violet-400">wiedzy IT.</span>
        </motion.h1>

        <motion.p {...fade(0.2)} className="text-lg text-zinc-500 max-w-xl mb-12 leading-relaxed">
          Zdobywaj XP, awansuj w rankingach i opanuj programowanie poprzez interaktywne quizy i bezlitosny tryb poprawy błędów.
        </motion.p>

        <motion.div {...fade(0.35)}>
          {!isLoaded ? (
            <div className="px-8 py-4 bg-zinc-900 rounded-full animate-pulse text-transparent">Loading</div>
          ) : isSignedIn ? (
            <Link
              href="/app"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-violet-500 hover:bg-violet-400 text-white rounded-full font-bold text-lg transition-colors"
            >
              Kontynuuj naukę <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <SignInButton mode="modal" forceRedirectUrl="/app">
              <button className="inline-flex items-center gap-2.5 px-8 py-4 bg-white hover:bg-zinc-100 text-zinc-900 rounded-full font-bold text-lg transition-colors cursor-pointer">
                Rozpocznij za darmo <ArrowRight className="w-5 h-5" />
              </button>
            </SignInButton>
          )}
        </motion.div>

        <motion.div {...fade(0.5)} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-24 w-full">
          <FeatureCard
            icon={<MonitorPlay className="w-5 h-5 text-emerald-400" />}
            title="Praktyka"
            desc="Setki pytań rekrutacyjnych i architektonicznych."
          />
          <FeatureCard
            icon={<Trophy className="w-5 h-5 text-amber-400" />}
            title="Gamifikacja"
            desc="System XP, poziomy i rangi. Progresja, która motywuje."
          />
          <FeatureCard
            icon={<Zap className="w-5 h-5 text-violet-400" />}
            title="Powtórki"
            desc="Tryb poprawy błędów upewni się, że nie zapomnisz."
          />
        </motion.div>
      </main>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-left">
      <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-zinc-100 mb-1.5">{title}</h3>
      <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
    </div>
  )
}
