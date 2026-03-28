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
