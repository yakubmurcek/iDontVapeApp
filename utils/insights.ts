/**
 * Pattern insights — turns raw craving/resist/relapse logs into short,
 * user-visible summaries like "80% of your cravings hit between 8–10pm" or
 * "Stress is your top trigger". Pure functions on top of the logs array so
 * everything is deterministic and testable.
 *
 * Free tier surfaces one headline insight. Premium tier unlocks the full list
 * — this is the natural gating point for the dashboard insights card.
 */

import {
  CRAVING_TRIGGERS,
  CravingTrigger,
  HALT_OPTIONS,
  HaltState,
  VapingLog,
} from '@/store/logsStore'

export type InsightTier = 'free' | 'premium'

export interface Insight {
  id: string
  title: string
  detail: string
  tier: InsightTier
}

const MIN_EVENTS_FOR_INSIGHT = 3 // Keep noise out until we actually have a signal

interface HourBucket {
  label: string
  start: number // inclusive
  end: number // exclusive
}

const HOUR_BUCKETS: HourBucket[] = [
  { label: 'morning (5am–11am)', start: 5, end: 11 },
  { label: 'midday (11am–2pm)', start: 11, end: 14 },
  { label: 'afternoon (2pm–6pm)', start: 14, end: 18 },
  { label: 'evening (6pm–10pm)', start: 18, end: 22 },
  { label: 'late-night (10pm–5am)', start: 22, end: 5 }, // wraps
]

function inBucket(hour: number, bucket: HourBucket): boolean {
  if (bucket.start < bucket.end) return hour >= bucket.start && hour < bucket.end
  // Wrapping bucket (e.g. 22–5): match if hour ≥ start OR hour < end.
  return hour >= bucket.start || hour < bucket.end
}

function triggerLabel(id: CravingTrigger): string {
  return CRAVING_TRIGGERS.find((t) => t.id === id)?.label ?? id
}

function haltLabel(id: HaltState): string {
  return HALT_OPTIONS.find((h) => h.id === id)?.label.toLowerCase() ?? id
}

/**
 * Generate insights from the logs array. Returned in priority order (strongest
 * signal first). Dashboard shows the first free-tier insight to everyone and
 * gates the rest behind the paywall.
 */
export function generateInsights(logs: VapingLog[]): Insight[] {
  const cravingLogs = logs.filter(
    (l) => l.entryType === 'cravingResisted' || l.entryType === 'cravingLost',
  )
  const relapseLogs = logs.filter((l) => l.entryType === 'relapse')

  const insights: Insight[] = []

  // 1. Top trigger across cravings + relapses — the headline free-tier insight.
  const triggerCounts = new Map<CravingTrigger, number>()
  for (const log of [...cravingLogs, ...relapseLogs]) {
    if (!log.trigger) continue
    triggerCounts.set(log.trigger, (triggerCounts.get(log.trigger) ?? 0) + 1)
  }
  const totalTriggered = Array.from(triggerCounts.values()).reduce((a, b) => a + b, 0)
  if (totalTriggered >= MIN_EVENTS_FOR_INSIGHT) {
    const sorted = Array.from(triggerCounts.entries()).sort((a, b) => b[1] - a[1])
    const [topId, topCount] = sorted[0]
    const pct = Math.round((topCount / totalTriggered) * 100)
    insights.push({
      id: 'top-trigger',
      title: `${triggerLabel(topId)} is your top trigger`,
      detail: `${pct}% of tagged cravings trace back to ${triggerLabel(topId).toLowerCase()}. Knowing this is half the fight.`,
      tier: 'free',
    })
  }

  // 2. Time-of-day pattern on resisted cravings. Requires enough signal and a
  //    bucket that's clearly over-represented (≥50% of cravings in one window).
  if (cravingLogs.length >= MIN_EVENTS_FOR_INSIGHT) {
    const bucketCounts = new Map<string, number>()
    for (const log of cravingLogs) {
      const hour = new Date(log.timestamp).getHours()
      const bucket = HOUR_BUCKETS.find((b) => inBucket(hour, b))
      if (!bucket) continue
      bucketCounts.set(bucket.label, (bucketCounts.get(bucket.label) ?? 0) + 1)
    }
    const sorted = Array.from(bucketCounts.entries()).sort((a, b) => b[1] - a[1])
    if (sorted.length > 0) {
      const [topLabel, topCount] = sorted[0]
      const pct = Math.round((topCount / cravingLogs.length) * 100)
      if (pct >= 50) {
        insights.push({
          id: 'time-of-day',
          title: `Cravings cluster in the ${topLabel.split(' ')[0]}`,
          detail: `${pct}% of your cravings hit in the ${topLabel}. Consider pre-loading a distraction at that time.`,
          tier: 'premium',
        })
      }
    }
  }

  // 3. HALT pattern — when a state shows up on ≥40% of tagged cravings, it's
  //    worth surfacing. Strongest: paired with the top trigger.
  const haltCounts = new Map<HaltState, number>()
  const taggedWithHalt = cravingLogs.filter((l) => l.halt && l.halt.length > 0)
  for (const log of taggedWithHalt) {
    for (const h of log.halt ?? []) {
      haltCounts.set(h, (haltCounts.get(h) ?? 0) + 1)
    }
  }
  if (taggedWithHalt.length >= MIN_EVENTS_FOR_INSIGHT) {
    const sorted = Array.from(haltCounts.entries()).sort((a, b) => b[1] - a[1])
    if (sorted.length > 0) {
      const [topId, topCount] = sorted[0]
      const pct = Math.round((topCount / taggedWithHalt.length) * 100)
      if (pct >= 40) {
        insights.push({
          id: 'halt-pattern',
          title: `Cravings spike when you're ${haltLabel(topId)}`,
          detail: `Showed up in ${pct}% of your HALT checks. Address the underlying state and the craving often fades with it.`,
          tier: 'premium',
        })
      }
    }
  }

  // 4. Resistance ratio — positive reinforcement when it's strong.
  const lostCount = logs.filter((l) => l.entryType === 'cravingLost').length
  const totalCravings = cravingLogs.length
  if (totalCravings >= MIN_EVENTS_FOR_INSIGHT) {
    const resistPct = Math.round(((totalCravings - lostCount) / totalCravings) * 100)
    if (resistPct >= 70) {
      insights.push({
        id: 'resistance-ratio',
        title: `You resist ${resistPct}% of the time`,
        detail: `That's above the ~50% average for early recovery. Whatever you're doing is working.`,
        tier: 'premium',
      })
    }
  }

  return insights
}

/**
 * Split insights into the one-to-show-free and the rest-locked. Convenience
 * for the dashboard card which always surfaces the top insight and teases the
 * remaining count as a paywall lever.
 */
export function partitionInsights(insights: Insight[]): {
  headline: Insight | null
  locked: Insight[]
} {
  const freeOne = insights.find((i) => i.tier === 'free')
  if (freeOne) {
    const rest = insights.filter((i) => i.id !== freeOne.id)
    return { headline: freeOne, locked: rest }
  }
  // No free-tier insight available yet — tease whatever's there.
  if (insights.length === 0) return { headline: null, locked: [] }
  return { headline: null, locked: insights }
}
