/**
 * User Store - Main state for user profile and recovery tracking
 */

import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  calculateInitialDamage, 
  calculateSystemIntegrity,
  getCurrentMilestoneProgress,
  formatTimeSinceQuit,
  MilestoneProgress,
} from '@/utils/recoveryCalculator';

// AsyncStorage adapter
const asyncStorageAdapter: StateStorage = {
  setItem: async (name, value) => {
    await AsyncStorage.setItem(name, value);
  },
  getItem: async (name) => {
    return await AsyncStorage.getItem(name);
  },
  removeItem: async (name) => {
    await AsyncStorage.removeItem(name);
  },
};

export interface OnboardingData {
  vapingDurationMonths: number;
  nicotineStrength: number;
  puffsPerDay: number;
}

interface UserState {
  // Profile data
  vapingDurationMonths: number;
  nicotineStrength: number;
  puffsPerDay: number;
  quitDate: string | null; // ISO string
  lastVapeDate: string | null; // ISO string
  initialDamageScore: number;
  hasCompletedOnboarding: boolean;
  costPerPuff: number;
  
  // Actions
  completeOnboarding: (data: OnboardingData) => void;
  recordRelapse: () => void;
  resetProgress: () => void;
  
  // Computed (called as functions since Zustand doesn't have native getters)
  getRecoveryStartDate: () => Date;
  getTimeSinceQuit: () => number;
  getHoursSinceQuit: () => number;
  getDaysSinceQuit: () => number;
  getMoneySaved: () => number;
  getFormattedTimeSinceQuit: () => string;
  getSystemIntegrity: () => number;
  getCurrentMilestone: () => MilestoneProgress;
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
      
      // Actions
      completeOnboarding: (data: OnboardingData) => {
        const damageScore = calculateInitialDamage(
          data.vapingDurationMonths,
          data.nicotineStrength,
          data.puffsPerDay
        );
        
        set({
          vapingDurationMonths: data.vapingDurationMonths,
          nicotineStrength: data.nicotineStrength,
          puffsPerDay: data.puffsPerDay,
          quitDate: new Date().toISOString(),
          lastVapeDate: null,
          initialDamageScore: damageScore,
          hasCompletedOnboarding: true,
        });
      },
      
      recordRelapse: () => {
        set({ lastVapeDate: new Date().toISOString() });
      },
      
      resetProgress: () => {
        set({
          quitDate: new Date().toISOString(),
          lastVapeDate: null,
        });
      },
      
      // Computed
      getRecoveryStartDate: () => {
        const state = get();
        const dateStr = state.lastVapeDate ?? state.quitDate;
        return dateStr ? new Date(dateStr) : new Date();
      },
      
      getTimeSinceQuit: () => {
        const recoveryStart = get().getRecoveryStartDate();
        return Date.now() - recoveryStart.getTime();
      },
      
      getHoursSinceQuit: () => {
        return get().getTimeSinceQuit() / (1000 * 60 * 60);
      },
      
      getDaysSinceQuit: () => {
        return Math.floor(get().getTimeSinceQuit() / (1000 * 60 * 60 * 24));
      },
      
      getMoneySaved: () => {
        const state = get();
        const puffsAvoided = state.getDaysSinceQuit() * state.puffsPerDay;
        return puffsAvoided * state.costPerPuff;
      },
      
      getFormattedTimeSinceQuit: () => {
        return formatTimeSinceQuit(get().getTimeSinceQuit());
      },
      
      getSystemIntegrity: () => {
        const state = get();
        return calculateSystemIntegrity(
          state.initialDamageScore,
          state.getHoursSinceQuit()
        );
      },
      
      getCurrentMilestone: () => {
        return getCurrentMilestoneProgress(get().getHoursSinceQuit());
      },
    }),
    {
      name: 'user-profile',
      storage: createJSONStorage(() => asyncStorageAdapter),
    }
  )
);
