/**
 * HologramFrame - reusable HUD scanner frame and atmosphere layers
 */

import { Colors } from '@/constants/Colors'
import React from 'react'
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import Svg, { Circle, Ellipse, G, Line, Path } from 'react-native-svg'

const AnimatedG = Animated.createAnimatedComponent(G)
const FRAME_SIZE = 320
const CENTER = FRAME_SIZE / 2
const RADIUS = 132

export interface HologramFrameProps {
  progress: number
  width: number
  height: number
  accentColor?: string
  dangerColor?: string
  showSweep?: boolean
}

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  }
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, endAngle)
  const end = polarToCartesian(cx, cy, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
}

export function HologramFrame({
  progress,
  width,
  height,
  accentColor = Colors.scanRing,
  dangerColor = Colors.damageGlow,
  showSweep = true,
}: HologramFrameProps) {
  const clampedProgress = Math.max(0, Math.min(1, progress))
  const sweepRotation = useSharedValue(0)

  React.useEffect(() => {
    if (!showSweep) return

    sweepRotation.value = withRepeat(
      withTiming(360, { duration: 9000, easing: Easing.linear }),
      -1,
      false,
    )
    return () => {
      cancelAnimation(sweepRotation)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSweep])

  const sweepProps = useAnimatedProps(() => ({
    transform: `rotate(${sweepRotation.value} ${CENTER} ${CENTER})`,
    opacity: 0.24,
  }))

  const statusArc = describeArc(CENTER, CENTER, RADIUS + 8, -110, -110 + 300 * clampedProgress)
  const ticks = new Array(18).fill(0)

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${FRAME_SIZE} ${FRAME_SIZE}`}
    >
      <G>
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS + 22}
          stroke={Colors.holoDim}
          strokeWidth={1}
          fill="none"
          opacity={0.45}
        />

        <Ellipse
          cx={CENTER}
          cy={CENTER}
          rx={RADIUS + 8}
          ry={RADIUS - 6}
          stroke={Colors.holoGlow}
          strokeWidth={1.2}
          fill="none"
          opacity={0.2}
        />

        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS - 18}
          stroke={Colors.holoDim}
          strokeWidth={0.8}
          fill="none"
          opacity={0.35}
        />

        {ticks.map((_, index) => {
          const angle = index * 20
          const inner = polarToCartesian(CENTER, CENTER, RADIUS + 12, angle)
          const outer = polarToCartesian(
            CENTER,
            CENTER,
            RADIUS + (index % 3 === 0 ? 22 : 17),
            angle,
          )
          return (
            <Line
              key={`tick-${index}`}
              x1={inner.x}
              y1={inner.y}
              x2={outer.x}
              y2={outer.y}
              stroke={accentColor}
              strokeWidth={index % 3 === 0 ? 1.2 : 0.8}
              opacity={index % 3 === 0 ? 0.3 : 0.18}
            />
          )
        })}

        <Path
          d={statusArc}
          stroke={accentColor}
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
          opacity={0.85}
        />

        <Path
          d={describeArc(CENTER, CENTER, RADIUS + 8, 135, 175)}
          stroke={dangerColor}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
          opacity={0.6 * (1 - clampedProgress)}
        />
      </G>

      {showSweep && (
        <AnimatedG animatedProps={sweepProps}>
          <Path
            d={describeArc(CENTER, CENTER, RADIUS, -22, 20)}
            stroke={Colors.scanSweep}
            strokeWidth={8}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d={`M ${CENTER} ${CENTER - (RADIUS - 30)} L ${CENTER} ${CENTER + (RADIUS - 12)}`}
            stroke={Colors.scanSweep}
            strokeWidth={1.2}
            opacity={0.35}
          />
        </AnimatedG>
      )}
    </Svg>
  )
}
