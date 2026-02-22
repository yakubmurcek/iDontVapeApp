/**
 * Recovery Calculator
 * Ported from iOS RecoveryCalculator.swift
 */

import {
  OrganType,
  RecoveryMilestone,
  getMilestoneProgress,
  getMilestonesByOrgan,
  getSortedMilestones,
  isMilestoneAchieved,
} from '@/constants/milestones'

// Recovery time constants (in hours)
const HOURS_PER_MONTH = 720
const MAX_RECOVERY_HOURS = 8760 // 1 year for "full" recovery display
const ORGAN_RECOVERY_HOURS: Record<OrganType, number> = {
  heart: 2160, // 3 months for significant cardiac benefits
  lungs: 8760, // 1 year for full lung tissue recovery
  bloodVessels: 4320, // 6 months for circulation restoration
}

// Damage calculation weights (must sum to 1.0)
const WEIGHT_DURATION = 0.4 // long-term exposure has highest impact
const WEIGHT_PUFFS = 0.35 // daily volume second
const WEIGHT_NICOTINE = 0.25 // concentration third

// Curve exponent: < 1 makes moderate usage show more significant damage
const DAMAGE_CURVE_EXPONENT = 0.7

// Clamp initial damage so the UI always shows meaningful progress
const MIN_DAMAGE_SCORE = 0.15
const MAX_DAMAGE_SCORE = 0.85

// What fraction of initial damage can be recovered over time
const MAX_RECOVERABLE_FRACTION = 0.8

// Organ recovery blending (milestone completion vs. elapsed time)
const ORGAN_MILESTONE_WEIGHT = 0.5
const ORGAN_TIME_WEIGHT = 0.5

/**
 * Calculate initial damage score based on vaping history
 * @returns Value from 0.0 (healthy) to 1.0 (severe damage)
 */
export function calculateInitialDamage(
  vapingDurationMonths: number,
  nicotineStrength: number,
  puffsPerDay: number,
): number {
  // Normalize each factor to 0-1 range

  // Duration: 0-120 months (10 years) maps to 0-1
  const durationFactor = Math.min(vapingDurationMonths / 120.0, 1.0)

  // Nicotine: 0-50mg maps to 0-1
  const nicotineFactor = Math.min(nicotineStrength / 50.0, 1.0)

  // Puffs: 0-500 puffs/day maps to 0-1
  const puffsFactor = Math.min(puffsPerDay / 500.0, 1.0)

  // Weighted combination
  const weightedScore =
    durationFactor * WEIGHT_DURATION + puffsFactor * WEIGHT_PUFFS + nicotineFactor * WEIGHT_NICOTINE

  // Apply a curve to make moderate usage still show significant damage
  const curvedScore = Math.pow(weightedScore, DAMAGE_CURVE_EXPONENT)

  // Clamp to meaningful display range
  return Math.max(MIN_DAMAGE_SCORE, Math.min(MAX_DAMAGE_SCORE, curvedScore))
}

/**
 * Calculate current system integrity score
 * @returns Value from 0.0 (just started) to 1.0 (fully recovered)
 */
export function calculateSystemIntegrity(initialDamage: number, hoursSinceQuit: number): number {
  // Calculate recovery progress (0-1)
  // Calculate recovery progress (0-1)
  let recoveryProgress: number
  if (hoursSinceQuit <= 0) {
    recoveryProgress = 0
  } else if (hoursSinceQuit >= MAX_RECOVERY_HOURS) {
    recoveryProgress = 1.0
  } else {
    // Logarithmic curve for realistic recovery feel
    recoveryProgress = Math.log(hoursSinceQuit + 1) / Math.log(MAX_RECOVERY_HOURS + 1)
  }

  // Current damage = initial damage reduced by recovery progress
  const maxRecoverable = initialDamage * MAX_RECOVERABLE_FRACTION
  const currentDamage = initialDamage - maxRecoverable * recoveryProgress

  // System integrity is inverse of damage
  const integrity = 1.0 - currentDamage

  return Math.min(1.0, Math.max(0.0, integrity))
}

export interface MilestoneProgress {
  current: RecoveryMilestone | null
  next: RecoveryMilestone | null
  progress: number
}

/**
 * Get the current and next milestone based on hours since quit
 */
export function getCurrentMilestoneProgress(hoursSinceQuit: number): MilestoneProgress {
  const sortedMilestones = getSortedMilestones()

  let currentMilestone: RecoveryMilestone | null = null
  let nextMilestone: RecoveryMilestone | null = null

  for (const milestone of sortedMilestones) {
    if (isMilestoneAchieved(milestone, hoursSinceQuit)) {
      currentMilestone = milestone
    } else {
      nextMilestone = milestone
      break
    }
  }

  const progress = nextMilestone ? getMilestoneProgress(nextMilestone, hoursSinceQuit) : 1.0

  return { current: currentMilestone, next: nextMilestone, progress }
}

/**
 * Calculate recovery score for a specific organ
 * Heart recovers faster (responds within hours/days)
 * Lungs take longer (weeks to months for tissue repair)
 * @returns Value from 0.0 (no recovery) to 1.0 (fully recovered)
 */
export function calculateOrganRecovery(
  organ: OrganType,
  initialDamage: number,
  hoursSinceQuit: number,
): number {
  const organMilestones = getMilestonesByOrgan(organ)

  if (organMilestones.length === 0) {
    return 1 - initialDamage
  }

  const maxHours = ORGAN_RECOVERY_HOURS[organ]

  // Calculate progress based on organ milestones achieved
  const achievedMilestones = organMilestones.filter((m) => isMilestoneAchieved(m, hoursSinceQuit))

  // Weight: milestone completion + time-based recovery
  const milestoneWeight = achievedMilestones.length / organMilestones.length

  // Logarithmic time-based recovery (faster early gains)
  const timeProgress =
    hoursSinceQuit <= 0 ? 0 : Math.min(1, Math.log(hoursSinceQuit + 1) / Math.log(maxHours + 1))

  // Combined progress
  const combinedProgress = milestoneWeight * ORGAN_MILESTONE_WEIGHT + timeProgress * ORGAN_TIME_WEIGHT

  const maxRecoverable = initialDamage * MAX_RECOVERABLE_FRACTION
  const currentDamage = initialDamage - maxRecoverable * combinedProgress

  // Return recovery score (inverse of damage)
  const recovery = 1 - currentDamage

  return Math.min(1.0, Math.max(0.0, recovery))
}

/**
 * Format time since quit as "XXD XXH XXM"
 */
export function formatTimeSinceQuit(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  return `${days.toString().padStart(2, '0')}D ${hours.toString().padStart(2, '0')}H ${minutes.toString().padStart(2, '0')}M`
}
