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
import { calculateMoneySaved } from '@/utils/money'
import { rescheduleAfterRelapse } from '@/utils/notifications'
import { initializeNotificationBootstrap } from '@/utils/notificationBootstrap'
import { useScanStore } from '@/store/scanStore'
import { useSettingsStore } from '@/store/settingsStore'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface OnboardingData {
  vapingDurationMonths: number
  nicotineStrength: number
  puffsPerDay: number
}

/**
 * User-chosen goal for the money saved by not vaping. Makes the raw dollar
 * number on the dashboard concrete ("40% of a new bike") — converts better
 * than an abstract currency amount.
 */
export interface QuitFundGoal {
  label: string
  amountCents: number
}

/**
 * Optional context captured during the relapse compassion flow. Persisted on
 * the user (most-recent only) so follow-up UI can reference it; the full
 * history lives in logsStore as `relapse` entries with the same fields.
 */
export interface RelapseContext {
  trigger?: string
  journal?: string
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
  quitFundGoal: QuitFundGoal | null
  lastRelapseContext: RelapseContext | null

  // Actions
  completeOnboarding: (data: OnboardingData) => void
  recordRelapse: (context?: RelapseContext) => void
  resetProgress: () => void
  clearData: () => void
  markMilestoneCelebrated: (milestoneId: string) => void
  setQuitFundGoal: (goal: QuitFundGoal | null) => void

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
      quitFundGoal: null,
      lastRelapseContext: null,

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

        // Defer scheduling to bootstrap so it honors the user's notification setting
        // and requests permissions first. No-op when notifications are disabled.
        const settings = useSettingsStore.getState()
        initializeNotificationBootstrap({
          notificationsEnabled: settings.notificationsEnabled,
          dailyReminderTime: settings.dailyReminderTime,
          quitDate,
        }).catch(() => {})
      },

      recordRelapse: (context) => {
        const now = new Date()
        set({
          lastVapeDate: now.toISOString(),
          celebratedMilestoneIds: [],
          lastRelapseContext: context ?? null,
        })

        // The next scan anchors a new baseline against the reset recovery clock.
        // Without this, the first post-relapse scan would be blocked (same local
        // date as pre-relapse scan) and deltas would be stale.
        useScanStore.getState().resetScans()

        // Only reschedule if the user has notifications on.
        if (useSettingsStore.getState().notificationsEnabled) {
          rescheduleAfterRelapse(now).catch(() => {})
        }
      },

      resetProgress: () => {
        const now = new Date()
        set({
          quitDate: now.toISOString(),
          lastVapeDate: null,
          celebratedMilestoneIds: [],
        })

        useScanStore.getState().resetScans()

        if (useSettingsStore.getState().notificationsEnabled) {
          rescheduleAfterRelapse(now).catch(() => {})
        }
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
          quitFundGoal: null,
          lastRelapseContext: null,
        })
      },

      markMilestoneCelebrated: (milestoneId: string) => {
        const state = get()
        if (!state.celebratedMilestoneIds.includes(milestoneId)) {
          set({ celebratedMilestoneIds: [...state.celebratedMilestoneIds, milestoneId] })
        }
      },

      setQuitFundGoal: (goal) => {
        set({ quitFundGoal: goal })
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
        return calculateMoneySaved(state.getTimeSinceQuit(), state.puffsPerDay, state.costPerPuff)
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
        ).sort((a, b) => a.hoursRequired - b.hoursRequired)
      },
    }),
    {
      name: 'user-profile',
      storage: createJSONStorage(() => asyncStorageAdapter),
    },
  ),
)
