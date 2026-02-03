/**
 * Heart - SVG wireframe heart visualization with pulsing animation
 */

import { ColorRGB, Colors } from "@/constants/Colors";
import React from "react";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, G, Path } from "react-native-svg";

const AnimatedG = Animated.createAnimatedComponent(G);

interface HeartProps {
  recoveryProgress: number; // 0-1
  width?: number;
  height?: number;
}

// Interpolate between damaged (critical red) and healthy (vital crimson) colors
function interpolateColor(progress: number): string {
  // Heart stays more red-tinted even when healthy
  // Heart stays red-tinted but shifts to a vital/healthy crimson-pink
  const targetR = 255;
  const targetG = 60;
  const targetB = 100;

  const r = Math.round(
    ColorRGB.criticalRed.r + (targetR - ColorRGB.criticalRed.r) * progress,
  );
  const g = Math.round(
    ColorRGB.criticalRed.g + (targetG - ColorRGB.criticalRed.g) * progress,
  );
  const b = Math.round(
    ColorRGB.criticalRed.b + (targetB - ColorRGB.criticalRed.b) * progress,
  );
  return `rgb(${r}, ${g}, ${b})`;
}

export function Heart({
  recoveryProgress,
  width = 80,
  height = 80,
}: HeartProps) {
  const color = interpolateColor(recoveryProgress);

  // Heartbeat animation
  const heartbeatScale = useSharedValue(1);

  React.useEffect(() => {
    heartbeatScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 100, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 200, easing: Easing.in(Easing.ease) }),
        withDelay(
          100,
          withSequence(
            withTiming(1.05, {
              duration: 100,
              easing: Easing.out(Easing.ease),
            }),
            withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          ),
        ),
      ),
      -1,
      false,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedProps = useAnimatedProps(() => ({
    transform: [
      { translateX: 40 },
      { translateY: 40 },
      { scale: heartbeatScale.value },
      { translateX: -40 },
      { translateY: -40 },
    ],
  }));

  return (
    <Svg width={width} height={height} viewBox="0 0 80 80">
      <AnimatedG animatedProps={animatedProps}>
        {/* Heart outline */}
        <Path
          d="M40 70
             C20 55, 5 40, 10 25
             C15 10, 30 10, 40 25
             C50 10, 65 10, 70 25
             C75 40, 60 55, 40 70"
          stroke={color}
          strokeWidth={1.5}
          fill="none"
          opacity={0.9}
        />

        {/* Inner wireframe structure */}
        <Path
          d="M40 60
             C28 50, 18 40, 22 30
             C25 20, 33 20, 40 30
             C47 20, 55 20, 58 30
             C62 40, 52 50, 40 60"
          stroke={color}
          strokeWidth={0.8}
          fill="none"
          opacity={0.5}
        />

        {/* Vertical chambers */}
        <Path
          d="M40 25 L40 60"
          stroke={color}
          strokeWidth={0.5}
          opacity={0.4}
        />
        <Path
          d="M30 35 L30 50"
          stroke={color}
          strokeWidth={0.5}
          opacity={0.3}
        />
        <Path
          d="M50 35 L50 50"
          stroke={color}
          strokeWidth={0.5}
          opacity={0.3}
        />

        {/* Horizontal cross-sections */}
        <Path
          d="M22 38 L58 38"
          stroke={color}
          strokeWidth={0.5}
          opacity={0.3}
        />
        <Path
          d="M28 50 L52 50"
          stroke={color}
          strokeWidth={0.5}
          opacity={0.3}
        />

        {/* Blood vessels coming out */}
        <Path d="M25 20 L20 10" stroke={color} strokeWidth={1} opacity={0.6} />
        <Path d="M40 15 L40 5" stroke={color} strokeWidth={1} opacity={0.6} />
        <Path d="M55 20 L60 10" stroke={color} strokeWidth={1} opacity={0.6} />

        {/* Central pulse point */}
        <Circle cx={40} cy={40} r={4} fill={color} opacity={0.3} />
        <Circle cx={40} cy={40} r={2} fill={color} opacity={0.6} />

        {/* Damage nodes */}
        {recoveryProgress < 0.6 && (
          <>
            <Circle
              cx={28}
              cy={35}
              r={2}
              fill={Colors.criticalRed}
              opacity={0.7 * (1 - recoveryProgress)}
            />
            <Circle
              cx={52}
              cy={45}
              r={2}
              fill={Colors.damageOrange}
              opacity={0.6 * (1 - recoveryProgress)}
            />
          </>
        )}
      </AnimatedG>
    </Svg>
  );
}
