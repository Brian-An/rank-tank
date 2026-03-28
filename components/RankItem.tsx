'use client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import type { RankItem as RankItemType } from '@/lib/types'

interface Props {
  item: RankItemType
  index: number
  locked: boolean
  revealedCorrectIndex?: number  // correct 0-based position
}

export function RankItem({ item, index, locked, revealedCorrectIndex }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: locked,
  })

  const style = { transform: CSS.Transform.toString(transform), transition }

  const isRevealed = revealedCorrectIndex !== undefined
  const isCorrect = isRevealed && revealedCorrectIndex === index

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 select-none',
        isDragging ? 'opacity-50 z-50 shadow-[0_0_30px_rgba(245,197,66,0.25)]' : '',
        !isRevealed && !isDragging && 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20',
        isRevealed && isCorrect && 'bg-green-500/10 border-green-500/40',
        isRevealed && !isCorrect && 'bg-red-500/10 border-red-500/40',
      )}
      {...attributes}
    >
      {/* Position number */}
      <div className="text-white/40 text-sm font-mono w-5 text-center shrink-0">{index + 1}</div>

      {/* Drag handle */}
      {!locked && (
        <div
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-white/20 hover:text-white/60 transition-colors shrink-0"
          aria-label="Drag to reorder"
        >
          <svg width="12" height="18" viewBox="0 0 12 18" fill="currentColor">
            <circle cx="3" cy="3" r="1.5" /><circle cx="9" cy="3" r="1.5" />
            <circle cx="3" cy="9" r="1.5" /><circle cx="9" cy="9" r="1.5" />
            <circle cx="3" cy="15" r="1.5" /><circle cx="9" cy="15" r="1.5" />
          </svg>
        </div>
      )}

      {/* Label */}
      <div className="flex-1 text-white font-medium text-sm sm:text-base">{item.label}</div>

      {/* Reveal: show correct rank + value */}
      {isRevealed && (
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-white/50 text-sm font-mono">{item.display}</span>
          {isCorrect ? (
            <span className="text-green-400 text-sm font-bold">✓</span>
          ) : (
            <span className="text-red-400 text-xs font-mono">#{revealedCorrectIndex! + 1}</span>
          )}
        </div>
      )}
    </div>
  )
}
