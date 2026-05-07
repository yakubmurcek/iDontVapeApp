import { asyncStorageAdapter } from '@/utils/asyncStorageAdapter'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface OnboardingState {
  vapingDurationMonths: number
  nicotineStrength: number
  puffsPerDay: number
  setVapingDurationMonths: (months: number) => void
  setNicotineStrength: (strength: number) => void
  setPuffsPerDay: (puffs: number) => void
  reset: () => void
}

// Persist this store so a mid-flow app kill (after duration/nicotine but before
// calibration) doesn't wipe the user's selections. Cleared when onboarding
// finishes via `reset()`, called from completeOnboarding in userStore.
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      vapingDurationMonths: 12, // Default value
      nicotineStrength: 20, // Default value
      puffsPerDay: 100, // Default value

      setVapingDurationMonths: (months) => set({ vapingDurationMonths: months }),
      setNicotineStrength: (strength) => set({ nicotineStrength: strength }),
      setPuffsPerDay: (puffs) => set({ puffsPerDay: puffs }),

      reset: () =>
        set({
          vapingDurationMonths: 12,
          nicotineStrength: 20,
          puffsPerDay: 100,
        }),
    }),
    {
      name: 'onboarding-draft',
      storage: createJSONStorage(() => asyncStorageAdapter),
    },
  ),
)
