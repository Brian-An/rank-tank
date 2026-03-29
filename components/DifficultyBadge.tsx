import { cn } from '@/lib/utils'
import type { Difficulty } from '@/lib/types'

const DIFF_STYLES: Record<Difficulty, { label: string; classes: string }> = {
  easy: { label: 'Easy', classes: 'bg-green-50 text-green-700 border-green-200' },
  medium: { label: 'Medium', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  hard: { label: 'Hard', classes: 'bg-red-50 text-red-700 border-red-200' },
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const { label, classes } = DIFF_STYLES[difficulty]
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', classes)}>
      {label}
    </span>
  )
}
