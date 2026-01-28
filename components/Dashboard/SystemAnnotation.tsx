/**
 * LungAnnotation - Medical-style annotation showing recovery progress
 * with a line connecting to the lung visualization
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
    Path,
    Stop,
    LinearGradient as SvgLinearGradient,
} from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface LungAnnotationProps {
  score: number; // 0-1
  size?: number;
  position?: "left" | "right";
}

export function SystemAnnotation({
  score,
  label,
  size = 100,
  position = "right",
  style,
}: {
  score: number;
  label: string;
  size?: number;
  position?: "left" | "right";
  style?: any;
}) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedProgress = useSharedValue(0);

  React.useEffect(() => {
    animatedProgress.value = withTiming(score, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });
  }, [score]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  const percentage = Math.round(score * 100);

  return (
    <View
      style={[
        styles.container,
        position === "left" ? styles.containerLeft : styles.containerRight,
        style,
      ]}
    >
      {/* Connecting line */}
      <Svg
        width={position === "left" ? 60 : 60}
        height={80}
        style={[
          styles.connector,
          position === "left" ? styles.connectorLeft : styles.connectorRight,
        ]}
      >
        <Defs>
          <SvgLinearGradient
            id="lineGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <Stop offset="0%" stopColor={Colors.neonCyan} stopOpacity="0.6" />
            <Stop offset="100%" stopColor={Colors.neonCyan} stopOpacity="0.2" />
          </SvgLinearGradient>
        </Defs>

        {position === "right" ? (
          <Path
            d="M 0 40 L 30 40 L 50 20"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="4 4"
          />
        ) : (
          <Path
            d="M 60 40 L 30 40 L 10 20"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="4 4"
          />
        )}
      </Svg>

      {/* Progress Ring and Text */}
      <View style={[styles.ringContainer, { width: size, height: size }]}>
        <Svg width={size} height={size} style={styles.svg}>
          <Defs>
            <SvgLinearGradient
              id="ringGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <Stop offset="0%" stopColor={Colors.neonCyan} />
              <Stop offset="100%" stopColor={Colors.healthGreen} />
            </SvgLinearGradient>
          </Defs>

          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="rgba(0, 0, 0, 0.4)"
          />

          {/* Progress circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#ringGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>

        {/* Text overlay */}
        <View style={styles.textContainer}>
          <Text style={styles.percentage}>{percentage}</Text>
          <Text style={styles.percentSymbol}>%</Text>
        </View>
      </View>

      {/* Label below */}
      <View style={styles.labelContainer}>
        <View style={styles.labelDot} />
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignItems: "center",
    zIndex: 10,
  },
  containerLeft: {
    left: 20,
    top: 100,
  },
  containerRight: {
    right: 20,
    top: 100,
  },
  connector: {
    position: "absolute",
  },
  connectorLeft: {
    right: -10,
    top: "55%",
    transform: [{ translateY: -40 }],
  },
  connectorRight: {
    left: -10,
    top: "55%",
    transform: [{ translateY: -40 }],
  },
  ringContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  svg: {
    position: "absolute",
  },
  textContainer: {
    alignItems: "center",
  },
  percentage: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.white,
    fontVariant: ["tabular-nums"],
  },
  percentSymbol: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.neonCyan,
    marginTop: -4,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(103, 232, 249, 0.2)",
  },
  labelDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.neonCyan,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.neonCyan,
    letterSpacing: 1.5,
  },
});
