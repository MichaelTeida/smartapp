'use client'

import { SignInButton, useAuth } from '@clerk/nextjs'
import { BrainCircuit, ArrowRight, MonitorPlay, Trophy, Zap } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth()

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-16 relative">
      <main className="max-w-3xl mx-auto flex flex-col items-center text-center">

        <div className="animate-fade-in mb-10 inline-flex items-center gap-2 px-4 py-2 rounded-full glass" data-variant="interactive">
          <BrainCircuit className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Przestań czytać. Zacznij się sprawdzać.</span>
        </div>

        <h1 className="animate-fade-in delay-1 text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-[1.1] text-zinc-900 dark:text-white">
          Elitarna kuźnia
          <br />
          <span className="gradient-text">wiedzy IT.</span>
        </h1>

        <p className="animate-fade-in delay-2 text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mb-12 leading-relaxed">
          Zdobywaj XP, awansuj w rankingach i opanuj programowanie poprzez interaktywne quizy i bezlitosny tryb poprawy błędów.
        </p>

        <div className="animate-fade-in delay-3">
          {!isLoaded ? (
            <div className="px-8 py-4 glass rounded-full animate-pulse text-transparent">Loading</div>
          ) : isSignedIn ? (
            <Link
              href="/app"
              className="btn-glass px-8 py-4 text-lg font-bold h-auto"
              data-variant="cta"
            >
              Kontynuuj naukę <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <SignInButton mode="modal" forceRedirectUrl="/app">
              <button className="btn-glass px-8 py-4 text-lg font-bold h-auto cursor-pointer" data-variant="cta">
                Rozpocznij za darmo <ArrowRight className="w-5 h-5" />
              </button>
            </SignInButton>
          )}
        </div>

        <div className="animate-fade-in delay-5 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-24 w-full">
          <FeatureCard
            icon={<MonitorPlay className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />}
            title="Praktyka"
            desc="Setki pytań rekrutacyjnych i architektonicznych."
          />
          <FeatureCard
            icon={<Trophy className="w-5 h-5 text-amber-500 dark:text-amber-400" />}
            title="Gamifikacja"
            desc="System XP, poziomy i rangi. Progresja, która motywuje."
          />
          <FeatureCard
            icon={<Zap className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />}
            title="Powtórki"
            desc="Tryb poprawy błędów upewni się, że nie zapomnisz."
          />
        </div>
      </main>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="glass p-6 text-left" data-variant="card">
      <div className="w-10 h-10 rounded-xl glass flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-zinc-800 dark:text-zinc-100 mb-1.5">{title}</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  )
}
