/**
 * IntegrityRing - Circular progress indicator showing system integrity
 */

import { Colors } from "@/constants/Colors";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedProps,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import Svg, {
    Circle,
    Defs,
    Stop,
    LinearGradient as SvgLinearGradient,
} from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface IntegrityRingProps {
  score: number; // 0-1
  size?: number;
}

export function IntegrityRing({ score, size = 140 }: IntegrityRingProps) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedProgress = useSharedValue(0);

  React.useEffect(() => {
    animatedProgress.value = withTiming(score, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  const percentage = Math.round(score * 100);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <SvgLinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={Colors.neonCyan} />
            <Stop offset="100%" stopColor={Colors.healthGreen} />
          </SvgLinearGradient>
        </Defs>

        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Percentage text */}
      <View style={styles.textContainer}>
        <Text style={styles.percentage}>{percentage}</Text>
        <Text style={styles.percentSymbol}>%</Text>
        <Text style={styles.label}>RESTORED</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    position: "absolute",
  },
  textContainer: {
    alignItems: "center",
  },
  percentage: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.white,
    fontVariant: ["tabular-nums"],
  },
  percentSymbol: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.subtleText,
    marginTop: -4,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.neonCyan,
    letterSpacing: 2,
    marginTop: 2,
  },
});
