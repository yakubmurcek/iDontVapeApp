import { describe, expect, it } from 'vitest'
import {
  computeStreak,
  computeStreakWithFreeze,
  hasScanAvailableToday,
  localDateKey,
} from '../utils/streak'

describe('streak logic (local-date-key based)', () => {
  it('starts at 1 when there is no prior scan', () => {
    expect(computeStreak(null, 0, '2026-03-11')).toBe(1)
  })

  it('increments when today is exactly one day after the last scan', () => {
    expect(computeStreak('2026-03-10', 5, '2026-03-11')).toBe(6)
    expect(computeStreak('2026-03-31', 2, '2026-04-01')).toBe(3) // month rollover
  })

  it('resets to 1 when the gap is 2+ days', () => {
    expect(computeStreak('2026-03-09', 5, '2026-03-11')).toBe(1)
    expect(computeStreak('2026-01-01', 30, '2026-03-11')).toBe(1)
  })

  it('is a no-op when called with the same-day date key (defensive)', () => {
    expect(computeStreak('2026-03-11', 5, '2026-03-11')).toBe(5)
  })
})

describe('local date gating', () => {
  it('detects scan availability based on local date key', () => {
    const now = new Date(2026, 2, 11, 10, 0, 0, 0) // Mar 11, 2026 local
    const todayKey = localDateKey(now)
    const yesterday = new Date(2026, 2, 10, 23, 0, 0, 0)
    const yesterdayKey = localDateKey(yesterday)

    expect(hasScanAvailableToday(todayKey, now)).toBe(false)
    expect(hasScanAvailableToday(yesterdayKey, now)).toBe(true)
  })

  it('returns true when no previous scan', () => {
    expect(hasScanAvailableToday(null)).toBe(true)
  })

  it('blocks re-scan within 20h even if date key advanced (timezone-safety rail)', () => {
    // Simulate a user crossing the dateline: yesterday's key is "yesterday local"
    // but only 5h have passed since the last scan.
    const now = new Date(2026, 2, 11, 4, 0, 0, 0) // 4am Mar 11 local
    const lastScanAt = now.getTime() - 5 * 60 * 60 * 1000 // 5h ago
    const yesterdayKey = '2026-03-10'
    expect(hasScanAvailableToday(yesterdayKey, now, lastScanAt)).toBe(false)
  })

  it('permits scan once 20h has elapsed and the date key has advanced', () => {
    const now = new Date(2026, 2, 11, 10, 0, 0, 0)
    const lastScanAt = now.getTime() - 21 * 60 * 60 * 1000
    expect(hasScanAvailableToday('2026-03-10', now, lastScanAt)).toBe(true)
  })
})

describe('streak freezes', () => {
  it('behaves like computeStreak for gap === 1 (no freeze consumed)', () => {
    expect(computeStreakWithFreeze('2026-03-10', 5, '2026-03-11', 2)).toEqual({
      streak: 6,
      freezeConsumed: false,
    })
  })

  it('starts at 1 when there is no prior scan, regardless of freezes', () => {
    expect(computeStreakWithFreeze(null, 0, '2026-03-11', 3)).toEqual({
      streak: 1,
      freezeConsumed: false,
    })
  })

  it('consumes a freeze on a 2-day gap and continues the streak', () => {
    expect(computeStreakWithFreeze('2026-03-09', 5, '2026-03-11', 1)).toEqual({
      streak: 6,
      freezeConsumed: true,
    })
  })

  it('resets on a 2-day gap when no freeze is available', () => {
    expect(computeStreakWithFreeze('2026-03-09', 5, '2026-03-11', 0)).toEqual({
      streak: 1,
      freezeConsumed: false,
    })
  })

  it('resets on gaps larger than 2 days even with freezes available', () => {
    // Keeps the mechanic simple: one freeze covers one missed day, no stacking.
    expect(computeStreakWithFreeze('2026-03-08', 5, '2026-03-11', 3)).toEqual({
      streak: 1,
      freezeConsumed: false,
    })
  })
})
