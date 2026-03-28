// lib/liveCategories.ts
import type { Category, RankItem } from './types'

// ── Fixed items per category ─────────────────────────────────────────────────

const GITHUB_REPOS = [
  { label: 'freeCodeCamp',                owner: 'freeCodeCamp',  repo: 'freeCodeCamp' },
  { label: 'free-programming-books',      owner: 'EbookFoundation', repo: 'free-programming-books' },
  { label: 'awesome',                     owner: 'sindresorhus',  repo: 'awesome' },
  { label: 'coding-interview-university', owner: 'jwasham',       repo: 'coding-interview-university' },
  { label: 'developer-roadmap',           owner: 'kamranahmedse', repo: 'developer-roadmap' },
]

const NPM_PACKAGES = ['tslib', 'lodash', 'react', 'axios', 'express']

const WIKI_ARTICLES = [
  { label: 'United States',  article: 'United_States' },
  { label: 'India',          article: 'India' },
  { label: 'YouTube',        article: 'YouTube' },
  { label: 'United Kingdom', article: 'United_Kingdom' },
  { label: 'Barack Obama',   article: 'Barack_Obama' },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the previous full calendar month as YYYYMMDD strings. */
function prevMonthRange(): { start: string; end: string } {
  const now = new Date()
  const y = now.getUTCMonth() === 0 ? now.getUTCFullYear() - 1 : now.getUTCFullYear()
  const m = now.getUTCMonth() === 0 ? 12 : now.getUTCMonth()
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate()
  const mm = String(m).padStart(2, '0')
  const dd = String(lastDay).padStart(2, '0')
  return { start: `${y}${mm}01`, end: `${y}${mm}${dd}` }
}

function toRankItems(
  raw: { label: string; value: number; display: string }[]
): RankItem[] {
  return [...raw]
    .sort((a, b) => b.value - a.value)
    .map((item, i) => ({ id: String(i + 1), ...item }))
}

// ── Per-API fetchers ─────────────────────────────────────────────────────────

async function fetchGitHubStars(): Promise<Category> {
  const raw = await Promise.all(
    GITHUB_REPOS.map(async ({ label, owner, repo }) => {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { signal: AbortSignal.timeout(5000) })
      if (!res.ok) throw new Error(`GitHub ${res.status}`)
      const data = await res.json() as { stargazers_count: number }
      const v = data.stargazers_count
      return { label, value: v, display: `~${Math.round(v / 1000)}K` }
    })
  )
  return {
    id: 'github-stars',
    title: 'Rank these GitHub repos from most to fewest stars',
    theme: 'tech',
    difficulty: 'medium',
    unit: 'GitHub stars',
    items: toRankItems(raw),
    source: 'GitHub API, live',
  }
}

async function fetchNpmDownloads(): Promise<Category> {
  const raw = await Promise.all(
    NPM_PACKAGES.map(async (pkg) => {
      const res = await fetch(`https://api.npmjs.org/downloads/point/last-week/${pkg}`, { signal: AbortSignal.timeout(5000) })
      if (!res.ok) throw new Error(`npm ${res.status}`)
      const data = await res.json() as { downloads: number }
      const v = data.downloads
      const display = v >= 1_000_000 ? `${Math.round(v / 1_000_000)}M` : `${Math.round(v / 1000)}K`
      return { label: pkg, value: v, display }
    })
  )
  return {
    id: 'npm-weekly-downloads',
    title: 'Rank these npm packages from most to fewest weekly downloads',
    theme: 'tech',
    difficulty: 'hard',
    unit: 'weekly downloads',
    items: toRankItems(raw),
    source: 'npm API, live',
  }
}

async function fetchWikipediaPageviews(): Promise<Category> {
  const { start, end } = prevMonthRange()
  const raw = await Promise.all(
    WIKI_ARTICLES.map(async ({ label, article }) => {
      const url =
        `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article` +
        `/en.wikipedia/all-access/all-agents/${article}/monthly/${start}/${end}`
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
      if (!res.ok) throw new Error(`Wikipedia ${res.status}`)
      const data = await res.json() as { items: { views: number }[] }
      const v = data.items[0]?.views ?? 0
      const display = v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${Math.round(v / 1000)}K`
      return { label, value: v, display }
    })
  )
  return {
    id: 'wikipedia-pageviews',
    title: 'Rank these Wikipedia articles by monthly pageviews',
    theme: 'geography',
    difficulty: 'medium',
    unit: 'monthly pageviews',
    items: toRankItems(raw),
    source: 'Wikipedia API, live',
  }
}

// ── Cache + public API ───────────────────────────────────────────────────────

let cache: { data: Category[]; fetchedAt: number } | null = null
const CACHE_TTL = 86_400_000 // 24 hours

/** Exposed for tests only — resets the in-memory cache. */
export function _resetCacheForTesting(): void {
  cache = null
}

export async function fetchLiveCategories(): Promise<Category[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return cache.data
  }

  const results = await Promise.allSettled([
    fetchGitHubStars(),
    fetchNpmDownloads(),
    fetchWikipediaPageviews(),
  ])

  const data = results
    .filter((r): r is PromiseFulfilledResult<Category> => r.status === 'fulfilled')
    .map(r => r.value)

  if (data.length > 0) {
    cache = { data, fetchedAt: Date.now() }
  }
  return data
}
