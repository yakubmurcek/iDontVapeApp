/**
 * Logs Store - Tracks vaping logs and recovery events
 */

import { asyncStorageAdapter } from '@/utils/asyncStorageAdapter'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type LogEntryType =
  | 'dailyCheckIn'
  | 'milestoneAchieved'
  | 'cravingResisted'
  | 'relapse'
  | 'appOpened'

export interface VapingLog {
  id: string
  timestamp: string // ISO string
  entryType: LogEntryType
  note?: string
  cravingIntensity?: number // 1-10
  milestoneId?: string
}

interface LogsState {
  logs: VapingLog[]

  // Actions
  addLog: (
    type: LogEntryType,
    options?: {
      note?: string
      cravingIntensity?: number
      milestoneId?: string
    },
  ) => void
  clearLogs: () => void

  // Computed
  getLogsByDate: () => Map<string, VapingLog[]>
  getCravingsResisted: () => number
  getRecentLogs: (count: number) => VapingLog[]
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

function dateKey(date: Date): string {
  return date.toISOString().split('T')[0]
}

export const useLogsStore = create<LogsState>()(
  persist(
    (set, get) => ({
      logs: [],

      addLog: (type, options = {}) => {
        const log: VapingLog = {
          id: generateId(),
          timestamp: new Date().toISOString(),
          entryType: type,
          note: options.note,
          cravingIntensity: options.cravingIntensity,
          milestoneId: options.milestoneId,
        }

        set((state) => ({
          logs: [log, ...state.logs],
        }))
      },

      clearLogs: () => {
        set({ logs: [] })
      },

      getLogsByDate: () => {
        const logs = get().logs
        const grouped = new Map<string, VapingLog[]>()

        for (const log of logs) {
          const key = dateKey(new Date(log.timestamp))
          const existing = grouped.get(key) || []
          grouped.set(key, [...existing, log])
        }

        return grouped
      },

      getCravingsResisted: () => {
        return get().logs.filter((log) => log.entryType === 'cravingResisted').length
      },

      getRecentLogs: (count: number) => {
        return get().logs.slice(0, count)
      },
    }),
    {
      name: 'vaping-logs',
      storage: createJSONStorage(() => asyncStorageAdapter),
    },
  ),
)

// Helper function for display
export function getLogIcon(type: LogEntryType): string {
  switch (type) {
    case 'dailyCheckIn':
      return 'check-circle'
    case 'milestoneAchieved':
      return 'star'
    case 'cravingResisted':
      return 'hand'
    case 'relapse':
      return 'alert-triangle'
    case 'appOpened':
      return 'eye'
  }
}

export function getLogTitle(type: LogEntryType, milestoneId?: string): string {
  switch (type) {
    case 'dailyCheckIn':
      return 'Daily Check-in'
    case 'milestoneAchieved':
      return milestoneId ? 'Milestone Achieved' : 'Milestone Achieved'
    case 'cravingResisted':
      return 'Craving Resisted'
    case 'relapse':
      return 'Setback Logged'
    case 'appOpened':
      return 'Session Started'
  }
}
