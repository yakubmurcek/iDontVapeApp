/**
 * Onboarding Index - Redirects to first step
 */

import { Colors } from '@/constants/Colors'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

export default function OnboardingIndex() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/onboarding/welcome')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <View style={styles.container}>
      <ActivityIndicator
        size="large"
        color={Colors.neonCyan}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.spaceCharcoal,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
