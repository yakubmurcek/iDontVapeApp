/**
 * BioTwinScene - Main container for the Bio-Twin visualization
 * Organs are touchable to navigate to deep-dive screens
 */

import { OrganType } from '@/constants/milestones'
import React from 'react'
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import { BloodVessels } from './BloodVessels'
import { Heart } from './Heart'
import { Lungs } from './Lungs'

interface BioTwinSceneProps {
  recoveryProgress: number // 0-1
  height?: number
  onOrganPress?: (organ: OrganType) => void
}

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export function BioTwinScene({ recoveryProgress, height = 350, onOrganPress }: BioTwinSceneProps) {
  // Slow rotation animation
  const rotation = useSharedValue(0)

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 30000, easing: Easing.linear }),
      -1,
      false,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${rotation.value * 0.05}deg` }, // Very subtle rotation
    ],
  }))

  return (
    <TouchableOpacity
      style={[styles.container, { height }]}
      onPress={() => onOrganPress?.('lungs')}
      activeOpacity={0.9}
    >
      <Animated.View style={[styles.scene, rotationStyle]}>
        {/* Blood vessels in the background */}
        <TouchableOpacity
          style={styles.bloodVesselsContainer}
          onPress={() => onOrganPress?.('bloodVessels')}
          activeOpacity={0.7}
        >
          <BloodVessels
            recoveryProgress={recoveryProgress}
            width={SCREEN_WIDTH * 0.92}
            height={height * 0.98}
          />
        </TouchableOpacity>

        {/* Lungs positioned behind/around heart */}
        <TouchableOpacity
          style={styles.lungsContainer}
          onPress={() => onOrganPress?.('lungs')}
          activeOpacity={0.7}
        >
          <Lungs
            recoveryProgress={recoveryProgress}
            width={SCREEN_WIDTH * 0.8}
            height={height * 0.69}
          />
        </TouchableOpacity>

        {/* Heart in the center-front */}
        <TouchableOpacity
          style={styles.heartContainer}
          onPress={() => onOrganPress?.('heart')}
          activeOpacity={0.7}
        >
          <Heart
            recoveryProgress={recoveryProgress}
            width={92}
            height={92}
          />
        </TouchableOpacity>
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  scene: {
    position: 'relative',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloodVesselsContainer: {
    position: 'absolute',
    top: '5%',
    alignItems: 'center',
    opacity: 0.6,
  },
  lungsContainer: {
    position: 'absolute',
    top: '10%',
    alignItems: 'center',
  },
  heartContainer: {
    position: 'absolute',
    top: '30%',
    alignItems: 'center',
  },
})
