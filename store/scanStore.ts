/**
 * Scan Store - Daily diagnostic scan state and streak tracking
 */

import { asyncStorageAdapter } from '@/utils/asyncStorageAdapter'
import {
  clampFutureDateKey,
  computeStreakWithFreeze,
  hasScanAvailableToday,
  localDateKey,
} from '@/utils/streak'
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
  freezeConsumed: boolean
}

const ZERO_DELTAS: ScanMetrics = {
  systemIntegrity: 0,
  lungRecovery: 0,
  heartRecovery: 0,
  oxygenEfficiency: 0,
  toxinClearance: 0,
  neuralReset: 0,
}

interface ScanState {
  lastScanAt: number | null // ms since epoch
  lastScanLocalDate: string | null // YYYY-MM-DD (local)
  lastScanMetrics: ScanMetrics | null
  scanStreak: number
  streakFreezes: number

  // Actions
  resetScans: () => void
  performScan: (currentMetrics: ScanMetrics) => ScanResult
  grantStreakFreeze: (count?: number) => void

  // Computed
  hasScanAvailableToday: () => boolean
}

export const useScanStore = create<ScanState>()(
  persist(
    (set, get) => ({
      lastScanAt: null,
      lastScanLocalDate: null,
      lastScanMetrics: null,
      scanStreak: 0,
      streakFreezes: 0,

      performScan: (currentMetrics) => {
        const state = get()
        const now = Date.now()
        const todayLocal = localDateKey(new Date(now))
        const previousMetrics = state.lastScanMetrics

        // If a scan has already been performed today, don't mutate state — just return
        // the previous result so repeated calls are idempotent. `isFirstScan` is false
        // here: if lastScanAt is set, we've scanned before; if it's null (e.g. legacy
        // persisted state without lastScanMetrics), the guard wouldn't be true anyway.
        if (!hasScanAvailableToday(state.lastScanLocalDate, new Date(now), state.lastScanAt)) {
          return {
            deltas: ZERO_DELTAS,
            isFirstScan: state.lastScanAt === null,
            streak: state.scanStreak,
            freezeConsumed: false,
          }
        }

        const isFirstScan = !previousMetrics

        // Calculate deltas from last scan (guard against undefined from legacy persisted state)
        const deltas: ScanMetrics = previousMetrics
          ? {
              systemIntegrity: currentMetrics.systemIntegrity - previousMetrics.systemIntegrity,
              lungRecovery: currentMetrics.lungRecovery - previousMetrics.lungRecovery,
              heartRecovery: currentMetrics.heartRecovery - previousMetrics.heartRecovery,
              oxygenEfficiency: currentMetrics.oxygenEfficiency - previousMetrics.oxygenEfficiency,
              toxinClearance: currentMetrics.toxinClearance - previousMetrics.toxinClearance,
              neuralReset: currentMetrics.neuralReset - previousMetrics.neuralReset,
            }
          : ZERO_DELTAS

        // Freeze-aware streak. A single freeze covers a 1-day miss; larger gaps
        // still reset to keep the mechanic predictable.
        const { streak: newStreak, freezeConsumed } = computeStreakWithFreeze(
          state.lastScanLocalDate,
          state.scanStreak,
          todayLocal,
          state.streakFreezes,
        )

        set({
          lastScanAt: now,
          lastScanLocalDate: todayLocal,
          lastScanMetrics: currentMetrics,
          scanStreak: newStreak,
          streakFreezes: freezeConsumed
            ? Math.max(0, state.streakFreezes - 1)
            : state.streakFreezes,
        })

        return { deltas, isFirstScan, streak: newStreak, freezeConsumed }
      },

      resetScans: () => {
        // Freezes are a premium entitlement — preserve across relapses so users
        // don't feel punished for restarting the timer.
        set({
          lastScanAt: null,
          lastScanLocalDate: null,
          lastScanMetrics: null,
          scanStreak: 0,
        })
      },

      grantStreakFreeze: (count = 1) => {
        const current = get().streakFreezes
        // Cap at 3 to match the UX framing ("up to 3 freezes"). Prevents abuse
        // from paywall spam granting unbounded freezes.
        set({ streakFreezes: Math.min(3, current + count) })
      },

      hasScanAvailableToday: () => {
        const { lastScanLocalDate, lastScanAt } = get()
        return hasScanAvailableToday(lastScanLocalDate, new Date(), lastScanAt)
      },
    }),
    {
      name: 'daily-scans',
      version: 2,
      migrate: (persisted, version) => {
        if (!persisted || typeof persisted !== 'object') return persisted as ScanState

        if (version === 0) {
          const state = persisted as ScanState & { lastScanDate?: string | null }
          const rawLastScanDate = state.lastScanDate ?? null
          const lastScanDate = rawLastScanDate ? clampFutureDateKey(rawLastScanDate) : null
          const lastScanAt = lastScanDate ? new Date(`${lastScanDate}T00:00:00`).getTime() : null

          return {
            ...state,
            lastScanAt,
            lastScanLocalDate: lastScanDate,
            streakFreezes: 0,
          }
        }

        // v1 → v2: add freezes field. Existing streak/scan state is preserved.
        if (version === 1) {
          const state = persisted as ScanState
          return { ...state, streakFreezes: state.streakFreezes ?? 0 }
        }

        return persisted as ScanState
      },
      storage: createJSONStorage(() => asyncStorageAdapter),
    },
  ),
)
