/**
 * SliderInput - Styled slider for onboarding inputs
 */

import { Colors } from '@/constants/Colors'
import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const SLIDER_WIDTH = SCREEN_WIDTH - 80
const THUMB_SIZE = 28

type ScaleType = 'linear' | 'logarithmic'

interface SliderInputProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  formatValue?: (value: number) => string
  label?: string
  /** Scale type: 'linear' (default) or 'logarithmic' (spreads out smaller values) */
  customValueToPosition?: (value: number, min: number, max: number) => number
  customPositionToValue?: (position: number, min: number, max: number) => number
  scale?: ScaleType
}

// Power factor for non-linear scaling (0.5 = square root, gentler than log)
const SCALE_POWER = 0.5

// Convert value to slider position (0-1) based on scale
const valueToPosition = (
  value: number,
  min: number,
  max: number,
  scale: ScaleType,
  customScaler?: (value: number, min: number, max: number) => number,
): number => {
  if (customScaler) {
    return customScaler(value, min, max)
  }
  if (scale === 'logarithmic') {
    // Use power scale (square root) - gentler than pure logarithmic
    // This gives more space to smaller values without being too extreme
    const normalized = (value - min) / (max - min)
    return Math.pow(normalized, SCALE_POWER)
  }
  // Linear scale
  return (value - min) / (max - min)
}

// Convert slider position (0-1) to value based on scale
const positionToValue = (
  position: number,
  min: number,
  max: number,
  scale: ScaleType,
  customScaler?: (position: number, min: number, max: number) => number,
): number => {
  if (customScaler) {
    return customScaler(position, min, max)
  }
  if (scale === 'logarithmic') {
    // Inverse of power scale (square root)
    const normalized = Math.pow(position, 1 / SCALE_POWER)
    return min + normalized * (max - min)
  }
  // Linear scale
  return min + position * (max - min)
}

export function SliderInput({
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue,
  label,
  scale = 'linear',
  customValueToPosition,
  customPositionToValue,
}: SliderInputProps) {
  const progress = valueToPosition(value, min, max, scale, customValueToPosition)
  const translateX = useSharedValue(progress * (SLIDER_WIDTH - THUMB_SIZE))
  const startX = useSharedValue(0)

  React.useEffect(() => {
    const newProgress = valueToPosition(value, min, max, scale, customValueToPosition)
    translateX.value = withSpring(newProgress * (SLIDER_WIDTH - THUMB_SIZE), {
      damping: 20,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, min, max, scale, customValueToPosition])

  const updateValue = (x: number) => {
    const clampedX = Math.max(0, Math.min(x, SLIDER_WIDTH - THUMB_SIZE))
    const position = clampedX / (SLIDER_WIDTH - THUMB_SIZE)
    const rawValue = positionToValue(position, min, max, scale, customPositionToValue)

    // If customPositionToValue is used, we assume it handles stepping/snapping internally if needed
    // Otherwise we apply the generic step
    let finalValue = rawValue
    if (!customPositionToValue) {
      const steppedValue = Math.round(rawValue / step) * step
      finalValue = Math.max(min, Math.min(max, steppedValue))
    }

    onChange(finalValue)
  }

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value
    })
    .onUpdate((event) => {
      const newX = startX.value + event.translationX
      translateX.value = Math.max(0, Math.min(newX, SLIDER_WIDTH - THUMB_SIZE))
      runOnJS(updateValue)(translateX.value)
    })

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  const fillStyle = useAnimatedStyle(() => ({
    width: translateX.value + THUMB_SIZE / 2,
  }))

  const displayValue = formatValue ? formatValue(value) : String(value)

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Text style={styles.value}>{displayValue}</Text>

      <View style={styles.sliderContainer}>
        {/* Track */}
        <View style={styles.track}>
          <Animated.View style={[styles.trackFill, fillStyle]}>
            <LinearGradient
              colors={Colors.recoveryGradient as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>

        {/* Thumb */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.thumb, thumbStyle]}>
            <View style={styles.thumbInner} />
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Min/Max labels */}
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabel}>{formatValue ? formatValue(min) : min}</Text>
        <Text style={styles.rangeLabel}>{formatValue ? formatValue(max) : max}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: SLIDER_WIDTH,
    alignSelf: 'center',
  },
  label: {
    fontSize: 14,
    color: Colors.subtleText,
    textAlign: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 24,
  },
  sliderContainer: {
    width: SLIDER_WIDTH,
    height: 40,
    justifyContent: 'center',
  },
  track: {
    width: SLIDER_WIDTH,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: Colors.neonCyan,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
  },
  thumbInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.spaceCharcoal,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rangeLabel: {
    fontSize: 12,
    color: Colors.subtleText,
  },
})
