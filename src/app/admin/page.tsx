'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth, RedirectToSignIn } from '@clerk/nextjs'

export default function AdminPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' })
  const [preview, setPreview] = useState<{ category: string; basic: number; advanced: number } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!isLoaded) return null
  if (!isSignedIn) return <RedirectToSignIn />

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        if (!data.category || !data.levels?.Podstawowy || !data.levels?.Zaawansowany) {
          setStatus({ type: 'error', message: 'Invalid JSON: needs category, levels.Podstawowy, levels.Zaawansowany' })
          setPreview(null)
          return
        }
        setPreview({
          category: data.category,
          basic: data.levels.Podstawowy.length,
          advanced: data.levels.Zaawansowany.length,
        })
        setStatus({ type: 'idle', message: '' })
      } catch {
        setStatus({ type: 'error', message: 'Invalid JSON file' })
        setPreview(null)
      }
    }
    reader.readAsText(file)
  }

  async function upload() {
    const file = fileRef.current?.files?.[0]
    if (!file) return

    setStatus({ type: 'loading', message: 'Uploading...' })

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Upload failed')
      }

      const result = await res.json()
      setStatus({ type: 'success', message: `"${result.category}" uploaded (${result.questions} questions)` })
      setPreview(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (e) {
      setStatus({ type: 'error', message: e instanceof Error ? e.message : 'Upload failed' })
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0a0e1a] text-white">
      <header className="px-4 sm:px-8 pt-6 pb-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <a href="/" className="text-zinc-400 hover:text-white transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </a>
          <h1 className="text-xl font-black">
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Admin</span>
            <span className="text-zinc-500 ml-2 text-sm font-normal">Upload categories</span>
          </h1>
        </div>
      </header>

      <main className="px-4 sm:px-8 max-w-2xl mx-auto">
        <div className="mt-6 p-6 rounded-2xl bg-zinc-800/40 border border-zinc-700/40">
          <label className="block mb-4">
            <span className="text-sm font-bold text-zinc-300 mb-2 block">JSON Category File</span>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              onChange={handleFile}
              className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-zinc-700 file:text-zinc-200 hover:file:bg-zinc-600 file:cursor-pointer cursor-pointer"
            />
          </label>

          {preview && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-700/30"
            >
              <div className="text-sm font-bold text-zinc-200 mb-2">Preview</div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-zinc-500">Category:</span>
                  <div className="font-bold text-emerald-400">{preview.category}</div>
                </div>
                <div>
                  <span className="text-zinc-500">Basic:</span>
                  <div className="font-bold">{preview.basic} questions</div>
                </div>
                <div>
                  <span className="text-zinc-500">Advanced:</span>
                  <div className="font-bold">{preview.advanced} questions</div>
                </div>
              </div>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={upload}
            disabled={!preview || status.type === 'loading'}
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20"
          >
            {status.type === 'loading' ? 'Uploading...' : 'Upload to Database'}
          </motion.button>

          {status.type !== 'idle' && status.type !== 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-3 p-3 rounded-lg text-sm ${
                status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {status.message}
            </motion.div>
          )}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-zinc-800/20 border border-zinc-700/20">
          <div className="text-xs text-zinc-500 font-mono leading-relaxed">
            <span className="text-zinc-400 font-bold">Expected format:</span><br />
            {`{ "category": "Name", "levels": { "Podstawowy": [...], "Zaawansowany": [...] } }`}
          </div>
        </div>
      </main>
    </div>
  )
}
