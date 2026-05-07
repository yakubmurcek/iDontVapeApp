/**
 * Heart - layered SVG hologram heart visualization
 */

import { ColorRGB, Colors } from '@/constants/Colors'
import React from 'react'
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import Svg, { Circle, G, Path } from 'react-native-svg'

const AnimatedG = Animated.createAnimatedComponent(G)

interface HeartProps {
  recoveryProgress: number // 0-1
  width?: number
  height?: number
  detailLevel?: 'normal' | 'high'
  animate?: boolean
}

const HEART_PATHS = {
  silhouette:
    'M40 70 C20 55, 5 40, 10 25 C15 10, 30 10, 40 25 C50 10, 65 10, 70 25 C75 40, 60 55, 40 70',
  chamberInner:
    'M40 61 C28 51, 18 40, 22 30 C25 20, 33 20, 40 30 C47 20, 55 20, 58 30 C62 40, 52 51, 40 61',
  meshLines: ['M40 25 L40 60', 'M30 35 L30 50', 'M50 35 L50 50', 'M22 38 L58 38', 'M28 50 L52 50'],
  vascular: ['M25 20 L20 10', 'M40 15 L40 5', 'M55 20 L60 10', 'M32 24 L26 14', 'M48 24 L54 14'],
}

function interpolateColor(progress: number): string {
  const targetR = 255
  const targetG = 80
  const targetB = 130

  const r = Math.round(ColorRGB.criticalRed.r + (targetR - ColorRGB.criticalRed.r) * progress)
  const g = Math.round(ColorRGB.criticalRed.g + (targetG - ColorRGB.criticalRed.g) * progress)
  const b = Math.round(ColorRGB.criticalRed.b + (targetB - ColorRGB.criticalRed.b) * progress)
  return `rgb(${r}, ${g}, ${b})`
}

export function Heart({
  recoveryProgress,
  width = 80,
  height = 80,
  detailLevel = 'high',
  animate = true,
}: HeartProps) {
  const clampedProgress = Math.max(0, Math.min(1, recoveryProgress))
  const color = interpolateColor(clampedProgress)

  const heartbeatScale = useSharedValue(1)

  React.useEffect(() => {
    if (!animate) return
    heartbeatScale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 115, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 220, easing: Easing.in(Easing.cubic) }),
        withDelay(
          110,
          withSequence(
            withTiming(1.04, { duration: 120, easing: Easing.out(Easing.cubic) }),
            withTiming(1, { duration: 640, easing: Easing.inOut(Easing.cubic) }),
          ),
        ),
      ),
      -1,
      false,
    )
    return () => {
      cancelAnimation(heartbeatScale)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate])

  const heartbeatProps = useAnimatedProps(() => ({
    transform: [
      { translateX: 40 },
      { translateY: 40 },
      { scale: heartbeatScale.value },
      { translateX: -40 },
      { translateY: -40 },
    ],
  }))

  const meshLines =
    detailLevel === 'high'
      ? HEART_PATHS.meshLines
      : [HEART_PATHS.meshLines[0], HEART_PATHS.meshLines[3]]
  const vascularLines =
    detailLevel === 'high' ? HEART_PATHS.vascular : HEART_PATHS.vascular.slice(0, 3)

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 80 80"
    >
      <AnimatedG animatedProps={heartbeatProps}>
        <Path
          d={HEART_PATHS.silhouette}
          stroke={color}
          strokeWidth={1.7}
          fill="none"
          opacity={0.9}
        />

        <Path
          d={HEART_PATHS.chamberInner}
          stroke={color}
          strokeWidth={0.95}
          fill="none"
          opacity={0.72}
        />

        <G opacity={0.42}>
          {meshLines.map((d, index) => (
            <Path
              key={`heart-mesh-${index}`}
              d={d}
              stroke={color}
              strokeWidth={0.55}
              opacity={0.7}
            />
          ))}
        </G>

        <G opacity={0.7}>
          {vascularLines.map((d, index) => (
            <Path
              key={`heart-vascular-${index}`}
              d={d}
              stroke={Colors.holoGlow}
              strokeWidth={index < 3 ? 1.05 : 0.8}
              fill="none"
            />
          ))}
        </G>

        <Circle
          cx={40}
          cy={40}
          r={6}
          fill={color}
          opacity={0.22 + 0.25 * clampedProgress}
        />
        <Circle
          cx={40}
          cy={40}
          r={2.6}
          fill={Colors.neonCyan}
          opacity={0.45 * clampedProgress + 0.2}
        />

        {clampedProgress < 0.65 && (
          <>
            <Circle
              cx={28}
              cy={35}
              r={2.6}
              fill={Colors.damageGlow}
              opacity={0.75 * (1 - clampedProgress)}
            />
            <Circle
              cx={52}
              cy={45}
              r={2.3}
              fill={Colors.damageOrange}
              opacity={0.6 * (1 - clampedProgress)}
            />
          </>
        )}
      </AnimatedG>
    </Svg>
  )
}
