/**
 * Root Layout - App entry with providers
 */

import { Colors } from '@/constants/Colors'
import { useSettingsStore } from '@/store/settingsStore'
import { useUserStore } from '@/store/userStore'
import { initializeNotificationBootstrap } from '@/utils/notificationBootstrap'
import { cancelAllNotifications } from '@/utils/notifications'
import * as Notifications from 'expo-notifications'
import { Href, Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SuperwallProvider } from 'expo-superwall'
import { useEffect, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'

const IOS_SUPERWALL_KEY = process.env.EXPO_PUBLIC_SUPERWALL_IOS_KEY ?? ''
const ANDROID_SUPERWALL_KEY = process.env.EXPO_PUBLIC_SUPERWALL_ANDROID_KEY ?? ''

if (!IOS_SUPERWALL_KEY && __DEV__) {
  console.warn('[superwall] EXPO_PUBLIC_SUPERWALL_IOS_KEY is not set — paywalls will not display')
}

export default function RootLayout() {
  const router = useRouter()
  const responseListener = useRef<Notifications.EventSubscription | null>(null)

  useEffect(() => {
    // Use lastVapeDate (post-relapse recovery start) when present, otherwise the
    // original quitDate. Matches userStore.getRecoveryStartDate, so milestones
    // scheduled after a relapse correctly anchor to the new recovery clock.
    const readQuitDate = (): Date | null => {
      const { lastVapeDate, quitDate } = useUserStore.getState()
      const iso = lastVapeDate ?? quitDate
      return iso ? new Date(iso) : null
    }

    const settings = useSettingsStore.getState()
    initializeNotificationBootstrap({
      notificationsEnabled: settings.notificationsEnabled,
      dailyReminderTime: settings.dailyReminderTime,
      quitDate: readQuitDate(),
    }).catch(() => {})

    // Re-bootstrap when the user toggles notifications on; cancel everything when they toggle off.
    const unsubscribe = useSettingsStore.subscribe((state, prev) => {
      const turnedOn = state.notificationsEnabled && !prev.notificationsEnabled
      const turnedOff = !state.notificationsEnabled && prev.notificationsEnabled
      const timeChanged =
        state.notificationsEnabled && state.dailyReminderTime !== prev.dailyReminderTime

      if (turnedOff) {
        cancelAllNotifications().catch(() => {})
      } else if (turnedOn || timeChanged) {
        initializeNotificationBootstrap({
          notificationsEnabled: state.notificationsEnabled,
          dailyReminderTime: state.dailyReminderTime,
          quitDate: readQuitDate(),
        }).catch(() => {})
      }
    })

    // Handle notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as
        | { type?: string; screen?: string }
        | undefined
      if (data?.type === 'inactivity' || data?.screen === 'scan') {
        router.push('/(main)/scan' as Href)
      } else if (data?.type === 'milestone' || data?.type === 'dailyReminder') {
        router.push('/(main)' as Href)
      }
    })

    return () => {
      responseListener.current?.remove()
      unsubscribe()
    }
  }, [router])

  return (
    <SuperwallProvider apiKeys={{ ios: IOS_SUPERWALL_KEY, android: ANDROID_SUPERWALL_KEY }}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.container}>
          <View style={styles.container}>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: Colors.spaceCharcoal },
                animation: 'fade',
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="(main)" />
            </Stack>
          </View>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </SuperwallProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.spaceCharcoal,
  },
})
