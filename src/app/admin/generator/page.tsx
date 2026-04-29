'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth, RedirectToSignIn } from '@clerk/nextjs'
import { ArrowLeft, Copy, Check, Sparkles } from 'lucide-react'

export default function PromptGeneratorPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const [topic, setTopic] = useState('')
  const [copied, setCopied] = useState(false)

  if (!isLoaded) return null
  if (!isSignedIn) return <RedirectToSignIn />

  const promptText = `Wciel się w rolę eksperta i doświadczonego rekrutera IT/technicznego. Twoim zadaniem jest wygenerowanie bazy pytań do quizu edukacyjnego na temat: "${topic || '[WPISZ TEMAT]'}".

Zwróć dokładnie jeden plik JSON o poniższej strukturze. Nie dodawaj żadnego innego tekstu, markdownu ani wstępu.

Struktura JSON:
{
  "category": "${topic || 'Nazwa Kategorii'}",
  "levels": {
    "Podstawowy": [
      {
        "id": "wygeneruj-unikalne-uuid-v4",
        "question": "Treść pytania podstawowego?",
        "options": [
          {
            "text": "Poprawna odpowiedź",
            "isCorrect": true,
            "wrongExplanation": ""
          },
          {
            "text": "Błędna odpowiedź 1",
            "isCorrect": false,
            "wrongExplanation": "Wyjaśnienie dlaczego ta odpowiedź jest błędna (krótko)."
          },
          {
            "text": "Błędna odpowiedź 2",
            "isCorrect": false,
            "wrongExplanation": "Wyjaśnienie błędu."
          },
          {
            "text": "Błędna odpowiedź 3",
            "isCorrect": false,
            "wrongExplanation": "Wyjaśnienie błędu."
          }
        ],
        "correctExplanation": "Szczegółowe wyjaśnienie dlaczego poprawna odpowiedź jest poprawna i dodatkowy kontekst edukacyjny."
      }
      // ... wygeneruj 15 pytań podstawowych
    ],
    "Zaawansowany": [
      // ... wygeneruj 15 pytań zaawansowanych (trudne, podchwytliwe, architektoniczne) o identycznej strukturze
    ]
  }
}

Wymagania:
1. Pytania muszą być wysokiej jakości, praktyczne, unikaj pytań o suchą teorię definicyjną.
2. Zawsze dokładnie 4 opcje odpowiedzi, z czego dokładnie 1 poprawna (isCorrect: true).
3. Wyjaśnienia błędów (wrongExplanation) są obowiązkowe dla błędnych odpowiedzi.
4. id musi być unikalnym stringiem (najlepiej UUID).
5. Wygeneruj 15 pytań dla poziomu Podstawowy i 15 dla Zaawansowany.
6. JSON musi być poprawny i gotowy do sparsowania.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(promptText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-[100dvh]">
      <header className="glass m-[var(--gap-main)] mb-0 px-6 py-5" data-variant="panel">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <a href="/admin" className="btn-glass w-9 h-9 p-0 shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </a>
          <h1 className="text-xl font-black">
            <span className="gradient-text">Generator Promptów</span>
          </h1>
        </div>

        <div className="max-w-2xl mx-auto flex gap-2 mt-4">
          <a href="/admin" className="btn-glass px-4 py-1.5 h-auto text-sm font-medium">
            Upload JSON
          </a>
          <a href="/admin/generator" className="btn-glass px-4 py-1.5 h-auto text-sm font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">
            Generator Promptów
          </a>
        </div>
      </header>

      <main className="px-4 sm:px-8 max-w-2xl mx-auto mt-6">
        <div className="glass p-6" data-variant="panel">
          <label className="block mb-6">
            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 block">Temat kategorii (np. Docker, AWS, TypeScript)</span>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Wpisz temat..."
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </label>

          <div className="relative">
            <div className="absolute top-3 right-3 flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className="btn-glass px-4 py-2 h-auto text-xs font-bold"
                data-variant={copied ? "cta" : ""}
              >
                {copied ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                {copied ? 'Skopiowano!' : 'Kopiuj Prompt'}
              </motion.button>
            </div>
            
            <pre className="w-full bg-zinc-900 rounded-xl p-5 pt-14 text-sm text-zinc-300 font-mono whitespace-pre-wrap overflow-x-auto border border-zinc-800 custom-scrollbar h-[400px] overflow-y-auto">
              {promptText}
            </pre>
          </div>

          <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-sm">
            <Sparkles className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Skopiuj powyższy prompt i wklej go do <strong>ChatGPT (GPT-4)</strong> lub <strong>Claude 3 Opus</strong>. Wygenerowany przez AI plik JSON zapisz na dysku i wgraj w zakładce Upload w panelu Admina.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
