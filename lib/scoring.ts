import type { ScoreResult } from './types'

export function calculateScore(playerOrder: string[], correctOrder: string[]): ScoreResult {
  const n = correctOrder.length
  const totalPairs = (n * (n - 1)) / 2

  const correctPos = new Map(correctOrder.map((id, i) => [id, i]))

  let concordantPairs = 0
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const ci = correctPos.get(playerOrder[i])!
      const cj = correctPos.get(playerOrder[j])!
      if (ci < cj) concordantPairs++
    }
  }

  const score = Math.round((concordantPairs / totalPairs) * 100)
  const perfect = concordantPairs === totalPairs

  return { score, correctPairs: concordantPairs, totalPairs, perfect }
}
