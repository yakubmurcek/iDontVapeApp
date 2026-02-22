/**
 * Shared AsyncStorage adapter for Zustand persist middleware
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { StateStorage } from 'zustand/middleware'

export const asyncStorageAdapter: StateStorage = {
  setItem: async (name, value) => {
    try {
      await AsyncStorage.setItem(name, value)
    } catch (e) {
      if (__DEV__) console.error('[AsyncStorage] setItem failed:', e)
    }
  },
  getItem: async (name) => {
    try {
      return await AsyncStorage.getItem(name)
    } catch (e) {
      if (__DEV__) console.error('[AsyncStorage] getItem failed:', e)
      return null
    }
  },
  removeItem: async (name) => {
    try {
      await AsyncStorage.removeItem(name)
    } catch (e) {
      if (__DEV__) console.error('[AsyncStorage] removeItem failed:', e)
    }
  },
}
