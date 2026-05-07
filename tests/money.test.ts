import { describe, expect, it } from 'vitest'
import { calculateMoneySaved } from '../utils/money'

const HOUR_MS = 1000 * 60 * 60
const DAY_MS = 24 * HOUR_MS

describe('calculateMoneySaved (continuous)', () => {
  it('returns 0 at t=0 (no time has elapsed)', () => {
    expect(calculateMoneySaved(0, 100, 0.02)).toBe(0)
  })

  it('returns a non-zero amount within the first 24 hours (the bug we fixed)', () => {
    // 12h with default profile: 12/24 days * 100 puffs * $0.02 = $1.00
    expect(calculateMoneySaved(12 * HOUR_MS, 100, 0.02)).toBeCloseTo(1.0, 5)
  })

  it('matches the integer day result at exactly 24h boundaries', () => {
    expect(calculateMoneySaved(1 * DAY_MS, 100, 0.02)).toBeCloseTo(2.0, 5)
    expect(calculateMoneySaved(7 * DAY_MS, 100, 0.02)).toBeCloseTo(14.0, 5)
  })

  it('grows linearly with time', () => {
    const oneHour = calculateMoneySaved(1 * HOUR_MS, 100, 0.02)
    const twoHours = calculateMoneySaved(2 * HOUR_MS, 100, 0.02)
    expect(twoHours).toBeCloseTo(oneHour * 2, 5)
  })

  it('scales linearly with puffs/day and cost/puff', () => {
    const base = calculateMoneySaved(1 * DAY_MS, 100, 0.02)
    expect(calculateMoneySaved(1 * DAY_MS, 200, 0.02)).toBeCloseTo(base * 2, 5)
    expect(calculateMoneySaved(1 * DAY_MS, 100, 0.04)).toBeCloseTo(base * 2, 5)
  })

  it('returns 0 for negative or non-finite inputs (defensive)', () => {
    expect(calculateMoneySaved(-1000, 100, 0.02)).toBe(0)
    expect(calculateMoneySaved(NaN, 100, 0.02)).toBe(0)
    expect(calculateMoneySaved(Infinity, 100, 0.02)).toBe(0)
    expect(calculateMoneySaved(1 * DAY_MS, 0, 0.02)).toBe(0)
    expect(calculateMoneySaved(1 * DAY_MS, 100, 0)).toBe(0)
    expect(calculateMoneySaved(1 * DAY_MS, -1, 0.02)).toBe(0)
  })
})
