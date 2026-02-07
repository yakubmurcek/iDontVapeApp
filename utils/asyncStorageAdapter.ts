/**
 * Shared AsyncStorage adapter for Zustand persist middleware
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { StateStorage } from 'zustand/middleware'

export const asyncStorageAdapter: StateStorage = {
  setItem: async (name, value) => {
    await AsyncStorage.setItem(name, value)
  },
  getItem: async (name) => {
    return await AsyncStorage.getItem(name)
  },
  removeItem: async (name) => {
    await AsyncStorage.removeItem(name)
  },
}
