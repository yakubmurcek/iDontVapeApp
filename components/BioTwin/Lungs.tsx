/**
 * Lungs - SVG wireframe lung visualization
 */

import React from 'react';
import Svg, { Path, G, Circle } from 'react-native-svg';
import Animated, { 
  useSharedValue, 
  useAnimatedProps, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Colors, ColorRGB } from '@/constants/Colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

interface LungsProps {
  recoveryProgress: number; // 0-1
  width?: number;
  height?: number;
}

// Interpolate between damaged (red) and healthy (cyan) colors
function interpolateColor(progress: number): string {
  const r = Math.round(ColorRGB.criticalRed.r + (ColorRGB.neonCyan.r - ColorRGB.criticalRed.r) * progress);
  const g = Math.round(ColorRGB.criticalRed.g + (ColorRGB.neonCyan.g - ColorRGB.criticalRed.g) * progress);
  const b = Math.round(ColorRGB.criticalRed.b + (ColorRGB.neonCyan.b - ColorRGB.criticalRed.b) * progress);
  return `rgb(${r}, ${g}, ${b})`;
}

export function Lungs({ recoveryProgress, width = 200, height = 180 }: LungsProps) {
  const color = interpolateColor(recoveryProgress);
  
  // Breathing animation
  const breatheScale = useSharedValue(1);
  
  React.useEffect(() => {
    breatheScale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);
  
  const animatedProps = useAnimatedProps(() => ({
    transform: [{ scale: breatheScale.value }],
  }));
  
  return (
    <Svg width={width} height={height} viewBox="0 0 200 180">
      <AnimatedG animatedProps={animatedProps} origin="100, 90">
        {/* Trachea */}
        <Path
          d="M100 10 L100 50"
          stroke={color}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Bronchi branches */}
        <Path
          d="M100 50 L70 70 L50 90"
          stroke={color}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M100 50 L130 70 L150 90"
          stroke={color}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Left lung outline */}
        <Path
          d="M50 90 
             C30 95, 20 110, 20 130
             C20 155, 35 170, 60 170
             C80 170, 90 155, 90 140
             L90 70
             C90 60, 75 55, 70 70
             L50 90"
          stroke={color}
          strokeWidth={1.5}
          fill="none"
          opacity={0.8}
        />
        
        {/* Left lung wireframe details */}
        <Path d="M35 110 L75 120" stroke={color} strokeWidth={0.5} opacity={0.4} />
        <Path d="M30 130 L80 135" stroke={color} strokeWidth={0.5} opacity={0.4} />
        <Path d="M40 150 L75 155" stroke={color} strokeWidth={0.5} opacity={0.4} />
        <Path d="M55 100 L55 160" stroke={color} strokeWidth={0.5} opacity={0.3} />
        
        {/* Right lung outline */}
        <Path
          d="M150 90 
             C170 95, 180 110, 180 130
             C180 155, 165 170, 140 170
             C120 170, 110 155, 110 140
             L110 70
             C110 60, 125 55, 130 70
             L150 90"
          stroke={color}
          strokeWidth={1.5}
          fill="none"
          opacity={0.8}
        />
        
        {/* Right lung wireframe details */}
        <Path d="M125 120 L165 110" stroke={color} strokeWidth={0.5} opacity={0.4} />
        <Path d="M120 135 L170 130" stroke={color} strokeWidth={0.5} opacity={0.4} />
        <Path d="M125 155 L160 150" stroke={color} strokeWidth={0.5} opacity={0.4} />
        <Path d="M145 100 L145 160" stroke={color} strokeWidth={0.5} opacity={0.3} />
        
        {/* Damage indicators (nodes) - fade with recovery */}
        {recoveryProgress < 0.8 && (
          <>
            <Circle cx={40} cy={120} r={3} fill={Colors.criticalRed} opacity={0.7 * (1 - recoveryProgress)} />
            <Circle cx={55} cy={140} r={2} fill={Colors.damageOrange} opacity={0.6 * (1 - recoveryProgress)} />
            <Circle cx={160} cy={125} r={3} fill={Colors.criticalRed} opacity={0.7 * (1 - recoveryProgress)} />
            <Circle cx={145} cy={150} r={2} fill={Colors.damageOrange} opacity={0.6 * (1 - recoveryProgress)} />
          </>
        )}
        
        {/* Recovery glow nodes - appear with recovery */}
        {recoveryProgress > 0.3 && (
          <>
            <Circle cx={70} cy={130} r={2} fill={Colors.healthGreen} opacity={0.5 * recoveryProgress} />
            <Circle cx={130} cy={130} r={2} fill={Colors.healthGreen} opacity={0.5 * recoveryProgress} />
          </>
        )}
      </AnimatedG>
    </Svg>
  );
}
