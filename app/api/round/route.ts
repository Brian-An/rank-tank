import type { NextRequest } from 'next/server'
import type { Theme, Difficulty } from '@/lib/types'
import { shuffle, pickIndex } from '@/lib/seed'
import { getLocalRound } from '@/lib/localRounds'
import { getCachedRound, setCachedRound } from '@/lib/roundCache'
import { generateRound } from '@/lib/openai'
import { fetchLiveCategories } from '@/lib/liveCategories'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('mode') ?? 'daily'
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]
  const VALID_THEMES = ['tech', 'music', 'geography', 'sports', 'business', 'science', 'movies'] as const
  const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'] as const
  const rawTheme = searchParams.get('theme')
  const theme: Theme | null = VALID_THEMES.includes(rawTheme as Theme) ? (rawTheme as Theme) : null
  const rawDiff = searchParams.get('difficulty')
  const difficulty: Difficulty = VALID_DIFFICULTIES.includes(rawDiff as Difficulty) ? (rawDiff as Difficulty) : 'medium'
  const seed = searchParams.get('seed') ?? date

  try {
    let category

    if (mode === 'daily') {
      const liveCategories = await fetchLiveCategories()
      if (liveCategories.length > 0) {
        const idx = pickIndex(liveCategories.length, date)
        category = liveCategories[idx]
      } else {
        category = getLocalRound(date)
      }
    } else {
      const cacheTheme = theme ?? 'mixed'
      category = getCachedRound(cacheTheme, difficulty)

      if (!category) {
        if (theme) {
          category = (await generateRound(theme, difficulty)) ?? getLocalRound(seed, theme)
        } else {
          category = getLocalRound(seed)
        }
        if (category) setCachedRound(cacheTheme, difficulty, category)
      }
    }

    if (!category) {
      return Response.json({ error: 'No round available' }, { status: 500 })
    }

    const shuffledItems = shuffle(category.items, seed)
    return Response.json({ category, shuffledItems, seed })
  } catch {
    return Response.json({ error: 'Failed to load round' }, { status: 500 })
  }
}
