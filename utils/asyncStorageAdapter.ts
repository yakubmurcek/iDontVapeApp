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
      console.warn(`Error setting async storage for key ${name}:`, e)
    }
  },
  getItem: async (name) => {
    try {
      return await AsyncStorage.getItem(name)
    } catch (e) {
      console.warn(`Error getting async storage for key ${name}:`, e)
      return null
    }
  },
  removeItem: async (name) => {
    try {
      await AsyncStorage.removeItem(name)
    } catch (e) {
      console.warn(`Error removing async storage for key ${name}:`, e)
    }
  },
}
