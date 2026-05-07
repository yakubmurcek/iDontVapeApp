/**
 * Money-saved calculation. Continuous in time so the dashboard's Quit Fund
 * card and share copy don't sit at $0 for the first 24 hours and then jump.
 *
 * Pure function: takes the elapsed milliseconds since the recovery clock
 * started and the user's vaping profile, returns dollars saved.
 *
 * Display layer is responsible for rounding (e.g. .toFixed(2)).
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24

export function calculateMoneySaved(
  timeSinceQuitMs: number,
  puffsPerDay: number,
  costPerPuff: number,
): number {
  if (!Number.isFinite(timeSinceQuitMs) || timeSinceQuitMs <= 0) return 0
  if (!Number.isFinite(puffsPerDay) || puffsPerDay <= 0) return 0
  if (!Number.isFinite(costPerPuff) || costPerPuff <= 0) return 0
  const daysAvoided = timeSinceQuitMs / MS_PER_DAY
  return daysAvoided * puffsPerDay * costPerPuff
}
