/**
 * User Store - Main state for user profile and recovery tracking
 */

import { OrganType, MILESTONES, isMilestoneAchieved } from '@/constants/milestones'
import { asyncStorageAdapter } from '@/utils/asyncStorageAdapter'
import {
  calculateInitialDamage,
  calculateNeuralReset,
  calculateOrganRecovery,
  calculateOxygenEfficiency,
  calculateSystemIntegrity,
  calculateToxinClearance,
  formatTimeSinceQuit,
  getCurrentMilestoneProgress,
  MilestoneProgress,
} from '@/utils/recoveryCalculator'
import {
  scheduleAllUpcomingMilestones,
  scheduleDailyReminder,
  scheduleInactivityWarning,
  rescheduleAfterRelapse,
} from '@/utils/notifications'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface OnboardingData {
  vapingDurationMonths: number
  nicotineStrength: number
  puffsPerDay: number
}

interface UserState {
  // Profile data
  vapingDurationMonths: number
  nicotineStrength: number
  puffsPerDay: number
  quitDate: string | null // ISO string
  lastVapeDate: string | null // ISO string
  initialDamageScore: number
  hasCompletedOnboarding: boolean
  costPerPuff: number
  celebratedMilestoneIds: string[]

  // Actions
  completeOnboarding: (data: OnboardingData) => void
  recordRelapse: () => void
  resetProgress: () => void
  clearData: () => void
  markMilestoneCelebrated: (milestoneId: string) => void

  // Computed (called as functions since Zustand doesn't have native getters)
  getRecoveryStartDate: () => Date
  getTimeSinceQuit: () => number
  getHoursSinceQuit: () => number
  getDaysSinceQuit: () => number
  getMoneySaved: () => number
  getFormattedTimeSinceQuit: () => string
  getSystemIntegrity: () => number
  getOrganRecovery: (organ: OrganType) => number
  getLungRecovery: () => number
  getHeartRecovery: () => number
  getCurrentMilestone: () => MilestoneProgress
  getOxygenEfficiency: () => number
  getToxinClearance: () => number
  getNeuralReset: () => number
  getNewlyAchievedMilestones: () => typeof MILESTONES
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      vapingDurationMonths: 0,
      nicotineStrength: 20,
      puffsPerDay: 100,
      quitDate: null,
      lastVapeDate: null,
      initialDamageScore: 0.5,
      hasCompletedOnboarding: false,
      costPerPuff: 0.02, // Default ~$0.02 per puff
      celebratedMilestoneIds: [],

      // Actions
      completeOnboarding: (data: OnboardingData) => {
        const damageScore = calculateInitialDamage(
          data.vapingDurationMonths,
          data.nicotineStrength,
          data.puffsPerDay,
        )

        const quitDate = new Date()

        set({
          vapingDurationMonths: data.vapingDurationMonths,
          nicotineStrength: data.nicotineStrength,
          puffsPerDay: data.puffsPerDay,
          quitDate: quitDate.toISOString(),
          lastVapeDate: null,
          initialDamageScore: damageScore,
          hasCompletedOnboarding: true,
          celebratedMilestoneIds: [],
        })

        // Schedule notifications for all upcoming milestones
        scheduleAllUpcomingMilestones(quitDate).catch(() => {})
        scheduleDailyReminder().catch(() => {})
        scheduleInactivityWarning().catch(() => {})
      },

      recordRelapse: () => {
        const now = new Date()
        set({ lastVapeDate: now.toISOString(), celebratedMilestoneIds: [] })

        // Reschedule all notifications from the new start date
        rescheduleAfterRelapse(now).catch(() => {})
      },

      resetProgress: () => {
        const now = new Date()
        set({
          quitDate: now.toISOString(),
          lastVapeDate: null,
          celebratedMilestoneIds: [],
        })

        // Reschedule notifications
        rescheduleAfterRelapse(now).catch(() => {})
      },

      clearData: () => {
        set({
          vapingDurationMonths: 0,
          nicotineStrength: 20,
          puffsPerDay: 100,
          quitDate: null,
          lastVapeDate: null,
          initialDamageScore: 0.5,
          hasCompletedOnboarding: false,
          costPerPuff: 0.02,
          celebratedMilestoneIds: [],
        })
      },

      markMilestoneCelebrated: (milestoneId: string) => {
        const state = get()
        if (!state.celebratedMilestoneIds.includes(milestoneId)) {
          set({ celebratedMilestoneIds: [...state.celebratedMilestoneIds, milestoneId] })
        }
      },

      // Computed
      getRecoveryStartDate: () => {
        const state = get()
        const dateStr = state.lastVapeDate ?? state.quitDate
        return dateStr ? new Date(dateStr) : new Date()
      },

      getTimeSinceQuit: () => {
        const recoveryStart = get().getRecoveryStartDate()
        const ms = Date.now() - recoveryStart.getTime()
        return isNaN(ms) || ms < 0 ? 0 : ms
      },

      getHoursSinceQuit: () => {
        return get().getTimeSinceQuit() / (1000 * 60 * 60)
      },

      getDaysSinceQuit: () => {
        return Math.floor(get().getTimeSinceQuit() / (1000 * 60 * 60 * 24))
      },

      getMoneySaved: () => {
        const state = get()
        const puffsAvoided = state.getDaysSinceQuit() * state.puffsPerDay
        return puffsAvoided * state.costPerPuff
      },

      getFormattedTimeSinceQuit: () => {
        return formatTimeSinceQuit(get().getTimeSinceQuit())
      },

      getSystemIntegrity: () => {
        const state = get()
        return calculateSystemIntegrity(state.initialDamageScore, state.getHoursSinceQuit())
      },

      getOrganRecovery: (organ: OrganType) => {
        const state = get()
        return calculateOrganRecovery(organ, state.initialDamageScore, state.getHoursSinceQuit())
      },

      getLungRecovery: () => {
        return get().getOrganRecovery('lungs')
      },

      getHeartRecovery: () => {
        return get().getOrganRecovery('heart')
      },

      getCurrentMilestone: () => {
        return getCurrentMilestoneProgress(get().getHoursSinceQuit())
      },

      getOxygenEfficiency: () => {
        return calculateOxygenEfficiency(get().getHoursSinceQuit())
      },

      getToxinClearance: () => {
        return calculateToxinClearance(get().getHoursSinceQuit())
      },

      getNeuralReset: () => {
        return calculateNeuralReset(get().getHoursSinceQuit())
      },

      getNewlyAchievedMilestones: () => {
        const state = get()
        const hours = state.getHoursSinceQuit()
        return MILESTONES.filter(
          (m) => isMilestoneAchieved(m, hours) && !state.celebratedMilestoneIds.includes(m.id),
        )
      },
    }),
    {
      name: 'user-profile',
      storage: createJSONStorage(() => asyncStorageAdapter),
    },
  ),
)
