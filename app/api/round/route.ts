import type { NextRequest } from 'next/server'
import type { Theme, Difficulty } from '@/lib/types'
import { shuffle } from '@/lib/seed'
import { getLocalRound } from '@/lib/localRounds'
import { getCachedRound, setCachedRound } from '@/lib/roundCache'
import { generateRound } from '@/lib/openai'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('mode') ?? 'daily'
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]
  const theme = searchParams.get('theme') as Theme | null
  const difficulty = (searchParams.get('difficulty') as Difficulty | null) ?? 'medium'
  const seed = searchParams.get('seed') ?? date

  try {
    let category

    if (mode === 'daily') {
      category = getLocalRound(date)
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
