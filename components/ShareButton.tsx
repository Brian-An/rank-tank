'use client'
import { useState } from 'react'
import type { RankItem } from '@/lib/types'

interface Props {
  score: number
  title: string
  playerOrder: RankItem[]
  correctOrder: string[]
}

export function ShareButton({ score, title, playerOrder, correctOrder }: Props) {
  const [copied, setCopied] = useState(false)

  function buildShareText() {
    const rows = playerOrder
      .map((item, i) => {
        const isCorrect = correctOrder[i] === item.id
        return `${isCorrect ? '✅' : '❌'} ${item.label}`
      })
      .join('\n')

    return `🎮 Rank Tank\n\n${title}\nScore: ${score}/100\n\n${rows}\n\nranktank.vercel.app`
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(buildShareText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all text-sm"
    >
      {copied ? '✓ Copied!' : 'Share result'}
    </button>
  )
}
