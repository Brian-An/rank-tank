'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Theme, Difficulty } from '@/lib/types'

const THEMES: { id: Theme; label: string }[] = [
  { id: 'tech', label: 'Tech' },
  { id: 'music', label: 'Music' },
  { id: 'geography', label: 'Geography' },
  { id: 'sports', label: 'Sports' },
  { id: 'business', label: 'Business' },
  { id: 'science', label: 'Science' },
  { id: 'movies', label: 'Movies' },
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
    <div className="bg-white border rounded-2xl p-6 space-y-5" style={{ borderColor: 'var(--border)' }}>
      <h2 className="text-neutral-900 font-bold text-lg">Random Round</h2>

      {/* Theme grid */}
      <div>
        <p className="text-neutral-400 text-xs uppercase tracking-widest mb-2">Theme (optional)</p>
        <div className="grid grid-cols-4 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTheme(selectedTheme === t.id ? null : t.id)}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium transition-all',
                selectedTheme === t.id
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:border-neutral-400 hover:text-neutral-900',
              )}
              style={selectedTheme !== t.id ? { borderColor: 'var(--border)', background: 'var(--background)' } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <p className="text-neutral-400 text-xs uppercase tracking-widest mb-2">Difficulty</p>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDifficulty(d)}
              className={cn(
                'flex-1 py-3 rounded-lg border text-sm font-medium capitalize transition-all',
                selectedDifficulty === d
                  ? 'border-neutral-900 bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:border-neutral-400 hover:text-neutral-900',
              )}
              style={selectedDifficulty !== d ? { borderColor: 'var(--border)', background: 'var(--background)' } : {}}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handlePlay}
        className="w-full py-3 rounded-xl bg-neutral-900 text-white font-bold hover:bg-neutral-800 transition-all"
      >
        Play Random Round
      </button>
    </div>
  )
}
