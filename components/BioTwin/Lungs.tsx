/**
 * Lungs - layered SVG hologram lung visualization
 */

import { ColorRGB, Colors } from '@/constants/Colors'
import React from 'react'
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import Svg, { Circle, G, Path } from 'react-native-svg'

const AnimatedG = Animated.createAnimatedComponent(G)

interface LungsProps {
  recoveryProgress: number // 0-1
  width?: number
  height?: number
  detailLevel?: 'normal' | 'high'
  animate?: boolean
}

const LUNG_PATHS = {
  trachea: 'M100 10 L100 50',
  bronchiLeft: 'M100 50 L73 69 L54 88',
  bronchiRight: 'M100 50 L127 69 L146 88',
  silhouetteLeft:
    'M54 88 C31 96, 20 113, 20 132 C20 158, 36 172, 62 172 C81 172, 91 157, 91 142 L91 70 C91 60, 76 56, 72 70 L54 88',
  silhouetteRight:
    'M146 88 C169 96, 180 113, 180 132 C180 158, 164 172, 138 172 C119 172, 109 157, 109 142 L109 70 C109 60, 124 56, 128 70 L146 88',
  meshLeft: ['M35 108 L76 119', 'M31 129 L81 136', 'M40 149 L76 156', 'M55 99 L55 161'],
  meshRight: ['M124 119 L165 108', 'M119 136 L169 129', 'M124 156 L160 149', 'M145 99 L145 161'],
  vascularLeft: ['M65 74 L49 118', 'M65 86 L58 151', 'M76 95 L72 160', 'M45 122 L66 131'],
  vascularRight: ['M135 74 L151 118', 'M135 86 L142 151', 'M124 95 L128 160', 'M155 122 L134 131'],
}

function interpolateColor(progress: number): string {
  const r = Math.round(
    ColorRGB.criticalRed.r + (ColorRGB.neonCyan.r - ColorRGB.criticalRed.r) * progress,
  )
  const g = Math.round(
    ColorRGB.criticalRed.g + (ColorRGB.neonCyan.g - ColorRGB.criticalRed.g) * progress,
  )
  const b = Math.round(
    ColorRGB.criticalRed.b + (ColorRGB.neonCyan.b - ColorRGB.criticalRed.b) * progress,
  )
  return `rgb(${r}, ${g}, ${b})`
}

export function Lungs({
  recoveryProgress,
  width = 200,
  height = 180,
  detailLevel = 'high',
  animate = true,
}: LungsProps) {
  const clampedProgress = Math.max(0, Math.min(1, recoveryProgress))
  const color = interpolateColor(clampedProgress)

  const breatheScale = useSharedValue(1)

  React.useEffect(() => {
    if (!animate) return
    const maxScale = detailLevel === 'high' ? 1.03 : 1.02

    breatheScale.value = withRepeat(
      withSequence(
        withTiming(maxScale, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailLevel, animate])

  const breathingProps = useAnimatedProps(() => ({
    transform: [
      { translateX: 100 },
      { translateY: 90 },
      { scale: breatheScale.value },
      { translateX: -100 },
      { translateY: -90 },
    ],
  }))

  const meshLines =
    detailLevel === 'high'
      ? [...LUNG_PATHS.meshLeft.slice(0, 3), ...LUNG_PATHS.meshRight.slice(0, 3)]
      : [LUNG_PATHS.meshLeft[1], LUNG_PATHS.meshRight[1]]
  const vascularLines =
    detailLevel === 'high'
      ? [...LUNG_PATHS.vascularLeft.slice(0, 3), ...LUNG_PATHS.vascularRight.slice(0, 3)]
      : [LUNG_PATHS.vascularLeft[0], LUNG_PATHS.vascularRight[0]]

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 200 180"
    >
      <AnimatedG animatedProps={breathingProps}>
        <Path
          d={LUNG_PATHS.silhouetteLeft}
          stroke={color}
          strokeWidth={1.8}
          fill="none"
          opacity={0.88}
        />
        <Path
          d={LUNG_PATHS.silhouetteRight}
          stroke={color}
          strokeWidth={1.8}
          fill="none"
          opacity={0.88}
        />

        <Path
          d={LUNG_PATHS.trachea}
          stroke={color}
          strokeWidth={2.8}
          fill="none"
          strokeLinecap="round"
          opacity={0.95}
        />
        <Path
          d={LUNG_PATHS.bronchiLeft}
          stroke={color}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          opacity={0.85}
        />
        <Path
          d={LUNG_PATHS.bronchiRight}
          stroke={color}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          opacity={0.85}
        />

        <G opacity={0.34}>
          {meshLines.map((d, index) => (
            <Path
              key={`mesh-${index}`}
              d={d}
              stroke={color}
              strokeWidth={0.7}
              opacity={0.7}
            />
          ))}
        </G>

        <G opacity={0.42}>
          {vascularLines.map((d, index) => (
            <Path
              key={`vascular-${index}`}
              d={d}
              stroke={Colors.holoGlow}
              strokeWidth={index % 2 === 0 ? 1.1 : 0.8}
              opacity={0.65}
              fill="none"
            />
          ))}
        </G>

        <G>
          {clampedProgress < 0.85 && (
            <>
              <Circle
                cx={44}
                cy={119}
                r={4}
                fill={Colors.damageGlow}
                opacity={0.7 * (1 - clampedProgress)}
              />
              <Circle
                cx={57}
                cy={142}
                r={3}
                fill={Colors.damageOrange}
                opacity={0.55 * (1 - clampedProgress)}
              />
              <Circle
                cx={156}
                cy={123}
                r={4}
                fill={Colors.damageGlow}
                opacity={0.7 * (1 - clampedProgress)}
              />
              <Circle
                cx={143}
                cy={148}
                r={3}
                fill={Colors.damageOrange}
                opacity={0.55 * (1 - clampedProgress)}
              />
            </>
          )}

          {clampedProgress > 0.2 && (
            <>
              <Circle
                cx={70}
                cy={131}
                r={2.6}
                fill={Colors.neonCyan}
                opacity={0.5 * clampedProgress}
              />
              <Circle
                cx={130}
                cy={131}
                r={2.6}
                fill={Colors.neonCyan}
                opacity={0.5 * clampedProgress}
              />
              {detailLevel === 'high' && (
                <Circle
                  cx={100}
                  cy={106}
                  r={2.2}
                  fill={Colors.healthGreen}
                  opacity={0.45 * clampedProgress}
                />
              )}
            </>
          )}
        </G>
      </AnimatedG>
    </Svg>
  )
}
