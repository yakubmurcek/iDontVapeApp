/**
 * Logs Store - Tracks vaping logs and recovery events
 */

import * as ExpoCrypto from 'expo-crypto'
import { asyncStorageAdapter } from '@/utils/asyncStorageAdapter'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { LogEntryType, getLogIcon, getLogTitle } from '@/store/logHelpers'

export type { LogEntryType }
export { getLogIcon, getLogTitle }

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
  return ExpoCrypto.randomUUID()
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
