/**
 * Recovery Milestones with medical timelines
 * Based on real health recovery data for vaping cessation
 */

export type OrganType = 'lungs' | 'heart' | 'bloodVessels'

export interface RecoveryMilestone {
  id: string
  displayName: string
  systemName: string
  description: string
  hoursRequired: number
  relatedOrgan: OrganType
}

export const MILESTONES: RecoveryMilestone[] = [
  // === HEART - Recovers relatively quickly ===
  // Heart rate and blood pressure respond almost immediately
  {
    id: 'heartRateDrops',
    displayName: 'Heart Rate Drops',
    systemName: 'CARDIAC_RATE_NORMALIZING',
    description: 'Nicotine is leaving your blood, so your heart does not need to work as hard.',
    hoursRequired: 0.33, // 20 minutes
    relatedOrgan: 'heart',
  },
  {
    id: 'bloodPressureNormalized',
    displayName: 'Blood Pressure Settles',
    systemName: 'BP_STABILIZED',
    description:
      'Your blood vessels start to relax, and your blood pressure moves toward a healthier range.',
    hoursRequired: 2,
    relatedOrgan: 'heart',
  },
  {
    id: 'heartRateStabilized',
    displayName: 'Heart Rate Stable',
    systemName: 'CARDIAC_RHYTHM_STABLE',
    description: 'Your resting heartbeat is becoming steadier without constant nicotine hits.',
    hoursRequired: 24,
    relatedOrgan: 'heart',
  },
  {
    id: 'cardiacStressReduced',
    displayName: 'Heart Strain Reduced',
    systemName: 'CARDIAC_LOAD_REDUCED',
    description:
      'Daily strain on your heart is dropping, and your heart muscle is under less pressure.',
    hoursRequired: 168, // 1 week
    relatedOrgan: 'heart',
  },
  {
    id: 'heartAttackRiskDecreased',
    displayName: 'Heart Risk Lowered',
    systemName: 'CARDIAC_RISK_LOWERED',
    description:
      'As your blood flow improves, your long-term risk of heart attack keeps going down.',
    hoursRequired: 8760, // 1 year
    relatedOrgan: 'heart',
  },

  // === LUNGS - Takes longer to recover ===
  // Lung tissue heals more slowly than cardiovascular system
  {
    id: 'bloodOxygenNormalized',
    displayName: 'Oxygen Levels Up',
    systemName: 'O2_SATURATION_OPTIMAL',
    description: 'More oxygen reaches your body, helping your cells make energy more efficiently.',
    hoursRequired: 8,
    relatedOrgan: 'lungs',
  },
  {
    id: 'carbonMonoxidePurged',
    displayName: 'CO Cleared',
    systemName: 'CO_PURGE_COMPLETE',
    description:
      'Most carbon monoxide is gone from your blood, so oxygen can move through your body better.',
    hoursRequired: 48, // 2 days for full clearance
    relatedOrgan: 'lungs',
  },
  {
    id: 'bronchialRelaxation',
    displayName: 'Airways Relaxing',
    systemName: 'BRONCHIAL_TENSION_REDUCED',
    description: 'Your airways are less tight and irritated, so breathing starts to feel easier.',
    hoursRequired: 72, // 3 days
    relatedOrgan: 'lungs',
  },
  {
    id: 'ciliaRegeneration',
    displayName: 'Lung Filters Rebuild',
    systemName: 'CILIA_REGEN_ACTIVE',
    description:
      'Tiny filters in your lungs are growing back and starting to clear mucus and trapped particles.',
    hoursRequired: 336, // 2 weeks
    relatedOrgan: 'lungs',
  },
  {
    id: 'mucusClearance',
    displayName: 'Mucus Clearing Better',
    systemName: 'MUCOCILIARY_FUNCTION_RESTORED',
    description:
      'Your lungs clear buildup more effectively, so coughing and chest heaviness may start to ease.',
    hoursRequired: 720, // 1 month
    relatedOrgan: 'lungs',
  },
  {
    id: 'lungCapacityImproved',
    displayName: 'Lung Capacity Up',
    systemName: 'PULMONARY_CAPACITY_RESTORED',
    description:
      'Your lungs can use more air, so activity may feel easier and breaths feel deeper.',
    hoursRequired: 2160, // 3 months
    relatedOrgan: 'lungs',
  },
  {
    id: 'lungInflammationReduced',
    displayName: 'Lung Irritation Down',
    systemName: 'PULMONARY_INFLAMMATION_DOWN',
    description:
      'Long-term irritation in your lungs is going down as damaged tissue keeps healing.',
    hoursRequired: 6480, // 9 months
    relatedOrgan: 'lungs',
  },

  // === BLOOD VESSELS ===
  {
    id: 'nicotineCleared',
    displayName: 'Nicotine Cleared',
    systemName: 'NICOTINE_FLUSH_COMPLETE',
    description:
      'Nicotine is out of your system, and strong withdrawal symptoms usually start easing after this point.',
    hoursRequired: 72,
    relatedOrgan: 'bloodVessels',
  },
  {
    id: 'circulationImproving',
    displayName: 'Circulation Improving',
    systemName: 'VASCULAR_FLOW_IMPROVING',
    description:
      'Your blood vessels are repairing, which helps blood move more smoothly through your body.',
    hoursRequired: 336, // 2 weeks
    relatedOrgan: 'bloodVessels',
  },
  {
    id: 'circulationRestored',
    displayName: 'Circulation Restored',
    systemName: 'VASCULAR_FLOW_OPTIMAL',
    description:
      'Your circulation is close to normal, supporting better energy, healing, and overall function.',
    hoursRequired: 2160, // 3 months
    relatedOrgan: 'bloodVessels',
  },
]

// Helper functions
export function getMilestoneById(id: string): RecoveryMilestone | undefined {
  return MILESTONES.find((m) => m.id === id)
}

export function getMilestonesByOrgan(organ: OrganType): RecoveryMilestone[] {
  return MILESTONES.filter((m) => m.relatedOrgan === organ)
}

export function getSortedMilestones(): RecoveryMilestone[] {
  return [...MILESTONES].sort((a, b) => a.hoursRequired - b.hoursRequired)
}

export function isMilestoneAchieved(milestone: RecoveryMilestone, hoursSinceQuit: number): boolean {
  return hoursSinceQuit >= milestone.hoursRequired
}

export function getMilestoneProgress(milestone: RecoveryMilestone, hoursSinceQuit: number): number {
  return Math.min(1.0, hoursSinceQuit / milestone.hoursRequired)
}

export function formatTimeRemaining(hoursRemaining: number): string | null {
  if (hoursRemaining <= 0) return null

  if (hoursRemaining < 1) {
    const minutes = Math.round(hoursRemaining * 60)
    return `${minutes} minute${minutes === 1 ? '' : 's'}`
  } else if (hoursRemaining < 24) {
    const hours = Math.round(hoursRemaining)
    return `${hours} hour${hours === 1 ? '' : 's'}`
  } else if (hoursRemaining < 168) {
    const days = Math.round(hoursRemaining / 24)
    return `${days} day${days === 1 ? '' : 's'}`
  } else if (hoursRemaining < 720) {
    const weeks = Math.round(hoursRemaining / 168)
    return `${weeks} week${weeks === 1 ? '' : 's'}`
  } else {
    const months = Math.round(hoursRemaining / 720)
    return `${months} month${months === 1 ? '' : 's'}`
  }
}
