import { describe, expect, it, vi } from 'vitest'
import { performAppReset } from '../utils/appResetCore'

describe('performAppReset', () => {
  it('clears all persisted app state and cancels notifications', async () => {
    const clearUserData = vi.fn()
    const clearLogs = vi.fn()
    const clearScans = vi.fn()
    const resetSettings = vi.fn()
    const resetOnboarding = vi.fn()
    const cancelNotifications = vi.fn().mockResolvedValue(undefined)

    await performAppReset({
      clearUserData,
      clearLogs,
      clearScans,
      resetSettings,
      resetOnboarding,
      cancelNotifications,
    })

    expect(clearUserData).toHaveBeenCalledTimes(1)
    expect(clearLogs).toHaveBeenCalledTimes(1)
    expect(clearScans).toHaveBeenCalledTimes(1)
    expect(resetSettings).toHaveBeenCalledTimes(1)
    expect(resetOnboarding).toHaveBeenCalledTimes(1)
    expect(cancelNotifications).toHaveBeenCalledTimes(1)
  })
})
