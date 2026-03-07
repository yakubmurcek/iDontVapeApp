/**
 * Index - Entry point that redirects based on onboarding status
 */

import { Colors } from '@/constants/Colors'
import { useUserStore } from '@/store/userStore'
import { Redirect } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

export default function Index() {
  const [isHydrated, setIsHydrated] = useState(false)
  const hasCompletedOnboarding = useUserStore((state) => state.hasCompletedOnboarding)

  useEffect(() => {
    // If already hydrated before effect runs
    if (useUserStore.persist.hasHydrated()) {
      setIsHydrated(true)
      return
    }

    // Otherwise wait for hydration to finish
    const unsubscribe = useUserStore.persist.onFinishHydration(() => {
      setIsHydrated(true)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size="large"
          color={Colors.neonCyan}
        />
      </View>
    )
  }

  // Redirect based on onboarding status
  if (hasCompletedOnboarding) {
    return <Redirect href="/(main)" />
  }

  return <Redirect href="/onboarding" />
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.spaceCharcoal,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
