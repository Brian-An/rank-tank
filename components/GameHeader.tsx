import type { Category } from '@/lib/types'
import { CategoryBadge } from './CategoryBadge'
import { DifficultyBadge } from './DifficultyBadge'

export function GameHeader({ category, isDaily }: { category: Category; isDaily: boolean }) {
  return (
    <div className="text-center space-y-3">
      {isDaily && (
        <div className="inline-flex items-center gap-1.5 text-neutral-600 text-sm font-semibold tracking-wide uppercase">
          <span className="size-1.5 rounded-full bg-yellow-400 motion-safe:animate-pulse" />
          Daily Challenge
        </div>
      )}
      <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-snug text-balance">{category.title}</h1>
      <div className="flex items-center justify-center gap-2">
        <CategoryBadge theme={category.theme} />
        <DifficultyBadge difficulty={category.difficulty} />
      </div>
      <p className="text-neutral-400 text-sm text-pretty">Drag items to rank them — {category.unit}</p>
    </div>
  )
}
