import { Suspense } from 'react'
import { connection } from 'next/server'
import { redirect } from 'next/navigation'
import { GameClient } from './GameClient'
import { getLocalRound } from '@/lib/localRounds'
import { getCachedRound, setCachedRound } from '@/lib/roundCache'
import { generateRound } from '@/lib/openai'
import { shuffle } from '@/lib/seed'
import type { Theme, Difficulty } from '@/lib/types'

async function GameLoader({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; theme?: string; difficulty?: string; seed?: string }>
}) {
  await connection()
  const params = await searchParams
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

  if (!category) redirect('/')

  const shuffledItems = shuffle(category.items, seed)

  return <GameClient category={category} shuffledItems={shuffledItems} isDaily={isDaily} />
}

export default function GamePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; theme?: string; difficulty?: string; seed?: string }>
}) {
  return (
    <Suspense fallback={null}>
      <GameLoader searchParams={searchParams} />
    </Suspense>
  )
}
