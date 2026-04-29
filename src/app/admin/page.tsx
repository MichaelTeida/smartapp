'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth, RedirectToSignIn } from '@clerk/nextjs'
import { ArrowLeft } from 'lucide-react'

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
        setPreview({ category: data.category, basic: data.levels.Podstawowy.length, advanced: data.levels.Zaawansowany.length })
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
      const res = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Upload failed') }
      const result = await res.json()
      setStatus({ type: 'success', message: `"${result.category}" uploaded (${result.questions} questions)` })
      setPreview(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (e) {
      setStatus({ type: 'error', message: e instanceof Error ? e.message : 'Upload failed' })
    }
  }

  return (
    <div className="min-h-[100dvh]">
      <header className="glass m-[var(--gap-main)] mb-0 px-6 py-5" data-variant="panel">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <a href="/" className="btn-glass w-9 h-9 p-0 shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </a>
          <h1 className="text-xl font-black">
            <span className="gradient-text">Admin</span>
            <span className="text-zinc-400 dark:text-zinc-500 ml-2 text-sm font-normal">Upload categories</span>
          </h1>
        </div>
        
        <div className="max-w-2xl mx-auto flex gap-2 mt-4">
          <a href="/admin" className="btn-glass px-4 py-1.5 h-auto text-sm font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">
            Upload JSON
          </a>
          <a href="/admin/generator" className="btn-glass px-4 py-1.5 h-auto text-sm font-medium">
            Generator Promptów
          </a>
        </div>
      </header>

      <main className="px-4 sm:px-8 max-w-2xl mx-auto mt-6">
        <div className="glass p-6" data-variant="panel">
          <label className="block mb-4">
            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2 block">JSON Category File</span>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              onChange={handleFile}
              className="block w-full text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-zinc-200 dark:file:bg-zinc-700 file:text-zinc-700 dark:file:text-zinc-200 hover:file:bg-zinc-300 dark:hover:file:bg-zinc-600 file:cursor-pointer cursor-pointer"
            />
          </label>

          {preview && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 glass p-4 rounded-xl">
              <div className="text-sm font-bold text-zinc-700 dark:text-zinc-200 mb-2">Preview</div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-zinc-400 dark:text-zinc-500">Category:</span>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">{preview.category}</div>
                </div>
                <div>
                  <span className="text-zinc-400 dark:text-zinc-500">Basic:</span>
                  <div className="font-bold text-zinc-800 dark:text-white">{preview.basic} questions</div>
                </div>
                <div>
                  <span className="text-zinc-400 dark:text-zinc-500">Advanced:</span>
                  <div className="font-bold text-zinc-800 dark:text-white">{preview.advanced} questions</div>
                </div>
              </div>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={upload}
            disabled={!preview || status.type === 'loading'}
            className="w-full py-3 btn-glass font-bold text-sm h-auto disabled:opacity-40 disabled:cursor-not-allowed"
            data-variant="cta"
          >
            {status.type === 'loading' ? 'Uploading...' : 'Upload to Database'}
          </motion.button>

          {status.type !== 'idle' && status.type !== 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-3 p-3 rounded-lg text-sm glass ${
                status.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {status.message}
            </motion.div>
          )}
        </div>

        <div className="mt-6 glass p-4" data-variant="panel">
          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono leading-relaxed">
            <span className="text-zinc-700 dark:text-zinc-300 font-bold">Expected format:</span><br />
            {`{ "category": "Name", "levels": { "Podstawowy": [...], "Zaawansowany": [...] } }`}
          </div>
        </div>
      </main>
    </div>
  )
}
