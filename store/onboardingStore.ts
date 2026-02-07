import { create } from 'zustand'

interface OnboardingState {
  vapingDurationMonths: number
  nicotineStrength: number
  puffsPerDay: number
  setVapingDurationMonths: (months: number) => void
  setNicotineStrength: (strength: number) => void
  setPuffsPerDay: (puffs: number) => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
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
}))
