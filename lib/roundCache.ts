import type { Category } from './types'

// Module-level cache — persists for process lifetime (per Vercel edge instance)
const cache = new Map<string, Category>()

export function getCachedRound(theme: string, difficulty: string): Category | undefined {
  return cache.get(`${theme}:${difficulty}`)
}

export function setCachedRound(theme: string, difficulty: string, category: Category): void {
  cache.set(`${theme}:${difficulty}`, category)
}
