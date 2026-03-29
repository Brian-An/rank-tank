'use client'
import { useEffect, useState } from 'react'
import { ScoreDisplay } from './ScoreDisplay'
import { CommentaryCard } from './CommentaryCard'
import { ShareModal } from './ShareModal'
import type { RankItem, CommentaryResult } from '@/lib/types'

interface Props {
  score: number
  perfect: boolean
  playerOrder: RankItem[]
  correctOrder: string[]  // ids in correct order
  category: { title: string }
  onPlayAgain: () => void
}

export function ResultsPanel({ score, perfect, playerOrder, correctOrder, category, onPlayAgain }: Props) {
  const [commentary, setCommentary] = useState<CommentaryResult | null>(null)

  useEffect(() => {
    fetch('/api/commentary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        score,
        title: category.title,
        playerOrder: playerOrder.map((i) => i.label),
        correctOrder: correctOrder.map((id) => playerOrder.find((i) => i.id === id)?.label ?? id),
      }),
    })
      .then((r) => r.json())
      .then((data: CommentaryResult) => setCommentary(data))
      .catch(() => null)
  }, [score, category.title, playerOrder, correctOrder])

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <ScoreDisplay score={score} perfect={perfect} />

      {commentary ? (
        <CommentaryCard text={commentary.text} isAI={commentary.isAI} />
      ) : (
        <div className="h-20 bg-white border rounded-2xl motion-safe:animate-pulse" style={{ borderColor: 'var(--border)' }} />
      )}

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onPlayAgain}
          className="px-6 py-3 rounded-xl bg-neutral-900 text-white font-bold hover:bg-neutral-800 transition-colors text-sm"
        >
          Play Again
        </button>
        <ShareModal
          score={score}
          title={category.title}
          playerOrder={playerOrder}
          correctOrder={correctOrder}
        />
      </div>
    </div>
  )
}
