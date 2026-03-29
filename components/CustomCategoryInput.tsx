'use client'
import { useState } from 'react'
import type { Category, RankItem } from '@/lib/types'

const SURPRISE_PROMPTS = [
  'Create a surprising ranking challenge about animals and nature',
  'Create an interesting ranking challenge about world history',
  'Create a fun ranking challenge about food and cuisine from around the world',
  'Create a ranking challenge about space and astronomy',
  'Create a surprising ranking challenge about human anatomy or biology',
  'Create a ranking challenge about ancient civilizations',
  'Create a fun ranking challenge about iconic video games',
  'Create a ranking challenge about extreme weather or natural disasters',
  'Create a ranking challenge about the world\'s most famous landmarks',
  'Create a surprising ranking challenge about economics or money',
  'Create a ranking challenge about the ocean and sea creatures',
  'Create a ranking challenge about famous inventors and their discoveries',
]

async function generate(prompt: string): Promise<{ id: string } | { error: string }> {
  const res = await fetch('/api/generate-category', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })
  const data = (await res.json()) as { category?: Category; shuffledItems?: RankItem[]; error?: string }
  if (!res.ok || !data.category) {
    return { error: data.error ?? "Couldn't generate that challenge. Try again." }
  }
  const id = crypto.randomUUID()
  sessionStorage.setItem('custom:' + id, JSON.stringify({ category: data.category, shuffledItems: data.shuffledItems }))
  return { id }
}

export function CustomCategoryInput() {
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [surpriseLoading, setSurpriseLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim() || generating) return
    setGenerating(true)
    setError(null)
    try {
      const result = await generate(prompt.trim())
      if ('error' in result) { setError(result.error); return }
      window.location.href = '/game?custom=' + result.id
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSurprise() {
    if (surpriseLoading || generating) return
    setSurpriseLoading(true)
    setError(null)
    const randomPrompt = SURPRISE_PROMPTS[Math.floor(Math.random() * SURPRISE_PROMPTS.length)]
    try {
      const result = await generate(randomPrompt)
      if ('error' in result) { setError(result.error); return }
      window.location.href = '/game?custom=' + result.id
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSurpriseLoading(false)
    }
  }

  const busy = generating || surpriseLoading

  return (
    <div className="border-t pt-6 space-y-3" style={{ borderColor: 'var(--border)' }}>
      <p className="text-sm text-neutral-500">Or create your own challenge</p>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. rank planets by diameter"
          maxLength={300}
          disabled={busy}
          className="flex-1 px-4 py-2.5 rounded-xl border text-sm bg-white outline-none focus:ring-1 focus:ring-neutral-900 disabled:opacity-50"
          style={{ borderColor: 'var(--border)' }}
        />
        <button
          type="submit"
          disabled={busy || !prompt.trim()}
          className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold disabled:opacity-40 transition-opacity"
        >
          {generating ? 'Generating…' : 'Go'}
        </button>
      </form>

      <button
        onClick={handleSurprise}
        disabled={busy}
        className="w-full py-2.5 rounded-xl border text-sm text-neutral-500 hover:text-neutral-900 hover:border-neutral-400 disabled:opacity-40 transition-all"
        style={{ borderColor: 'var(--border)' }}
      >
        {surpriseLoading ? 'Generating…' : 'Surprise me'}
      </button>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
