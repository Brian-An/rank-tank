'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Theme, Difficulty } from '@/lib/types'

const THEMES: { id: Theme; label: string; emoji: string }[] = [
  { id: 'tech', label: 'Tech', emoji: '💻' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'geography', label: 'Geography', emoji: '🌍' },
  { id: 'sports', label: 'Sports', emoji: '🏆' },
  { id: 'business', label: 'Business', emoji: '💼' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'movies', label: 'Movies', emoji: '🎬' },
]

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

export function ThemeSelector() {
  const router = useRouter()
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium')

  function handlePlay() {
    const seed = crypto.randomUUID()
    const params = new URLSearchParams({ mode: 'random', seed, difficulty: selectedDifficulty })
    if (selectedTheme) params.set('theme', selectedTheme)
    router.push(`/game?${params.toString()}`)
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
      <h2 className="text-white font-bold text-lg">Random Round</h2>

      {/* Theme grid */}
      <div>
        <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Theme (optional)</p>
        <div className="grid grid-cols-4 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTheme(selectedTheme === t.id ? null : t.id)}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium transition-all',
                selectedTheme === t.id
                  ? 'border-yellow-400/60 bg-yellow-400/10 text-yellow-400'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white',
              )}
            >
              <span className="text-lg">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Difficulty</p>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDifficulty(d)}
              className={cn(
                'flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-all',
                selectedDifficulty === d
                  ? 'border-yellow-400/60 bg-yellow-400/10 text-yellow-400'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white',
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handlePlay}
        className="w-full py-3 rounded-xl bg-white/10 border border-white/20 text-white font-bold hover:bg-white/15 transition-all"
      >
        Play Random Round
      </button>
    </div>
  )
}
