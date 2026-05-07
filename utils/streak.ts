const MS_PER_DAY = 1000 * 60 * 60 * 24
const MIN_MS_BETWEEN_SCANS = 20 * 60 * 60 * 1000 // 20h safety rail

export function localDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Is a daily scan available now?
 *
 * Primary gate: the last scan's local date key must be different from today's.
 * Safety rail: if `lastScanAt` is supplied, also require 20h since the last
 * scan. This prevents timezone travel (flight crossing the dateline) from
 * retroactively unlocking a scan within a few hours of the last one.
 */
export function hasScanAvailableToday(
  lastScanLocalDate: string | null,
  now: Date = new Date(),
  lastScanAt: number | null = null,
): boolean {
  if (!lastScanLocalDate) return true
  if (lastScanLocalDate === localDateKey(now)) return false
  if (lastScanAt !== null && now.getTime() - lastScanAt < MIN_MS_BETWEEN_SCANS) return false
  return true
}

/**
 * Compute the next streak value based on the calendar-day gap between the last
 * scan and today. Same-day is a no-op (the guard prevents that caller-side).
 * One day = streak +1. Any larger gap resets.
 *
 * Operates on local-date keys so it stays consistent with `hasScanAvailableToday`
 * — a timestamp-based approach could disagree with the date-key guard when the
 * elapsed hours don't neatly match whole calendar days (e.g. 23h spanning
 * midnight).
 */
export function computeStreak(
  lastScanLocalDate: string | null,
  currentStreak: number,
  todayLocalDate: string,
): number {
  if (!lastScanLocalDate) return 1

  const lastTime = parseDateKeyLocal(lastScanLocalDate).getTime()
  const todayTime = parseDateKeyLocal(todayLocalDate).getTime()
  const dayDiff = Math.round((todayTime - lastTime) / MS_PER_DAY)

  if (dayDiff === 1) return Math.max(1, currentStreak) + 1
  if (dayDiff <= 0) return Math.max(1, currentStreak) // same day — no-op
  return 1 // 2+ day gap — streak broken
}

export interface StreakWithFreezeResult {
  streak: number
  freezeConsumed: boolean
}

/**
 * Freeze-aware streak computation. A single freeze covers exactly one missed
 * day (gap of 2); larger gaps still break the streak to keep the mechanic
 * predictable (Duolingo parity). The caller is responsible for decrementing
 * its freeze balance when `freezeConsumed` is true.
 *
 * Kept separate from `computeStreak` so the existing caller and tests continue
 * to work unchanged while the freeze behavior is isolated and testable.
 */
export function computeStreakWithFreeze(
  lastScanLocalDate: string | null,
  currentStreak: number,
  todayLocalDate: string,
  freezesAvailable: number,
): StreakWithFreezeResult {
  if (!lastScanLocalDate) return { streak: 1, freezeConsumed: false }

  const lastTime = parseDateKeyLocal(lastScanLocalDate).getTime()
  const todayTime = parseDateKeyLocal(todayLocalDate).getTime()
  const dayDiff = Math.round((todayTime - lastTime) / MS_PER_DAY)

  if (dayDiff <= 0) return { streak: Math.max(1, currentStreak), freezeConsumed: false }
  if (dayDiff === 1) {
    return { streak: Math.max(1, currentStreak) + 1, freezeConsumed: false }
  }
  if (dayDiff === 2 && freezesAvailable > 0) {
    return { streak: Math.max(1, currentStreak) + 1, freezeConsumed: true }
  }
  return { streak: 1, freezeConsumed: false }
}

function parseDateKeyLocal(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day, 0, 0, 0, 0)
}

export function clampFutureDateKey(dateKey: string, now: Date = new Date()): string {
  const date = parseDateKeyLocal(dateKey)
  const nowKey = localDateKey(now)
  if (date.getTime() > parseDateKeyLocal(nowKey).getTime()) {
    return nowKey
  }
  return dateKey
}
