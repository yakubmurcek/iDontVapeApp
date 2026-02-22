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
      'Vaping floods your lungs with heated aerosol containing ultrafine particles, heavy metals, and volatile organic compounds. These toxins cause inflammation deep in the bronchial tubes, destroy the cilia that sweep out debris, and leave scarring that reduces capacity. Chronic exposure leads to bronchitis, impaired gas exchange, and increased risk of EVALI - a potentially fatal lung injury.',
    recoveryDescription:
      'Your lungs are remarkable at self-repair. Within days, bronchial tubes relax and breathing improves. Over weeks, cilia regrow and begin clearing accumulated mucus. Within months, lung capacity measurably increases and inflammation subsides. Full recovery of damaged tissue takes 9-12 months.',
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
      'Nicotine forces your heart into overdrive - elevating heart rate, constricting blood vessels, and spiking blood pressure with every puff. This constant stimulant assault causes chronic inflammation of heart muscle tissue, accelerates atherosclerosis, and dramatically increases the risk of heart attack and stroke even in young vapers.',
    recoveryDescription:
      'Your cardiovascular system responds quickly to quitting. Heart rate and blood pressure begin normalizing within hours. Within a week, cardiac stress markers drop significantly. Over months, arterial inflammation resolves and blood vessel function improves toward normal.',
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
      'Vaping devastates your vascular system at the cellular level. Nicotine and oxidative chemicals damage the endothelium - the thin protective lining of every blood vessel. This impairs nitric oxide production, increases vessel permeability, promotes blood clot formation, and starves tissues of adequate blood flow throughout your entire body.',
    recoveryDescription:
      'Once nicotine is fully flushed from your system (about 72 hours), your blood vessels begin healing. Endothelial function improves within weeks as nitric oxide production normalizes. Over 2-3 months, circulation is substantially restored and clot risk drops toward baseline.',
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
