/**
 * Settings Store - User preferences for notifications and app behavior
 */

import { asyncStorageAdapter } from '@/utils/asyncStorageAdapter'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface SettingsState {
  notificationsEnabled: boolean
  hasRequestedPermission: boolean
  dailyReminderTime: string // HH:MM format, default "09:00"
  pushToken: string | null
  soundEnabled: boolean
  lastPaywallDate: string | null // ISO date string (date only)

  // Actions
  setNotificationsEnabled: (enabled: boolean) => void
  setHasRequestedPermission: (requested: boolean) => void
  setDailyReminderTime: (time: string) => void
  setPushToken: (token: string | null) => void
  setSoundEnabled: (enabled: boolean) => void
  recordPaywallShown: () => void
  canShowPaywallToday: () => boolean
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      notificationsEnabled: false,
      hasRequestedPermission: false,
      dailyReminderTime: '09:00',
      pushToken: null,
      soundEnabled: true,
      lastPaywallDate: null,

      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setHasRequestedPermission: (requested) => set({ hasRequestedPermission: requested }),
      setDailyReminderTime: (time) => set({ dailyReminderTime: time }),
      setPushToken: (token) => set({ pushToken: token }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),

      recordPaywallShown: () => {
        set({ lastPaywallDate: new Date().toISOString().split('T')[0] })
      },

      canShowPaywallToday: () => {
        const lastDate = get().lastPaywallDate
        if (!lastDate) return true
        const today = new Date().toISOString().split('T')[0]
        return lastDate !== today
      },
    }),
    {
      name: 'app-settings',
      storage: createJSONStorage(() => asyncStorageAdapter),
    },
  ),
)
