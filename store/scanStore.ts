/**
 * Scan Store - Daily diagnostic scan state and streak tracking
 */

import { asyncStorageAdapter } from '@/utils/asyncStorageAdapter'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface ScanMetrics {
  systemIntegrity: number
  lungRecovery: number
  heartRecovery: number
  oxygenEfficiency: number
  toxinClearance: number
  neuralReset: number
}

export interface ScanResult {
  deltas: ScanMetrics
  isFirstScan: boolean
  streak: number
}

interface ScanState {
  lastScanDate: string | null // YYYY-MM-DD
  lastScanMetrics: ScanMetrics | null
  scanStreak: number
  longestStreak: number

  // Actions
  performScan: (currentMetrics: ScanMetrics) => ScanResult
  resetScans: () => void

  // Computed
  hasScanAvailableToday: () => boolean
  getCheckinStatus: () => 'current' | 'at_risk' | 'broken'
}

function todayKey(): string {
  return new Date().toISOString().split('T')[0]
}

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA + 'T00:00:00')
  const b = new Date(dateB + 'T00:00:00')
  return Math.round(Math.abs(b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

export const useScanStore = create<ScanState>()(
  persist(
    (set, get) => ({
      lastScanDate: null,
      lastScanMetrics: null,
      scanStreak: 0,
      longestStreak: 0,

      performScan: (currentMetrics) => {
        const state = get()
        const today = todayKey()
        const isFirstScan = state.lastScanMetrics === null

        // Calculate deltas from last scan
        const deltas: ScanMetrics = isFirstScan
          ? {
              systemIntegrity: 0,
              lungRecovery: 0,
              heartRecovery: 0,
              oxygenEfficiency: 0,
              toxinClearance: 0,
              neuralReset: 0,
            }
          : {
              systemIntegrity:
                currentMetrics.systemIntegrity - state.lastScanMetrics!.systemIntegrity,
              lungRecovery: currentMetrics.lungRecovery - state.lastScanMetrics!.lungRecovery,
              heartRecovery: currentMetrics.heartRecovery - state.lastScanMetrics!.heartRecovery,
              oxygenEfficiency:
                currentMetrics.oxygenEfficiency - state.lastScanMetrics!.oxygenEfficiency,
              toxinClearance: currentMetrics.toxinClearance - state.lastScanMetrics!.toxinClearance,
              neuralReset: currentMetrics.neuralReset - state.lastScanMetrics!.neuralReset,
            }

        // Calculate streak
        let newStreak = 1
        if (state.lastScanDate) {
          const gap = daysBetween(state.lastScanDate, today)
          if (gap === 1) {
            // Consecutive day
            newStreak = state.scanStreak + 1
          } else if (gap === 0) {
            // Same day, keep streak
            newStreak = state.scanStreak
          }
          // gap > 1 means streak broken, reset to 1
        }

        const newLongest = Math.max(state.longestStreak, newStreak)

        set({
          lastScanDate: today,
          lastScanMetrics: currentMetrics,
          scanStreak: newStreak,
          longestStreak: newLongest,
        })

        return { deltas, isFirstScan, streak: newStreak }
      },

      resetScans: () => {
        set({
          lastScanDate: null,
          lastScanMetrics: null,
          scanStreak: 0,
        })
      },

      hasScanAvailableToday: () => {
        const lastDate = get().lastScanDate
        if (!lastDate) return true
        return lastDate !== todayKey()
      },

      getCheckinStatus: () => {
        const lastDate = get().lastScanDate
        if (!lastDate) return 'broken'

        const gap = daysBetween(lastDate, todayKey())
        if (gap === 0) return 'current'
        if (gap === 1) return 'at_risk'
        return 'broken'
      },
    }),
    {
      name: 'daily-scans',
      storage: createJSONStorage(() => asyncStorageAdapter),
    },
  ),
)
