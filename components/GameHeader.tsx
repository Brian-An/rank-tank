import type { Category } from '@/lib/types'
import { CategoryBadge } from './CategoryBadge'
import { DifficultyBadge } from './DifficultyBadge'

export function GameHeader({ category, isDaily }: { category: Category; isDaily: boolean }) {
  return (
    <div className="text-center space-y-3">
      {isDaily && (
        <div className="inline-flex items-center gap-1.5 text-yellow-400 text-sm font-semibold tracking-wide uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          Daily Challenge
        </div>
      )}
      <h1 className="text-2xl sm:text-3xl font-bold text-white leading-snug">{category.title}</h1>
      <div className="flex items-center justify-center gap-2">
        <CategoryBadge theme={category.theme} />
        <DifficultyBadge difficulty={category.difficulty} />
      </div>
      <p className="text-white/40 text-sm">Drag items to rank them — {category.unit}</p>
    </div>
  )
}
