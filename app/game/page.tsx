import { Suspense } from 'react'
import { connection } from 'next/server'
import { redirect } from 'next/navigation'
import { GameClient } from './GameClient'
import { CustomGameWrapper } from './CustomGameWrapper'
import { getLocalRound } from '@/lib/localRounds'
import { getCachedRound, setCachedRound } from '@/lib/roundCache'
import { generateRound } from '@/lib/openai'
import { shuffle } from '@/lib/seed'
import type { Theme, Difficulty } from '@/lib/types'

async function GameLoader({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; theme?: string; difficulty?: string; seed?: string; custom?: string }>
}) {
  await connection()
  const params = await searchParams

  if (params.custom) {
    return <CustomGameWrapper customId={params.custom} />
  }

  const mode = params.mode ?? 'daily'
  const theme = params.theme as Theme | undefined
  const difficulty = (params.difficulty as Difficulty) ?? 'medium'
  const today = new Date().toISOString().split('T')[0]
  const seed = params.seed ?? today
  const isDaily = mode === 'daily'

  let category

  if (isDaily) {
    category = getLocalRound(today)
  } else {
    // Skip cache when an explicit seed is provided (e.g. Play Again) so the
    // seed deterministically picks a fresh local round instead of the cached one.
    const hasSeed = !!params.seed
    const cacheTheme = theme ?? 'mixed'
    if (!hasSeed) {
      category = getCachedRound(cacheTheme, difficulty)
    }

    if (!category) {
      if (theme) {
        category = (await generateRound(theme, difficulty)) ?? getLocalRound(seed, theme)
      } else {
        category = getLocalRound(seed)
      }
      if (category && !hasSeed) setCachedRound(cacheTheme, difficulty, category)
    }
  }

  if (!category) redirect('/')

  const shuffledItems = shuffle(category.items, seed)

  return <GameClient category={category} shuffledItems={shuffledItems} isDaily={isDaily} />
}

export default function GamePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; theme?: string; difficulty?: string; seed?: string; custom?: string }>
}) {
  return (
    <Suspense fallback={null}>
      <GameLoader searchParams={searchParams} />
    </Suspense>
  )
}
