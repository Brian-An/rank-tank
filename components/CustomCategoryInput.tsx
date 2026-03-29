'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Category, RankItem } from '@/lib/types'

export function CustomCategoryInput() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim() || generating) return

    setGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/generate-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })
      const data = (await res.json()) as { category?: Category; shuffledItems?: RankItem[]; error?: string }

      if (!res.ok || !data.category) {
        setError(data.error ?? "Couldn't generate that challenge. Try a different prompt.")
        return
      }

      const id = crypto.randomUUID()
      sessionStorage.setItem('custom:' + id, JSON.stringify({ category: data.category, shuffledItems: data.shuffledItems }))
      router.push('/game?custom=' + id)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="border-t pt-6" style={{ borderColor: 'var(--border)' }}>
      <p className="text-sm text-neutral-500 mb-3">Or describe your own challenge</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. rank planets by diameter"
          maxLength={300}
          disabled={generating}
          className="flex-1 px-4 py-2.5 rounded-xl border text-sm bg-white outline-none focus:ring-1 focus:ring-neutral-900 disabled:opacity-50"
          style={{ borderColor: 'var(--border)' }}
        />
        <button
          type="submit"
          disabled={generating || !prompt.trim()}
          className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold disabled:opacity-40 transition-opacity"
        >
          {generating ? 'Generating…' : 'Go'}
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  )
}
