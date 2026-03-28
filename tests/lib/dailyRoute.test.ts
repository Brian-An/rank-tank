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
