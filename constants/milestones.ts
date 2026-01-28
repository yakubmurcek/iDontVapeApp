/**
 * Recovery Milestones with medical timelines
 * Based on real health recovery data for vaping cessation
 */

export type OrganType = "lungs" | "heart" | "bloodVessels";

export interface RecoveryMilestone {
  id: string;
  displayName: string;
  systemName: string;
  hoursRequired: number;
  relatedOrgan: OrganType;
}

export const MILESTONES: RecoveryMilestone[] = [
  // === HEART - Recovers relatively quickly ===
  // Heart rate and blood pressure respond almost immediately
  {
    id: "heartRateDrops",
    displayName: "Heart Rate Drops",
    systemName: "CARDIAC_RATE_NORMALIZING",
    hoursRequired: 0.33, // 20 minutes
    relatedOrgan: "heart",
  },
  {
    id: "bloodPressureNormalized",
    displayName: "Blood Pressure Normalized",
    systemName: "BP_STABILIZED",
    hoursRequired: 2,
    relatedOrgan: "heart",
  },
  {
    id: "heartRateStabilized",
    displayName: "Heart Rate Stabilized",
    systemName: "CARDIAC_RHYTHM_STABLE",
    hoursRequired: 24,
    relatedOrgan: "heart",
  },
  {
    id: "cardiacStressReduced",
    displayName: "Cardiac Stress Reduced",
    systemName: "CARDIAC_LOAD_REDUCED",
    hoursRequired: 168, // 1 week
    relatedOrgan: "heart",
  },
  {
    id: "heartAttackRiskDecreased",
    displayName: "Heart Attack Risk Decreased",
    systemName: "CARDIAC_RISK_LOWERED",
    hoursRequired: 8760, // 1 year
    relatedOrgan: "heart",
  },

  // === LUNGS - Takes longer to recover ===
  // Lung tissue heals more slowly than cardiovascular system
  {
    id: "bloodOxygenNormalized",
    displayName: "Blood Oxygen Normalized",
    systemName: "O2_SATURATION_OPTIMAL",
    hoursRequired: 8,
    relatedOrgan: "lungs",
  },
  {
    id: "carbonMonoxidePurged",
    displayName: "Carbon Monoxide Purged",
    systemName: "CO_PURGE_COMPLETE",
    hoursRequired: 48, // 2 days for full clearance
    relatedOrgan: "lungs",
  },
  {
    id: "bronchialRelaxation",
    displayName: "Bronchial Tubes Relaxing",
    systemName: "BRONCHIAL_TENSION_REDUCED",
    hoursRequired: 72, // 3 days
    relatedOrgan: "lungs",
  },
  {
    id: "ciliaRegeneration",
    displayName: "Cilia Regeneration Started",
    systemName: "CILIA_REGEN_ACTIVE",
    hoursRequired: 336, // 2 weeks
    relatedOrgan: "lungs",
  },
  {
    id: "mucusClearance",
    displayName: "Mucus Clearance Improved",
    systemName: "MUCOCILIARY_FUNCTION_RESTORED",
    hoursRequired: 720, // 1 month
    relatedOrgan: "lungs",
  },
  {
    id: "lungCapacityImproved",
    displayName: "Lung Capacity Improved",
    systemName: "PULMONARY_CAPACITY_RESTORED",
    hoursRequired: 2160, // 3 months
    relatedOrgan: "lungs",
  },
  {
    id: "lungInflammationReduced",
    displayName: "Lung Inflammation Reduced",
    systemName: "PULMONARY_INFLAMMATION_DOWN",
    hoursRequired: 6480, // 9 months
    relatedOrgan: "lungs",
  },

  // === BLOOD VESSELS ===
  {
    id: "nicotineCleared",
    displayName: "Nicotine Cleared",
    systemName: "NICOTINE_FLUSH_COMPLETE",
    hoursRequired: 72,
    relatedOrgan: "bloodVessels",
  },
  {
    id: "circulationImproving",
    displayName: "Circulation Improving",
    systemName: "VASCULAR_FLOW_IMPROVING",
    hoursRequired: 336, // 2 weeks
    relatedOrgan: "bloodVessels",
  },
  {
    id: "circulationRestored",
    displayName: "Circulation Restored",
    systemName: "VASCULAR_FLOW_OPTIMAL",
    hoursRequired: 2160, // 3 months
    relatedOrgan: "bloodVessels",
  },
];

// Helper functions
export function getMilestoneById(id: string): RecoveryMilestone | undefined {
  return MILESTONES.find((m) => m.id === id);
}

export function getMilestonesByOrgan(organ: OrganType): RecoveryMilestone[] {
  return MILESTONES.filter((m) => m.relatedOrgan === organ);
}

export function getSortedMilestones(): RecoveryMilestone[] {
  return [...MILESTONES].sort((a, b) => a.hoursRequired - b.hoursRequired);
}

export function isMilestoneAchieved(
  milestone: RecoveryMilestone,
  hoursSinceQuit: number,
): boolean {
  return hoursSinceQuit >= milestone.hoursRequired;
}

export function getMilestoneProgress(
  milestone: RecoveryMilestone,
  hoursSinceQuit: number,
): number {
  return Math.min(1.0, hoursSinceQuit / milestone.hoursRequired);
}

export function formatTimeRemaining(hoursRemaining: number): string | null {
  if (hoursRemaining <= 0) return null;

  if (hoursRemaining < 1) {
    const minutes = Math.round(hoursRemaining * 60);
    return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  } else if (hoursRemaining < 24) {
    const hours = Math.round(hoursRemaining);
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  } else if (hoursRemaining < 168) {
    const days = Math.round(hoursRemaining / 24);
    return `${days} day${days === 1 ? "" : "s"}`;
  } else if (hoursRemaining < 720) {
    const weeks = Math.round(hoursRemaining / 168);
    return `${weeks} week${weeks === 1 ? "" : "s"}`;
  } else {
    const months = Math.round(hoursRemaining / 720);
    return `${months} month${months === 1 ? "" : "s"}`;
  }
}
