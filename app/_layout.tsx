/**
 * Root Layout - App entry with providers
 */

import { Colors } from '@/constants/Colors'
import { useSettingsStore } from '@/store/settingsStore'
import {
  requestPermissions,
  scheduleDailyReminder,
  scheduleInactivityWarning,
  parseTimeString,
} from '@/utils/notifications'
import * as Notifications from 'expo-notifications'
import { Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SuperwallProvider } from 'expo-superwall'
import { useEffect, useRef } from 'react'
import { StyleSheet, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import 'react-native-reanimated'

export default function RootLayout() {
  const router = useRouter()
  const responseListener = useRef<Notifications.EventSubscription | null>(null)

  useEffect(() => {
    // Initialize notifications if user already granted permission
    const settings = useSettingsStore.getState()
    if (settings.notificationsEnabled && !settings.pushToken) {
      requestPermissions().then((token) => {
        if (token) {
          useSettingsStore.getState().setPushToken(token)
        }
      })
    }

    // Reschedule inactivity warning on each app open
    if (settings.notificationsEnabled) {
      scheduleInactivityWarning()
      const { hour, minute } = parseTimeString(settings.dailyReminderTime)
      scheduleDailyReminder(hour, minute)
    }

    // Handle notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data
      if (data?.type === 'milestone' || data?.screen === 'scan') {
        router.push('/(main)')
      }
    })

    return () => {
      responseListener.current?.remove()
    }
  }, [router])

  return (
    <SuperwallProvider apiKeys={{ ios: process.env.EXPO_PUBLIC_SUPERWALL_IOS_KEY ?? '' }}>
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
    </SuperwallProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.spaceCharcoal,
  },
})
