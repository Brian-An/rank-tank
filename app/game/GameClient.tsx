'use client'
import { useEffect, useState } from 'react'
import { RankList } from '@/components/RankList'
import { GameHeader } from '@/components/GameHeader'
import { ResultsPanel } from '@/components/ResultsPanel'
import { calculateScore } from '@/lib/scoring'
import type { Category, RankItem } from '@/lib/types'

interface Props {
  category: Category
  shuffledItems: RankItem[]
  isDaily: boolean
  isCustom?: boolean
}

export function GameClient({ category, shuffledItems, isDaily, isCustom }: Props) {
  const [items, setItems] = useState<RankItem[]>(shuffledItems)
  const [submitted, setSubmitted] = useState(false)
  const [hint, setHint] = useState<string | null>(null)
  const [hintUsed, setHintUsed] = useState(false)
  const [hintLoading, setHintLoading] = useState(false)
  const [explanations, setExplanations] = useState<Record<string, string>>({})

  const correctOrder = category.items.map((i) => i.id)

  useEffect(() => {
    if (!submitted) return
    fetch('/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category }),
    })
      .then((r) => r.json())
      .then((data: { explanations: Record<string, string> }) => setExplanations(data.explanations ?? {}))
      .catch(() => null)
  }, [submitted, category])

  function handleSubmit() {
    setSubmitted(true)
  }

  function handlePlayAgain() {
    if (isCustom) {
      window.location.href = '/'
      return
    }
    const seed = Date.now().toString()
    const url = isDaily
      ? `/game?mode=random&seed=${seed}`
      : `/game?mode=random&theme=${category.theme}&difficulty=${category.difficulty}&seed=${seed}`
    // Use hard navigation to bypass Next.js client-side router cache,
    // which would otherwise serve the same rendered page for 30 seconds.
    window.location.href = url
  }

  async function handleHint() {
    setHintLoading(true)
    setHintUsed(true)
    try {
      const res = await fetch('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, playerOrder: items.map((i) => i.label) }),
      })
      const data = (await res.json()) as { hint: string }
      setHint(data.hint)
    } catch {
      setHint('Try looking at the middle items.')
    } finally {
      setHintLoading(false)
    }
  }

  const scoreResult = submitted ? calculateScore(items.map((i) => i.id), correctOrder) : null

  return (
    <div className="min-h-dvh py-8 px-4" style={{ background: 'var(--background)' }}>
      <div className="max-w-lg mx-auto space-y-8">
        {/* Back link */}
        <a href="/" className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-neutral-700 text-sm transition-colors">
          ← Back
        </a>

        <GameHeader category={category} isDaily={isDaily} isCustom={isCustom} />

        <RankList
          items={items}
          correctOrder={correctOrder}
          locked={submitted}
          revealed={submitted}
          onReorder={setItems}
          explanations={explanations}
        />

        {!submitted ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2">
              {hint && (
                <p className="text-sm text-neutral-500 text-center text-pretty px-4">{hint}</p>
              )}
              {!hintUsed ? (
                <button
                  onClick={handleHint}
                  className="text-sm text-neutral-400 hover:text-neutral-700 underline underline-offset-2 transition-colors"
                >
                  Need a hint?
                </button>
              ) : hintLoading ? (
                <p className="text-sm text-neutral-300 motion-safe:animate-pulse">Thinking…</p>
              ) : null}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-4 rounded-xl bg-neutral-900 text-white font-bold text-lg hover:bg-neutral-800 active:scale-95 transition-all"
            >
              Submit Ranking
            </button>
          </div>
        ) : (
          scoreResult && (
            <ResultsPanel
              score={scoreResult.score}
              perfect={scoreResult.perfect}
              playerOrder={items}
              correctOrder={correctOrder}
              category={category}
              onPlayAgain={handlePlayAgain}
            />
          )
        )}
      </div>
    </div>
  )
}
