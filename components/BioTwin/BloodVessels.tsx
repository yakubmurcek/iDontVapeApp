/**
 * BloodVessels - SVG wireframe blood vessel visualization
 */

import { ColorRGB, Colors } from "@/constants/Colors";
import React from "react";
import Animated, {
    Easing,
    useAnimatedProps,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";
import Svg, { Circle, G, Path } from "react-native-svg";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface BloodVesselsProps {
  recoveryProgress: number; // 0-1
  width?: number;
  height?: number;
}

// Interpolate between damaged (orange) and healthy (blue/cyan)
function interpolateColor(progress: number): string {
  const r = Math.round(
    ColorRGB.damageOrange.r +
      (ColorRGB.neonCyan.r - ColorRGB.damageOrange.r) * progress,
  );
  const g = Math.round(
    ColorRGB.damageOrange.g +
      (ColorRGB.neonCyan.g - ColorRGB.damageOrange.g) * progress,
  );
  const b = Math.round(
    ColorRGB.damageOrange.b +
      (ColorRGB.neonCyan.b - ColorRGB.damageOrange.b) * progress,
  );
  return `rgb(${r}, ${g}, ${b})`;
}

export function BloodVessels({
  recoveryProgress,
  width = 200,
  height = 250,
}: BloodVesselsProps) {
  const color = interpolateColor(recoveryProgress);

  // Pulse animation for blood flow
  const pulseOpacity = useSharedValue(0.4);

  React.useEffect(() => {
    pulseOpacity.value = withRepeat(
      withTiming(0.8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pulseAnimatedProps = useAnimatedProps(() => ({
    opacity: pulseOpacity.value,
  }));

  return (
    <Svg width={width} height={height} viewBox="0 0 200 250">
      <G>
        {/* Main arteries from heart area */}

        {/* Aorta going up */}
        <Path
          d="M100 100 
             C100 80, 100 60, 100 40
             C100 30, 90 25, 80 30
             L60 40"
          stroke={color}
          strokeWidth={2}
          fill="none"
          opacity={0.7}
        />
        <Path
          d="M100 50 
             C100 40, 110 35, 120 30
             L140 40"
          stroke={color}
          strokeWidth={1.5}
          fill="none"
          opacity={0.6}
        />

        {/* Descending aorta */}
        <Path
          d="M100 100 
             L100 140
             C100 160, 95 180, 90 200
             L85 230"
          stroke={color}
          strokeWidth={2}
          fill="none"
          opacity={0.7}
        />
        <Path
          d="M100 140
             C105 160, 110 180, 115 200
             L120 230"
          stroke={color}
          strokeWidth={1.5}
          fill="none"
          opacity={0.6}
        />

        {/* Branching vessels - left side */}
        <Path
          d="M95 120 L70 130 L50 145"
          stroke={color}
          strokeWidth={1}
          opacity={0.5}
        />
        <Path
          d="M90 150 L65 165 L45 180"
          stroke={color}
          strokeWidth={1}
          opacity={0.5}
        />
        <Path
          d="M85 180 L60 200 L40 220"
          stroke={color}
          strokeWidth={0.8}
          opacity={0.4}
        />

        {/* Branching vessels - right side */}
        <Path
          d="M105 120 L130 130 L150 145"
          stroke={color}
          strokeWidth={1}
          opacity={0.5}
        />
        <Path
          d="M110 150 L135 165 L155 180"
          stroke={color}
          strokeWidth={1}
          opacity={0.5}
        />
        <Path
          d="M115 180 L140 200 L160 220"
          stroke={color}
          strokeWidth={0.8}
          opacity={0.4}
        />

        {/* Capillary networks (fine detail) */}
        <Path
          d="M50 145 L35 155 L30 170"
          stroke={color}
          strokeWidth={0.5}
          opacity={0.3}
        />
        <Path
          d="M50 145 L55 160 L45 175"
          stroke={color}
          strokeWidth={0.5}
          opacity={0.3}
        />
        <Path
          d="M150 145 L165 155 L170 170"
          stroke={color}
          strokeWidth={0.5}
          opacity={0.3}
        />
        <Path
          d="M150 145 L145 160 L155 175"
          stroke={color}
          strokeWidth={0.5}
          opacity={0.3}
        />

        {/* Pulse flow indicators */}
        <AnimatedPath
          animatedProps={pulseAnimatedProps}
          d="M100 80 L100 90"
          stroke={Colors.healthGreen}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <AnimatedPath
          animatedProps={pulseAnimatedProps}
          d="M100 160 L100 175"
          stroke={Colors.healthGreen}
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* Junction nodes */}
        <Circle cx={100} cy={100} r={4} fill={color} opacity={0.5} />
        <Circle cx={100} cy={140} r={3} fill={color} opacity={0.4} />
        <Circle cx={95} cy={120} r={2} fill={color} opacity={0.4} />
        <Circle cx={105} cy={120} r={2} fill={color} opacity={0.4} />

        {/* Damage indicators */}
        {recoveryProgress < 0.7 && (
          <>
            <Circle
              cx={70}
              cy={130}
              r={3}
              fill={Colors.criticalRed}
              opacity={0.6 * (1 - recoveryProgress)}
            />
            <Circle
              cx={130}
              cy={130}
              r={3}
              fill={Colors.damageOrange}
              opacity={0.5 * (1 - recoveryProgress)}
            />
            <Circle
              cx={85}
              cy={200}
              r={2}
              fill={Colors.criticalRed}
              opacity={0.5 * (1 - recoveryProgress)}
            />
            <Circle
              cx={115}
              cy={200}
              r={2}
              fill={Colors.damageOrange}
              opacity={0.4 * (1 - recoveryProgress)}
            />
          </>
        )}

        {/* Recovery nodes */}
        {recoveryProgress > 0.5 && (
          <>
            <Circle
              cx={100}
              cy={50}
              r={2}
              fill={Colors.healthGreen}
              opacity={0.6 * recoveryProgress}
            />
            <Circle
              cx={90}
              cy={180}
              r={2}
              fill={Colors.healthGreen}
              opacity={0.5 * recoveryProgress}
            />
            <Circle
              cx={110}
              cy={180}
              r={2}
              fill={Colors.healthGreen}
              opacity={0.5 * recoveryProgress}
            />
          </>
        )}
      </G>
    </Svg>
  );
}
