import { describe, it, expect } from 'vitest'
import { shuffle, pickIndex } from '@/lib/seed'

describe('shuffle', () => {
  it('returns same length array', () => {
    const items = [1, 2, 3, 4, 5]
    expect(shuffle(items, 'test-seed')).toHaveLength(5)
  })

  it('is deterministic for same seed', () => {
    const items = ['a', 'b', 'c', 'd', 'e']
    expect(shuffle(items, 'abc')).toEqual(shuffle(items, 'abc'))
  })

  it('produces different results for different seeds', () => {
    const items = [1, 2, 3, 4, 5]
    expect(shuffle(items, 'seed-1')).not.toEqual(shuffle(items, 'seed-2'))
  })

  it('does not mutate the original array', () => {
    const items = [1, 2, 3, 4, 5]
    shuffle(items, 'test')
    expect(items).toEqual([1, 2, 3, 4, 5])
  })
})

describe('pickIndex', () => {
  it('returns index within bounds', () => {
    for (let i = 0; i < 20; i++) {
      const idx = pickIndex(5, `seed-${i}`)
      expect(idx).toBeGreaterThanOrEqual(0)
      expect(idx).toBeLessThan(5)
    }
  })

  it('is deterministic', () => {
    expect(pickIndex(10, 'hello')).toBe(pickIndex(10, 'hello'))
  })
})
