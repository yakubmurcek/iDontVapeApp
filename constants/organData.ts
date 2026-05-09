/**
 * Organ Data - Rich content for organ deep-dive screens
 */

import { OrganType } from './milestones'

export interface OrganInfo {
  id: OrganType
  name: string
  systemName: string
  damageTitle: string
  damageDescription: string
  recoveryDescription: string
  facts: string[]
}

export const ORGAN_DATA: Record<OrganType, OrganInfo> = {
  lungs: {
    id: 'lungs',
    name: 'Lungs',
    systemName: 'PULMONARY SYSTEM',
    damageTitle: 'PULMONARY DAMAGE REPORT',
    damageDescription:
      'Every vape session can make breathing harder than it should be. Hot chemical aerosol inflames your airways and damages the tiny filters your lungs need. When you stop, damage can slow and healing can begin with each day.',
    recoveryDescription:
      'Your lungs start recovering sooner than most people expect. Within days, airway irritation eases, and within weeks, tiny filters begin regrowing. Keep going, and breathing strength can keep improving over the coming months.',
    facts: [
      'Vape aerosol contains up to 2,000 chemicals including formaldehyde and acrolein',
      'Cilia take 2-4 weeks to begin regrowing after you stop',
      'Lung capacity can improve by 30% within 3 months of quitting',
      'EVALI cases have been linked to both THC and nicotine vaping',
      'Your lungs process about 10,000 liters of air every day',
    ],
  },
  heart: {
    id: 'heart',
    name: 'Heart',
    systemName: 'CARDIAC SYSTEM',
    damageTitle: 'CARDIAC DAMAGE REPORT',
    damageDescription:
      'Each puff overworks your heart and raises blood pressure fast. Nicotine spikes heart rate and tightens vessels, but quitting removes that daily strain.',
    recoveryDescription:
      'Heart recovery starts within hours after you stop vaping. Heart rate and pressure begin settling, and steady quit time moves function toward normal.',
    facts: [
      'Nicotine raises heart rate by 10-20 bpm immediately after use',
      'Young vapers have 2x higher risk of heart attack than non-vapers',
      'Blood pressure begins normalizing within 2 hours of your last puff',
      'Chronic vaping causes the same arterial stiffening seen in decades-long smokers',
      'Your heart beats about 100,000 times per day',
    ],
  },
  bloodVessels: {
    id: 'bloodVessels',
    name: 'Blood Vessels',
    systemName: 'VASCULAR SYSTEM',
    damageTitle: 'VASCULAR DAMAGE REPORT',
    damageDescription:
      'Vaping can choke off smooth blood flow before you even feel symptoms. Nicotine and chemicals injure the vessel lining that controls flow, pressure, and clotting. Once you stop, your vessels can start stabilizing and protecting circulation again.',
    recoveryDescription:
      'Your blood vessels begin to rebound after nicotine clears your system. In the next weeks, vessel function improves and blood flow becomes more efficient. Keep quitting momentum, and circulation can keep improving over the next months.',
    facts: [
      'Nicotine is fully cleared from your bloodstream within 72 hours',
      'Your body has roughly 60,000 miles of blood vessels',
      'Vaping reduces nitric oxide by up to 30%, constricting vessels throughout your body',
      'Endothelial damage from vaping is measurable after just one session',
      'Improved circulation means better wound healing, clearer skin, and more energy',
    ],
  },
}

export function getOrganData(id: OrganType): OrganInfo {
  return ORGAN_DATA[id]
}
