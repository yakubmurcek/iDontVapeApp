import { beforeEach, describe, expect, it, vi } from 'vitest'

const requestPermissions = vi.fn()
const scheduleDailyReminder = vi.fn()
const scheduleInactivityWarning = vi.fn()
const scheduleAllUpcomingMilestones = vi.fn()
const scheduleAnniversaryAlerts = vi.fn()
const scheduleReactivationPush = vi.fn()
const parseTimeString = vi.fn()

vi.mock('@/utils/notifications', () => ({
  requestPermissions,
  scheduleDailyReminder,
  scheduleInactivityWarning,
  scheduleAllUpcomingMilestones,
  scheduleAnniversaryAlerts,
  scheduleReactivationPush,
  parseTimeString,
}))

describe('initializeNotificationBootstrap', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  it('does nothing when notifications are disabled', async () => {
    const { initializeNotificationBootstrap } = await import('../utils/notificationBootstrap')

    await initializeNotificationBootstrap({
      notificationsEnabled: false,
      dailyReminderTime: '09:00',
    })

    expect(requestPermissions).not.toHaveBeenCalled()
    expect(scheduleInactivityWarning).not.toHaveBeenCalled()
    expect(scheduleDailyReminder).not.toHaveBeenCalled()
  })

  it('schedules local notifications after permissions are granted', async () => {
    requestPermissions.mockResolvedValue(true)
    parseTimeString.mockReturnValue({ hour: 7, minute: 30 })

    const { initializeNotificationBootstrap } = await import('../utils/notificationBootstrap')

    await initializeNotificationBootstrap({
      notificationsEnabled: true,
      dailyReminderTime: '07:30',
    })

    expect(requestPermissions).toHaveBeenCalledTimes(1)
    expect(scheduleInactivityWarning).toHaveBeenCalledTimes(1)
    expect(parseTimeString).toHaveBeenCalledWith('07:30')
    expect(scheduleDailyReminder).toHaveBeenCalledWith(7, 30)
  })

  it('swallows bootstrap failures', async () => {
    requestPermissions.mockRejectedValue(new Error('offline'))

    const { initializeNotificationBootstrap } = await import('../utils/notificationBootstrap')

    await expect(
      initializeNotificationBootstrap({
        notificationsEnabled: true,
        dailyReminderTime: '09:00',
      }),
    ).resolves.toBeUndefined()
  })
})
