/**
 * Settings Store - User preferences for notifications and app behavior
 */

import { asyncStorageAdapter } from '@/utils/asyncStorageAdapter'
import { localDateKey } from '@/utils/streak'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface SettingsState {
  notificationsEnabled: boolean
  dailyReminderTime: string // HH:MM format, default "09:00"
  lastPaywallDate: string | null // ISO date string (date only)

  // Actions
  setNotificationsEnabled: (enabled: boolean) => void
  setDailyReminderTime: (time: string) => void
  recordPaywallShown: () => void
  canShowPaywallToday: () => boolean
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      notificationsEnabled: false,
      dailyReminderTime: '09:00',
      lastPaywallDate: null,

      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setDailyReminderTime: (time) => set({ dailyReminderTime: time }),

      recordPaywallShown: () => {
        set({ lastPaywallDate: localDateKey(new Date()) })
      },

      canShowPaywallToday: () => {
        const lastDate = get().lastPaywallDate
        if (!lastDate) return true
        return lastDate !== localDateKey(new Date())
      },

      resetSettings: () => {
        set({
          notificationsEnabled: false,
          dailyReminderTime: '09:00',
          lastPaywallDate: null,
        })
      },
    }),
    {
      name: 'app-settings',
      storage: createJSONStorage(() => asyncStorageAdapter),
    },
  ),
)
