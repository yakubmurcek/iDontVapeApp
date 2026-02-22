/**
 * Root Layout - App entry with providers
 */

import { Colors } from '@/constants/Colors'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SuperwallProvider } from 'expo-superwall'
import { StyleSheet, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import 'react-native-reanimated'

export default function RootLayout() {
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
