/**
 * Recovery Milestones with medical timelines
 * Based on real health recovery data for vaping cessation
 */

export type OrganType = 'lungs' | 'heart' | 'bloodVessels';

export interface RecoveryMilestone {
  id: string;
  displayName: string;
  systemName: string;
  hoursRequired: number;
  relatedOrgan: OrganType;
}

export const MILESTONES: RecoveryMilestone[] = [
  {
    id: 'bloodOxygenNormalized',
    displayName: 'Blood Oxygen Normalized',
    systemName: 'O2_SATURATION_OPTIMAL',
    hoursRequired: 8,
    relatedOrgan: 'lungs',
  },
  {
    id: 'carbonMonoxidePurged',
    displayName: 'Carbon Monoxide Purged',
    systemName: 'CO_PURGE_COMPLETE',
    hoursRequired: 24,
    relatedOrgan: 'lungs',
  },
  {
    id: 'heartRateNormalized',
    displayName: 'Heart Rate Stabilized',
    systemName: 'CARDIAC_RHYTHM_STABLE',
    hoursRequired: 48,
    relatedOrgan: 'heart',
  },
  {
    id: 'nicotineCleared',
    displayName: 'Nicotine Cleared',
    systemName: 'NICOTINE_FLUSH_COMPLETE',
    hoursRequired: 72,
    relatedOrgan: 'bloodVessels',
  },
  {
    id: 'ciliaRegeneration',
    displayName: 'Cilia Regeneration',
    systemName: 'CILIA_REGEN_ACTIVE',
    hoursRequired: 336, // 2 weeks
    relatedOrgan: 'lungs',
  },
  {
    id: 'lungCapacityImproved',
    displayName: 'Lung Capacity Improved',
    systemName: 'PULMONARY_CAPACITY_RESTORED',
    hoursRequired: 720, // 1 month
    relatedOrgan: 'lungs',
  },
  {
    id: 'circulationRestored',
    displayName: 'Circulation Restored',
    systemName: 'VASCULAR_FLOW_OPTIMAL',
    hoursRequired: 2160, // 3 months
    relatedOrgan: 'bloodVessels',
  },
];

// Helper functions
export function getMilestoneById(id: string): RecoveryMilestone | undefined {
  return MILESTONES.find(m => m.id === id);
}

export function getMilestonesByOrgan(organ: OrganType): RecoveryMilestone[] {
  return MILESTONES.filter(m => m.relatedOrgan === organ);
}

export function getSortedMilestones(): RecoveryMilestone[] {
  return [...MILESTONES].sort((a, b) => a.hoursRequired - b.hoursRequired);
}

export function isMilestoneAchieved(milestone: RecoveryMilestone, hoursSinceQuit: number): boolean {
  return hoursSinceQuit >= milestone.hoursRequired;
}

export function getMilestoneProgress(milestone: RecoveryMilestone, hoursSinceQuit: number): number {
  return Math.min(1.0, hoursSinceQuit / milestone.hoursRequired);
}

export function formatTimeRemaining(hoursRemaining: number): string | null {
  if (hoursRemaining <= 0) return null;
  
  if (hoursRemaining < 1) {
    const minutes = Math.round(hoursRemaining * 60);
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  } else if (hoursRemaining < 24) {
    const hours = Math.round(hoursRemaining);
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  } else if (hoursRemaining < 168) {
    const days = Math.round(hoursRemaining / 24);
    return `${days} day${days === 1 ? '' : 's'}`;
  } else if (hoursRemaining < 720) {
    const weeks = Math.round(hoursRemaining / 168);
    return `${weeks} week${weeks === 1 ? '' : 's'}`;
  } else {
    const months = Math.round(hoursRemaining / 720);
    return `${months} month${months === 1 ? '' : 's'}`;
  }
}
