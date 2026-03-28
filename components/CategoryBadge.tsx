import { cn } from '@/lib/utils'
import type { Theme } from '@/lib/types'

const THEME_STYLES: Record<Theme, { label: string; classes: string }> = {
  tech: { label: '💻 Tech', classes: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  music: { label: '🎵 Music', classes: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  geography: { label: '🌍 Geography', classes: 'bg-green-500/10 text-green-400 border-green-500/20' },
  sports: { label: '🏆 Sports', classes: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  business: { label: '💼 Business', classes: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  science: { label: '🔬 Science', classes: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  movies: { label: '🎬 Movies', classes: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

export function CategoryBadge({ theme }: { theme: Theme }) {
  const { label, classes } = THEME_STYLES[theme]
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', classes)}>
      {label}
    </span>
  )
}
