/**
 * Logs Store - Tracks vaping logs and recovery events
 */

import * as ExpoCrypto from 'expo-crypto'
import { asyncStorageAdapter } from '@/utils/asyncStorageAdapter'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type LogEntryType = 'dailyCheckIn' | 'cravingResisted' | 'cravingLost' | 'relapse'

/**
 * Craving triggers. Kept as a static enum (not free-text) so we can compute
 * trend patterns on the dashboard without needing NLP.
 */
export type CravingTrigger =
  | 'stress'
  | 'afterMeal'
  | 'social'
  | 'boredom'
  | 'alcohol'
  | 'routine'
  | 'emotional'
  | 'other'

export const CRAVING_TRIGGERS: { id: CravingTrigger; label: string }[] = [
  { id: 'stress', label: 'Stress' },
  { id: 'afterMeal', label: 'After meal' },
  { id: 'social', label: 'Social' },
  { id: 'boredom', label: 'Boredom' },
  { id: 'alcohol', label: 'Alcohol' },
  { id: 'routine', label: 'Habit loop' },
  { id: 'emotional', label: 'Emotional' },
  { id: 'other', label: 'Other' },
]

/**
 * HALT check — brief self-assessment capturing the user's state at the moment
 * of a craving (Hungry / Angry / Lonely / Tired). Multi-select.
 */
export type HaltState = 'hungry' | 'angry' | 'lonely' | 'tired'

export const HALT_OPTIONS: { id: HaltState; label: string }[] = [
  { id: 'hungry', label: 'Hungry' },
  { id: 'angry', label: 'Angry' },
  { id: 'lonely', label: 'Lonely' },
  { id: 'tired', label: 'Tired' },
]

export interface VapingLog {
  id: string
  timestamp: string // ISO string
  entryType: LogEntryType
  note?: string
  cravingIntensity?: number // 1-10
  trigger?: CravingTrigger
  halt?: HaltState[]
}

interface LogsState {
  logs: VapingLog[]

  // Actions
  addLog: (
    type: LogEntryType,
    options?: {
      note?: string
      cravingIntensity?: number
      trigger?: CravingTrigger
      halt?: HaltState[]
    },
  ) => void
  clearLogs: () => void

  // Computed
  getCravingsResisted: () => number
  getCravingsLost: () => number
  getRelapseCount: () => number
  getRecentTriggers: (days?: number) => Partial<Record<CravingTrigger, number>>
  getMostRecentLog: (type: LogEntryType) => VapingLog | undefined
}

function generateId(): string {
  return ExpoCrypto.randomUUID()
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
          trigger: options.trigger,
          halt: options.halt,
        }

        set((state) => ({
          logs: [log, ...state.logs],
        }))
      },

      clearLogs: () => {
        set({ logs: [] })
      },

      getCravingsResisted: () => {
        return get().logs.filter((log) => log.entryType === 'cravingResisted').length
      },

      getCravingsLost: () => {
        return get().logs.filter((log) => log.entryType === 'cravingLost').length
      },

      getRelapseCount: () => {
        return get().logs.filter((log) => log.entryType === 'relapse').length
      },

      /**
       * Tally triggers over the last `days` days (default 30). Returns a sparse
       * record — only triggers seen appear. Dashboard uses this to surface the
       * user's top trigger; insights util groups it with time-of-day analysis.
       */
      getRecentTriggers: (days = 30) => {
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
        const counts: Partial<Record<CravingTrigger, number>> = {}
        for (const log of get().logs) {
          if (!log.trigger) continue
          if (new Date(log.timestamp).getTime() < cutoff) continue
          counts[log.trigger] = (counts[log.trigger] ?? 0) + 1
        }
        return counts
      },

      getMostRecentLog: (type) => {
        return get().logs.find((log) => log.entryType === type)
      },
    }),
    {
      name: 'vaping-logs',
      storage: createJSONStorage(() => asyncStorageAdapter),
    },
  ),
)

export function getLogTitle(type: LogEntryType): string {
  switch (type) {
    case 'dailyCheckIn':
      return 'Daily Check-in'
    case 'cravingResisted':
      return 'Craving Resisted'
    case 'cravingLost':
      return 'Craving — Slipped'
    case 'relapse':
      return 'Setback Logged'
  }
}
