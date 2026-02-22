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
    description:
      'Your heart rate begins returning to normal as nicotine leaves your bloodstream. The constant stimulant pressure on your cardiac system is lifting.',
    hoursRequired: 0.33, // 20 minutes
    relatedOrgan: 'heart',
  },
  {
    id: 'bloodPressureNormalized',
    displayName: 'Blood Pressure Normalized',
    systemName: 'BP_STABILIZED',
    description:
      'Blood pressure stabilizes as your arteries relax. The toxic constriction that forced your heart to work overtime is easing.',
    hoursRequired: 2,
    relatedOrgan: 'heart',
  },
  {
    id: 'heartRateStabilized',
    displayName: 'Heart Rate Stabilized',
    systemName: 'CARDIAC_RHYTHM_STABLE',
    description:
      'Your resting heart rate has normalized. Your heart no longer races from the constant chemical assault of nicotine and propylene glycol.',
    hoursRequired: 24,
    relatedOrgan: 'heart',
  },
  {
    id: 'cardiacStressReduced',
    displayName: 'Cardiac Stress Reduced',
    systemName: 'CARDIAC_LOAD_REDUCED',
    description:
      'Inflammation around your heart muscle is dropping. The oxidative stress that was slowly damaging cardiac tissue is fading.',
    hoursRequired: 168, // 1 week
    relatedOrgan: 'heart',
  },
  {
    id: 'heartAttackRiskDecreased',
    displayName: 'Heart Attack Risk Decreased',
    systemName: 'CARDIAC_RISK_LOWERED',
    description:
      'Your risk of heart attack has significantly decreased. Arterial walls are healing and blood flow is approaching that of a non-vaper.',
    hoursRequired: 8760, // 1 year
    relatedOrgan: 'heart',
  },

  // === LUNGS - Takes longer to recover ===
  // Lung tissue heals more slowly than cardiovascular system
  {
    id: 'bloodOxygenNormalized',
    displayName: 'Blood Oxygen Normalized',
    systemName: 'O2_SATURATION_OPTIMAL',
    description:
      'Your blood oxygen levels are returning to normal. Cells throughout your body are receiving the oxygen they were starved of.',
    hoursRequired: 8,
    relatedOrgan: 'lungs',
  },
  {
    id: 'carbonMonoxidePurged',
    displayName: 'Carbon Monoxide Purged',
    systemName: 'CO_PURGE_COMPLETE',
    description:
      'Carbon monoxide has been fully eliminated from your blood. Your hemoglobin can carry oxygen again instead of poison.',
    hoursRequired: 48, // 2 days for full clearance
    relatedOrgan: 'lungs',
  },
  {
    id: 'bronchialRelaxation',
    displayName: 'Bronchial Tubes Relaxing',
    systemName: 'BRONCHIAL_TENSION_REDUCED',
    description:
      'Your bronchial tubes are relaxing and opening up. Breathing becomes easier as the chemical irritation subsides.',
    hoursRequired: 72, // 3 days
    relatedOrgan: 'lungs',
  },
  {
    id: 'ciliaRegeneration',
    displayName: 'Cilia Regeneration Started',
    systemName: 'CILIA_REGEN_ACTIVE',
    description:
      'The tiny hair-like structures in your lungs are regrowing. These cilia sweep out mucus and toxins - vaping destroyed them.',
    hoursRequired: 336, // 2 weeks
    relatedOrgan: 'lungs',
  },
  {
    id: 'mucusClearance',
    displayName: 'Mucus Clearance Improved',
    systemName: 'MUCOCILIARY_FUNCTION_RESTORED',
    description:
      'Your lungs can now effectively clear mucus and trapped particles. The persistent cough may fade as your airways heal.',
    hoursRequired: 720, // 1 month
    relatedOrgan: 'lungs',
  },
  {
    id: 'lungCapacityImproved',
    displayName: 'Lung Capacity Improved',
    systemName: 'PULMONARY_CAPACITY_RESTORED',
    description:
      'Significant improvement in lung capacity. Physical activities feel easier and you can take deeper, fuller breaths.',
    hoursRequired: 2160, // 3 months
    relatedOrgan: 'lungs',
  },
  {
    id: 'lungInflammationReduced',
    displayName: 'Lung Inflammation Reduced',
    systemName: 'PULMONARY_INFLAMMATION_DOWN',
    description:
      'Chronic lung inflammation has substantially decreased. The scarring and irritation from vaping aerosols is healing.',
    hoursRequired: 6480, // 9 months
    relatedOrgan: 'lungs',
  },

  // === BLOOD VESSELS ===
  {
    id: 'nicotineCleared',
    displayName: 'Nicotine Cleared',
    systemName: 'NICOTINE_FLUSH_COMPLETE',
    description:
      'Nicotine has been fully flushed from your system. Your brain is rewiring its dopamine pathways - withdrawal peaks now but fades fast.',
    hoursRequired: 72,
    relatedOrgan: 'bloodVessels',
  },
  {
    id: 'circulationImproving',
    displayName: 'Circulation Improving',
    systemName: 'VASCULAR_FLOW_IMPROVING',
    description:
      'Blood vessel walls are repairing. Endothelial function improves as nitric oxide production normalizes, meaning better blood flow everywhere.',
    hoursRequired: 336, // 2 weeks
    relatedOrgan: 'bloodVessels',
  },
  {
    id: 'circulationRestored',
    displayName: 'Circulation Restored',
    systemName: 'VASCULAR_FLOW_OPTIMAL',
    description:
      'Vascular function is approaching normal. The toxic sludge that was increasing permeability and clot risk has been cleared.',
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
