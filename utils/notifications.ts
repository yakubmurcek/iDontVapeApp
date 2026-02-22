/**
 * Notification Service - Scheduling and managing push notifications
 */

import { RecoveryMilestone, MILESTONES, isMilestoneAchieved } from '@/constants/milestones'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

// Configure notification handler for foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

/**
 * Request notification permissions and return the push token
 */
export async function requestPermissions(): Promise<string | null> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    return null
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Bio-Twin Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00F0FF',
    })
  }

  const tokenData = await Notifications.getExpoPushTokenAsync()
  return tokenData.data
}

/**
 * Schedule a notification for when a milestone will be reached
 */
export async function scheduleMilestoneAlert(
  milestone: RecoveryMilestone,
  quitDate: Date,
): Promise<string | null> {
  const targetTime = new Date(quitDate.getTime() + milestone.hoursRequired * 3600000)

  // Don't schedule if already in the past
  if (targetTime.getTime() <= Date.now()) return null

  const secondsUntil = Math.max(1, Math.floor((targetTime.getTime() - Date.now()) / 1000))

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `SYSTEM ALERT: ${milestone.systemName}`,
      body: `${milestone.displayName} complete. Tap to view repair sequence.`,
      data: { type: 'milestone', milestoneId: milestone.id },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: secondsUntil,
    },
  })

  return id
}

/**
 * Schedule notifications for all upcoming milestones
 */
export async function scheduleAllUpcomingMilestones(quitDate: Date): Promise<void> {
  const hoursSinceQuit = (Date.now() - quitDate.getTime()) / 3600000

  for (const milestone of MILESTONES) {
    if (!isMilestoneAchieved(milestone, hoursSinceQuit)) {
      await scheduleMilestoneAlert(milestone, quitDate)
    }
  }
}

/**
 * Schedule a daily check-in reminder
 */
export async function scheduleDailyReminder(hour: number = 9, minute: number = 0): Promise<void> {
  // Cancel existing daily reminders first
  await cancelNotificationsByType('dailyReminder')

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'SYSTEM DIAGNOSTIC READY',
      body: 'Run your daily Bio-Twin scan to track recovery progress.',
      data: { type: 'dailyReminder', screen: 'scan' },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  })
}

/**
 * Schedule an inactivity warning (48 hours from now)
 */
export async function scheduleInactivityWarning(): Promise<void> {
  // Cancel existing inactivity warnings
  await cancelNotificationsByType('inactivity')

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'WARNING: System integrity declining',
      body: 'Your Bio-Twin needs monitoring. Run a diagnostic.',
      data: { type: 'inactivity', screen: 'scan' },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 48 * 3600, // 48 hours
    },
  })
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync()
}

/**
 * Cancel notifications matching a specific type
 */
async function cancelNotificationsByType(type: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  for (const notification of scheduled) {
    if (notification.content.data?.type === type) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier)
    }
  }
}

/**
 * Reschedule all notifications after a relapse
 */
export async function rescheduleAfterRelapse(newStartDate: Date): Promise<void> {
  await cancelAllNotifications()
  await scheduleAllUpcomingMilestones(newStartDate)
  await scheduleDailyReminder()
  await scheduleInactivityWarning()
}

/**
 * Parse a time string (HH:MM) into hour and minute
 */
export function parseTimeString(time: string): { hour: number; minute: number } {
  const [hour, minute] = time.split(':').map(Number)
  return { hour: hour || 9, minute: minute || 0 }
}
