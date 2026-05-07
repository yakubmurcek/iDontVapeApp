import { useLogsStore } from '@/store/logsStore'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useScanStore } from '@/store/scanStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUserStore } from '@/store/userStore'
import { performAppReset } from '@/utils/appResetCore'
import { cancelAllNotifications } from '@/utils/notifications'

export { performAppReset } from '@/utils/appResetCore'
export type { AppResetDependencies } from '@/utils/appResetCore'

export async function resetAppData(): Promise<void> {
  await performAppReset({
    clearUserData: useUserStore.getState().clearData,
    clearLogs: useLogsStore.getState().clearLogs,
    clearScans: useScanStore.getState().resetScans,
    resetSettings: useSettingsStore.getState().resetSettings,
    resetOnboarding: useOnboardingStore.getState().reset,
    cancelNotifications: cancelAllNotifications,
  })
}
