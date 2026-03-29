'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RankList } from '@/components/RankList'
import { GameHeader } from '@/components/GameHeader'
import { ResultsPanel } from '@/components/ResultsPanel'
import { calculateScore } from '@/lib/scoring'
import type { Category, RankItem } from '@/lib/types'

interface Props {
  category: Category
  shuffledItems: RankItem[]
  isDaily: boolean
}

export function GameClient({ category, shuffledItems, isDaily }: Props) {
  const router = useRouter()
  const [items, setItems] = useState<RankItem[]>(shuffledItems)
  const [submitted, setSubmitted] = useState(false)

  const correctOrder = category.items.map((i) => i.id)

  function handleSubmit() {
    setSubmitted(true)
  }

  function handlePlayAgain() {
    router.push('/')
  }

  const scoreResult = submitted ? calculateScore(items.map((i) => i.id), correctOrder) : null

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--background)' }}>
      <div className="max-w-lg mx-auto space-y-8">
        {/* Back link */}
        <a href="/" className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-neutral-700 text-sm transition-colors">
          ← Back
        </a>

        <GameHeader category={category} isDaily={isDaily} />

        <RankList
          items={items}
          correctOrder={correctOrder}
          locked={submitted}
          revealed={submitted}
          onReorder={setItems}
        />

        {!submitted ? (
          <button
            onClick={handleSubmit}
            className="w-full py-4 rounded-xl bg-neutral-900 text-white font-bold text-lg hover:bg-neutral-800 active:scale-95 transition-all"
          >
            Submit Ranking
          </button>
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
