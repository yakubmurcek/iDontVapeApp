export interface AppResetDependencies {
  clearUserData: () => void
  clearLogs: () => void
  clearScans: () => void
  resetSettings: () => void
  resetOnboarding: () => void
  cancelNotifications: () => Promise<void>
}

export async function performAppReset({
  clearUserData,
  clearLogs,
  clearScans,
  resetSettings,
  resetOnboarding,
  cancelNotifications,
}: AppResetDependencies): Promise<void> {
  clearUserData()
  clearLogs()
  clearScans()
  resetSettings()
  resetOnboarding()
  await cancelNotifications()
}
