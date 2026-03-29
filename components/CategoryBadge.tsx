import { cn } from '@/lib/utils'
import type { Theme } from '@/lib/types'

const THEME_STYLES: Record<Theme, { label: string; classes: string }> = {
  tech: { label: '💻 Tech', classes: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  music: { label: '🎵 Music', classes: 'bg-purple-50 text-purple-700 border-purple-200' },
  geography: { label: '🌍 Geography', classes: 'bg-green-50 text-green-700 border-green-200' },
  sports: { label: '🏆 Sports', classes: 'bg-orange-50 text-orange-700 border-orange-200' },
  business: { label: '💼 Business', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  science: { label: '🔬 Science', classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  movies: { label: '🎬 Movies', classes: 'bg-red-50 text-red-700 border-red-200' },
}

export function CategoryBadge({ theme }: { theme: Theme }) {
  const { label, classes } = THEME_STYLES[theme]
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', classes)}>
      {label}
    </span>
  )
}
