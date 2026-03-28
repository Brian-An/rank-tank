import { describe, it, expect } from 'vitest'
import { calculateScore } from '@/lib/scoring'

describe('calculateScore', () => {
  it('returns 100 for perfect ordering', () => {
    const result = calculateScore(['a', 'b', 'c', 'd', 'e'], ['a', 'b', 'c', 'd', 'e'])
    expect(result.score).toBe(100)
    expect(result.perfect).toBe(true)
    expect(result.totalPairs).toBe(10)
    expect(result.correctPairs).toBe(10)
  })

  it('returns 0 for completely reversed ordering', () => {
    const result = calculateScore(['e', 'd', 'c', 'b', 'a'], ['a', 'b', 'c', 'd', 'e'])
    expect(result.score).toBe(0)
    expect(result.perfect).toBe(false)
  })

  it('returns > 50 for one swap in middle', () => {
    const result = calculateScore(['a', 'c', 'b', 'd', 'e'], ['a', 'b', 'c', 'd', 'e'])
    expect(result.score).toBeGreaterThan(50)
    expect(result.perfect).toBe(false)
  })

  it('totalPairs is n*(n-1)/2', () => {
    const result = calculateScore(['a', 'b', 'c'], ['a', 'b', 'c'])
    expect(result.totalPairs).toBe(3)
  })
})
