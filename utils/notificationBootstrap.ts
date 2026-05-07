import {
  parseTimeString,
  requestPermissions,
  scheduleAllUpcomingMilestones,
  scheduleAnniversaryAlerts,
  scheduleDailyReminder,
  scheduleInactivityWarning,
  scheduleReactivationPush,
} from '@/utils/notifications'

interface NotificationBootstrapSettings {
  notificationsEnabled: boolean
  dailyReminderTime: string
  quitDate?: Date | null
}

export async function initializeNotificationBootstrap(
  settings: NotificationBootstrapSettings,
): Promise<void> {
  if (!settings.notificationsEnabled) return

  try {
    const granted = await requestPermissions()
    if (!granted) return

    await scheduleInactivityWarning()
    // Reactivation push rides on every bootstrap: cancelled + rescheduled on
    // each app open, so it only ever fires during a real 7-day absence.
    await scheduleReactivationPush()
    const { hour, minute } = parseTimeString(settings.dailyReminderTime)
    await scheduleDailyReminder(hour, minute)
    if (settings.quitDate) {
      await scheduleAllUpcomingMilestones(settings.quitDate)
      await scheduleAnniversaryAlerts(settings.quitDate)
    }
  } catch (error) {
    if (__DEV__) console.error('[notifications] bootstrap failed:', error)
  }
}
