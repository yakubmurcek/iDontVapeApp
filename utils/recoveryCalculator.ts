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
    isMilestoneAchieved
} from "@/constants/milestones";

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
  const durationFactor = Math.min(vapingDurationMonths / 120.0, 1.0);

  // Nicotine: 0-50mg maps to 0-1
  const nicotineFactor = Math.min(nicotineStrength / 50.0, 1.0);

  // Puffs: 0-500 puffs/day maps to 0-1
  const puffsFactor = Math.min(puffsPerDay / 500.0, 1.0);

  // Weighted combination
  // Duration has highest weight (long-term damage accumulates)
  // Puffs second (daily exposure)
  // Nicotine third (concentration)
  const weightedScore =
    durationFactor * 0.4 + puffsFactor * 0.35 + nicotineFactor * 0.25;

  // Apply a curve to make moderate usage still show significant damage
  const curvedScore = Math.pow(weightedScore, 0.7);

  // Ensure minimum damage of 15% and maximum of 85%
  return Math.max(0.15, Math.min(0.85, curvedScore));
}

/**
 * Calculate current system integrity score
 * @returns Value from 0.0 (just started) to 1.0 (fully recovered)
 */
export function calculateSystemIntegrity(
  initialDamage: number,
  hoursSinceQuit: number,
): number {
  const maxRecoveryHours = 8760; // 1 year for "full" recovery display

  // Calculate recovery progress (0-1)
  let recoveryProgress: number;
  if (hoursSinceQuit <= 0) {
    recoveryProgress = 0;
  } else if (hoursSinceQuit >= maxRecoveryHours) {
    recoveryProgress = 1.0;
  } else {
    // Logarithmic curve for realistic recovery feel
    recoveryProgress =
      Math.log(hoursSinceQuit + 1) / Math.log(maxRecoveryHours + 1);
  }

  // Current damage = initial damage reduced by recovery progress
  // Recovery can repair up to 80% of the damage over time
  const maxRecoverable = initialDamage * 0.8;
  const currentDamage = initialDamage - maxRecoverable * recoveryProgress;

  // System integrity is inverse of damage
  const integrity = 1.0 - currentDamage;

  return Math.min(1.0, Math.max(0.0, integrity));
}

export interface MilestoneProgress {
  current: RecoveryMilestone | null;
  next: RecoveryMilestone | null;
  progress: number;
}

/**
 * Get the current and next milestone based on hours since quit
 */
export function getCurrentMilestoneProgress(
  hoursSinceQuit: number,
): MilestoneProgress {
  const sortedMilestones = getSortedMilestones();

  let currentMilestone: RecoveryMilestone | null = null;
  let nextMilestone: RecoveryMilestone | null = null;

  for (const milestone of sortedMilestones) {
    if (isMilestoneAchieved(milestone, hoursSinceQuit)) {
      currentMilestone = milestone;
    } else {
      nextMilestone = milestone;
      break;
    }
  }

  const progress = nextMilestone
    ? getMilestoneProgress(nextMilestone, hoursSinceQuit)
    : 1.0;

  return { current: currentMilestone, next: nextMilestone, progress };
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
  const organMilestones = getMilestonesByOrgan(organ);

  if (organMilestones.length === 0) {
    return 1 - initialDamage;
  }

  // Organ-specific max recovery hours
  // Heart: faster recovery - most benefits within weeks
  // Lungs: slower recovery - tissue repair takes months
  // Blood vessels: moderate - circulation improves over time
  const organMaxRecoveryHours: Record<OrganType, number> = {
    heart: 2160, // 3 months for significant cardiac benefits
    lungs: 8760, // 1 year for full lung tissue recovery
    bloodVessels: 4320, // 6 months for circulation restoration
  };

  const maxHours = organMaxRecoveryHours[organ];

  // Calculate progress based on organ milestones achieved
  const achievedMilestones = organMilestones.filter((m) =>
    isMilestoneAchieved(m, hoursSinceQuit),
  );

  // Weight: milestone completion + time-based recovery
  const milestoneWeight = achievedMilestones.length / organMilestones.length;

  // Logarithmic time-based recovery (faster early gains)
  const timeProgress =
    hoursSinceQuit <= 0
      ? 0
      : Math.min(1, Math.log(hoursSinceQuit + 1) / Math.log(maxHours + 1));

  // Combined progress (50% milestones, 50% time)
  const combinedProgress = milestoneWeight * 0.5 + timeProgress * 0.5;

  // Recovery can repair up to 80% of the damage
  const maxRecoverable = initialDamage * 0.8;
  const currentDamage = initialDamage - maxRecoverable * combinedProgress;

  // Return recovery score (inverse of damage)
  const recovery = 1 - currentDamage;

  return Math.min(1.0, Math.max(0.0, recovery));
}

/**
 * Format time since quit as "XXD XXH XXM"
 */
export function formatTimeSinceQuit(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return `${days.toString().padStart(2, "0")}D ${hours.toString().padStart(2, "0")}H ${minutes.toString().padStart(2, "0")}M`;
}
