/**
 * ProgressDots - Step indicator for onboarding
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { Colors } from '@/constants/Colors'

interface ProgressDotsProps {
  totalSteps: number
  currentStep: number
}

export function ProgressDots({ totalSteps, currentStep }: ProgressDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <Dot
          key={index}
          isActive={index <= currentStep}
          isCurrent={index === currentStep}
        />
      ))}
    </View>
  )
}

interface DotProps {
  isActive: boolean
  isCurrent: boolean
}

function Dot({ isActive, isCurrent }: DotProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    width: withSpring(isCurrent ? 32 : 12, { damping: 15 }),
    backgroundColor: withSpring(isActive ? Colors.neonCyan : 'rgba(255, 255, 255, 0.2)', {
      damping: 15,
    }),
  }))

  return <Animated.View style={[styles.dot, animatedStyle]} />
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
})
