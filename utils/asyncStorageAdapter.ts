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
      if (__DEV__) {
        const message = e instanceof Error ? e.message : String(e)
        console.error('[AsyncStorage] setItem failed:', message)
      }
    }
  },
  getItem: async (name) => {
    try {
      return await AsyncStorage.getItem(name)
    } catch (e) {
      if (__DEV__) {
        const message = e instanceof Error ? e.message : String(e)
        console.error('[AsyncStorage] getItem failed:', message)
      }
      return null
    }
  },
  removeItem: async (name) => {
    try {
      await AsyncStorage.removeItem(name)
    } catch (e) {
      if (__DEV__) {
        const message = e instanceof Error ? e.message : String(e)
        console.error('[AsyncStorage] removeItem failed:', message)
      }
    }
  },
}
