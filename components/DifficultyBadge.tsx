import { cn } from '@/lib/utils'
import type { Difficulty } from '@/lib/types'

const DIFF_STYLES: Record<Difficulty, { label: string; classes: string }> = {
  easy: { label: 'Easy', classes: 'bg-green-500/10 text-green-400 border-green-500/20' },
  medium: { label: 'Medium', classes: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  hard: { label: 'Hard', classes: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const { label, classes } = DIFF_STYLES[difficulty]
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', classes)}>
      {label}
    </span>
  )
}
