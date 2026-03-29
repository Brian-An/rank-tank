'use client'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import type { RankItem as RankItemType } from '@/lib/types'

interface Props {
  item: RankItemType
  index: number
  locked: boolean
  revealedCorrectIndex?: number
  isOverlay?: boolean
}

export function RankItem({ item, index, locked, revealedCorrectIndex, isOverlay }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: locked,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    borderColor: revealedCorrectIndex !== undefined ? undefined : 'var(--border)',
  }

  const isRevealed = revealedCorrectIndex !== undefined
  const isCorrect = isRevealed && revealedCorrectIndex === index

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 p-4 rounded-xl border transition-colors duration-150 select-none',
        isDragging && !isOverlay && 'opacity-30 bg-white',
        isOverlay && 'shadow-lg bg-white ring-1 ring-neutral-900/10',
        !isRevealed && !isDragging && !isOverlay && 'bg-white hover:bg-neutral-50',
        isRevealed && isCorrect && 'bg-green-50 border-green-200',
        isRevealed && !isCorrect && 'bg-red-50 border-red-200',
      )}
      {...attributes}
    >
      <div className="text-neutral-300 text-sm font-mono w-5 text-center shrink-0 tabular-nums">{index + 1}</div>

      {!locked && (
        <div
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-neutral-300 hover:text-neutral-500 transition-colors shrink-0 touch-none"
          aria-label="Drag to reorder"
        >
          <svg width="12" height="18" viewBox="0 0 12 18" fill="currentColor">
            <circle cx="3" cy="3" r="1.5" /><circle cx="9" cy="3" r="1.5" />
            <circle cx="3" cy="9" r="1.5" /><circle cx="9" cy="9" r="1.5" />
            <circle cx="3" cy="15" r="1.5" /><circle cx="9" cy="15" r="1.5" />
          </svg>
        </div>
      )}

      <div className="flex-1 text-neutral-900 font-medium text-sm sm:text-base">{item.label}</div>

      {isRevealed && (
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-neutral-400 text-sm font-mono tabular-nums">{item.display}</span>
          {isCorrect ? (
            <span className="text-green-600 text-sm font-bold">✓</span>
          ) : (
            <span className="text-red-500 text-xs font-mono tabular-nums">#{revealedCorrectIndex! + 1}</span>
          )}
        </div>
      )}
    </div>
  )
}
