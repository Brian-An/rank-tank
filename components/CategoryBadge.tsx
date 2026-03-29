import { cn } from '@/lib/utils'
import type { Theme } from '@/lib/types'
import { Cpu, Music2, Globe, Trophy, Briefcase, FlaskConical, Clapperboard } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const THEME_STYLES: Record<Theme, { label: string; icon: LucideIcon; classes: string }> = {
  tech: { label: 'Tech', icon: Cpu, classes: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  music: { label: 'Music', icon: Music2, classes: 'bg-purple-50 text-purple-700 border-purple-200' },
  geography: { label: 'Geography', icon: Globe, classes: 'bg-green-50 text-green-700 border-green-200' },
  sports: { label: 'Sports', icon: Trophy, classes: 'bg-orange-50 text-orange-700 border-orange-200' },
  business: { label: 'Business', icon: Briefcase, classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  science: { label: 'Science', icon: FlaskConical, classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  movies: { label: 'Movies', icon: Clapperboard, classes: 'bg-red-50 text-red-700 border-red-200' },
}

export function CategoryBadge({ theme }: { theme: Theme }) {
  const { label, icon: Icon, classes } = THEME_STYLES[theme]
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border', classes)}>
      <Icon size={10} />
      {label}
    </span>
  )
}
