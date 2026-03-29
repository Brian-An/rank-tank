# Live Data Categories Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace three hardcoded JSON categories (GitHub stars, npm downloads, Wikipedia pageviews) with live API fetches so daily challenge data stays current.

**Architecture:** New `lib/liveCategories.ts` fetches 3 public APIs in parallel, caches results for 24 hours in module memory, and falls back gracefully on any failure. `app/api/round/route.ts` is updated to prefer live categories in daily mode.

**Tech Stack:** Next.js 16 App Router, TypeScript, Vitest, native `fetch` (no new dependencies)

---

### Task 1: Write failing tests for `lib/liveCategories.ts`

**Files:**
- Create: `tests/lib/liveCategories.test.ts`

- [ ] **Step 1: Create the test file**

```typescript
// tests/lib/liveCategories.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchLiveCategories, _resetCacheForTesting } from '@/lib/liveCategories'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function githubResp(stars: number) {
  return Promise.resolve({ ok: true, json: () => Promise.resolve({ stargazers_count: stars }) })
}
function npmResp(downloads: number) {
  return Promise.resolve({ ok: true, json: () => Promise.resolve({ downloads }) })
}
function wikiResp(views: number) {
  return Promise.resolve({ ok: true, json: () => Promise.resolve({ items: [{ views }] }) })
}
function errorResp() {
  return Promise.resolve({ ok: false, json: () => Promise.resolve({}) })
}

function mockAllApis() {
  mockFetch.mockImplementation((url: string) => {
    if (url.includes('api.github.com')) return githubResp(100_000)
    if (url.includes('npmjs.org'))      return npmResp(5_000_000)
    if (url.includes('wikimedia.org'))  return wikiResp(1_000_000)
    return errorResp()
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  _resetCacheForTesting()
})

describe('fetchLiveCategories', () => {
  it('returns 3 categories when all APIs succeed', async () => {
    mockAllApis()
    const categories = await fetchLiveCategories()
    expect(categories).toHaveLength(3)
    expect(categories.map(c => c.id)).toEqual(
      expect.arrayContaining(['github-stars', 'npm-weekly-downloads', 'wikipedia-pageviews'])
    )
  })

  it('each category has 5 items sorted highest first', async () => {
    mockAllApis()
    const categories = await fetchLiveCategories()
    for (const cat of categories) {
      expect(cat.items).toHaveLength(5)
      for (let i = 0; i < cat.items.length - 1; i++) {
        expect(cat.items[i].value).toBeGreaterThanOrEqual(cat.items[i + 1].value)
      }
    }
  })

  it('skips a category when its API returns non-200', async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('api.github.com')) return errorResp()
      if (url.includes('npmjs.org'))      return npmResp(5_000_000)
      if (url.includes('wikimedia.org'))  return wikiResp(1_000_000)
      return errorResp()
    })
    const categories = await fetchLiveCategories()
    expect(categories).toHaveLength(2)
    expect(categories.map(c => c.id)).not.toContain('github-stars')
  })

  it('returns empty array when all APIs fail', async () => {
    mockFetch.mockImplementation(() => errorResp())
    const categories = await fetchLiveCategories()
    expect(categories).toHaveLength(0)
  })

  it('returns cached result on second call without re-fetching', async () => {
    mockAllApis()
    await fetchLiveCategories()
    const callsAfterFirst = mockFetch.mock.calls.length
    await fetchLiveCategories()
    expect(mockFetch.mock.calls.length).toBe(callsAfterFirst)
  })

  it('source field indicates live data', async () => {
    mockAllApis()
    const categories = await fetchLiveCategories()
    for (const cat of categories) {
      expect(cat.source).toMatch(/live/)
    }
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/lib/liveCategories.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/liveCategories'`

---

### Task 2: Implement `lib/liveCategories.ts`

**Files:**
- Create: `lib/liveCategories.ts`

- [ ] **Step 1: Create the implementation**

```typescript
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
  const y = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
  const m = now.getMonth() === 0 ? 12 : now.getMonth()
  const lastDay = new Date(y, m, 0).getDate()
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
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
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
      const res = await fetch(`https://api.npmjs.org/downloads/point/last-week/${pkg}`)
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
      const res = await fetch(url)
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

  cache = { data, fetchedAt: Date.now() }
  return data
}
```

- [ ] **Step 2: Run tests to verify they pass**

```bash
npx vitest run tests/lib/liveCategories.test.ts
```

Expected: 6 tests PASS

- [ ] **Step 3: Commit**

```bash
git add lib/liveCategories.ts tests/lib/liveCategories.test.ts
git commit -m "feat: add live data categories (GitHub, npm, Wikipedia)"
```

---

### Task 3: Write failing test for daily route using live data

**Files:**
- Create: `tests/lib/dailyRoute.test.ts`

- [ ] **Step 1: Create the test file**

```typescript
// tests/lib/dailyRoute.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/liveCategories', () => ({
  fetchLiveCategories: vi.fn(),
}))

import { GET } from '@/app/api/round/route'
import { fetchLiveCategories } from '@/lib/liveCategories'

const mockLive = vi.mocked(fetchLiveCategories)

const fakeCategory = {
  id: 'github-stars',
  title: 'Rank these repos',
  theme: 'tech' as const,
  difficulty: 'medium' as const,
  unit: 'stars',
  items: [
    { id: '1', label: 'A', value: 500, display: '500K' },
    { id: '2', label: 'B', value: 400, display: '400K' },
    { id: '3', label: 'C', value: 300, display: '300K' },
    { id: '4', label: 'D', value: 200, display: '200K' },
    { id: '5', label: 'E', value: 100, display: '100K' },
  ],
  source: 'GitHub API, live',
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/round daily mode', () => {
  it('uses a live category when available', async () => {
    mockLive.mockResolvedValue([fakeCategory])
    const req = new Request('http://localhost/api/round?mode=daily&date=2026-03-28')
    const res = await GET(req as any)
    const body = await res.json()
    expect(body.category.id).toBe('github-stars')
    expect(body.category.source).toMatch(/live/)
  })

  it('falls back to local round when live returns empty', async () => {
    mockLive.mockResolvedValue([])
    const req = new Request('http://localhost/api/round?mode=daily&date=2026-03-28')
    const res = await GET(req as any)
    const body = await res.json()
    expect(body.category).toBeDefined()
    // Local categories do not have 'live' in source
    expect(body.category.source ?? '').not.toMatch(/live/)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run tests/lib/dailyRoute.test.ts
```

Expected: FAIL — `fetchLiveCategories` not called yet in route

---

### Task 4: Update daily mode in `app/api/round/route.ts`

**Files:**
- Modify: `app/api/round/route.ts`

- [ ] **Step 1: Add the import and update the daily branch**

Replace the top of `app/api/round/route.ts` to add the import:

```typescript
import type { NextRequest } from 'next/server'
import type { Theme, Difficulty } from '@/lib/types'
import { shuffle, pickIndex } from '@/lib/seed'
import { getLocalRound } from '@/lib/localRounds'
import { getCachedRound, setCachedRound } from '@/lib/roundCache'
import { generateRound } from '@/lib/openai'
import { fetchLiveCategories } from '@/lib/liveCategories'
```

Replace the `if (mode === 'daily')` block (lines 23–25) with:

```typescript
    if (mode === 'daily') {
      const liveCategories = await fetchLiveCategories()
      if (liveCategories.length > 0) {
        const idx = pickIndex(liveCategories.length, date)
        category = liveCategories[idx]
      } else {
        category = getLocalRound(date)
      }
    }
```

The full updated file should look like:

```typescript
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
```

- [ ] **Step 2: Run all tests to verify they pass**

```bash
npx vitest run
```

Expected: All tests PASS (seed, scoring, liveCategories, dailyRoute)

- [ ] **Step 3: Verify TypeScript compiles cleanly**

```bash
npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add app/api/round/route.ts tests/lib/dailyRoute.test.ts
git commit -m "feat: use live API data for daily challenge with local fallback"
```
