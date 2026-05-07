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
 * Request notification permissions for local scheduling
 */
export async function requestPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    return false
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Bio-Twin Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00F0FF',
    })
  }

  return true
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

  // Use DATE trigger so long-horizon alerts (e.g. 1 week, 3 months) fire at the
  // correct wall-clock time even if the device sleeps or reboots between now
  // and then. TIME_INTERVAL drifts while the device is asleep.
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `SYSTEM ALERT: ${milestone.systemName}`,
      body: `${milestone.displayName} reached. Tap to view repair sequence.`,
      data: { type: 'milestone', milestoneId: milestone.id },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: targetTime,
    },
  })

  return id
}

/**
 * Schedule notifications for all upcoming milestones. Skips milestones that already
 * have a pending notification so repeat bootstraps (onboarding, toggle-on, relaunch)
 * don't stack duplicate alerts.
 */
export async function scheduleAllUpcomingMilestones(quitDate: Date): Promise<void> {
  const hoursSinceQuit = (Date.now() - quitDate.getTime()) / 3600000
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  const alreadyScheduled = new Set(
    scheduled
      .filter((n) => n.content.data?.type === 'milestone')
      .map((n) => n.content.data?.milestoneId as string | undefined)
      .filter((id): id is string => typeof id === 'string'),
  )

  for (const milestone of MILESTONES) {
    if (alreadyScheduled.has(milestone.id)) continue
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
      body: 'Run your daily Bio-Twin scan to track healing progress.',
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
      title: 'WARNING: Check-in missed',
      body: 'Your Bio-Twin needs a fresh scan. Run a diagnostic.',
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
 * Schedule a streak-at-risk alert for 8pm local *tomorrow*. The intent is to
 * catch the user before midnight when their streak would otherwise break — a
 * Duolingo-style loss-aversion push that measurably rescues streaks.
 *
 * Call this after every successful scan; it cancels any prior at-risk alert
 * first so we don't fire stale copy with the wrong streak count.
 */
export async function scheduleStreakAtRiskAlert(streakCount: number): Promise<void> {
  await cancelNotificationsByType('streakAtRisk')

  // Only bother once there's something to lose. A 0- or 1-day streak isn't
  // emotionally loaded enough for loss aversion to work.
  if (streakCount < 2) return

  const tomorrow8pm = new Date()
  tomorrow8pm.setDate(tomorrow8pm.getDate() + 1)
  tomorrow8pm.setHours(20, 0, 0, 0)

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Your ${streakCount}-day streak is about to end`,
      body: 'Scan now to keep it alive. Takes 10 seconds.',
      data: { type: 'streakAtRisk', screen: 'scan', streak: streakCount },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: tomorrow8pm,
    },
  })
}

/**
 * Schedule anniversary notifications at 30, 90, and 365 days. These are
 * high-emotion conversion moments — the milestone push lands, then the
 * dashboard can gate a celebratory paywall placement.
 */
export async function scheduleAnniversaryAlerts(quitDate: Date): Promise<void> {
  await cancelNotificationsByType('anniversary')

  const anniversaries = [
    {
      days: 30,
      title: '30 days clean',
      body: 'One month. Your body and brain are visibly different.',
    },
    {
      days: 90,
      title: '90 days clean',
      body: 'Three months. Most people never make it here — you did.',
    },
    { days: 365, title: 'One year clean', body: 'A full year. This is who you are now.' },
  ]

  for (const a of anniversaries) {
    const fireAt = new Date(quitDate.getTime() + a.days * 24 * 3600 * 1000)
    if (fireAt.getTime() <= Date.now()) continue

    await Notifications.scheduleNotificationAsync({
      content: {
        title: a.title,
        body: a.body,
        data: { type: 'anniversary', days: a.days, screen: 'index' },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireAt,
      },
    })
  }
}

/**
 * Schedule a reactivation push for users who stop opening the app. Fires 7
 * days after the last app session with an empathetic nudge. Cancel + reschedule
 * on every app open so it only ever fires during a real absence.
 */
export async function scheduleReactivationPush(): Promise<void> {
  await cancelNotificationsByType('reactivation')

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Still here with you',
      body: 'Whatever the last week looked like, today can be day 1. One tap to check in.',
      data: { type: 'reactivation', screen: 'index' },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 7 * 24 * 3600,
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
  await scheduleAnniversaryAlerts(newStartDate)
  await scheduleDailyReminder()
  await scheduleInactivityWarning()
  // Don't re-arm streak-at-risk: the streak is 0 after relapse, so there's
  // nothing at risk yet. It'll be rescheduled naturally on the next scan.
}

/**
 * Parse a time string (HH:MM) into hour and minute.
 * Falls back to 09:00 for malformed input — "00:00" correctly yields 0, not 9.
 */
export function parseTimeString(time: string): { hour: number; minute: number } {
  const [h, m] = time.split(':').map(Number)
  const hour = Number.isFinite(h) && h >= 0 && h <= 23 ? h : 9
  const minute = Number.isFinite(m) && m >= 0 && m <= 59 ? m : 0
  return { hour, minute }
}
