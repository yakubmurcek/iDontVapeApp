/**
 * CalibrationAnim - Calibration/scan effect for onboarding completion
 */

import { Colors } from "@/constants/Colors";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import Svg, { Circle, G, Line } from "react-native-svg";

const AnimatedG = Animated.createAnimatedComponent(G);

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface CalibrationAnimProps {
  damageScore: number;
  onComplete: () => void;
}

export function CalibrationAnim({
  damageScore,
  onComplete,
}: CalibrationAnimProps) {
  const [phase, setPhase] = React.useState<
    "scanning" | "analyzing" | "complete"
  >("scanning");
  const [statusText, setStatusText] = React.useState("INITIALIZING SCAN...");

  const scanLineY = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const damageOpacity = useSharedValue(0);

  React.useEffect(() => {
    // Scanning animation
    scanLineY.value = withRepeat(
      withTiming(250, { duration: 2000, easing: Easing.linear }),
      2,
      true,
    );

    // Pulse animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500 }),
        withTiming(1, { duration: 500 }),
      ),
      -1,
      true,
    );

    // Phase transitions
    setTimeout(() => {
      setPhase("analyzing");
      setStatusText("ANALYZING PULMONARY SYSTEM...");
    }, 2000);

    setTimeout(() => {
      setStatusText("MAPPING VASCULAR NETWORK...");
    }, 3500);

    setTimeout(() => {
      setStatusText("CALCULATING DAMAGE INDEX...");
      damageOpacity.value = withTiming(1, { duration: 1000 });
    }, 5000);

    setTimeout(() => {
      setPhase("complete");
      setStatusText("CALIBRATION COMPLETE");
    }, 6500);

    setTimeout(() => {
      onComplete();
    }, 7500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
    opacity: phase === "scanning" ? 1 : 0,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const damageDotsProps = useAnimatedProps(() => ({
    opacity: damageOpacity.value,
  }));

  const damagePercentage = Math.round(damageScore * 100);

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>{statusText}</Text>

      <View style={styles.scanArea}>
        <Animated.View style={[styles.pulseContainer, pulseStyle]}>
          <Svg width={SCREEN_WIDTH - 60} height={250} viewBox="0 0 300 250">
            {/* Body outline */}
            <G
              stroke={Colors.neonCyan}
              strokeWidth={1}
              fill="none"
              opacity={0.6}
            >
              {/* Head */}
              <Circle cx={150} cy={30} r={20} />
              {/* Neck */}
              <Line x1={150} y1={50} x2={150} y2={65} />
              {/* Shoulders */}
              <Line x1={100} y1={75} x2={200} y2={75} />
              {/* Torso outline */}
              <Line x1={100} y1={75} x2={90} y2={180} />
              <Line x1={200} y1={75} x2={210} y2={180} />
              <Line x1={90} y1={180} x2={120} y2={200} />
              <Line x1={210} y1={180} x2={180} y2={200} />
              {/* Arms */}
              <Line x1={100} y1={75} x2={60} y2={150} />
              <Line x1={200} y1={75} x2={240} y2={150} />
              {/* Lungs outline */}
              <Circle cx={120} cy={110} r={25} opacity={0.5} />
              <Circle cx={180} cy={110} r={25} opacity={0.5} />
              {/* Heart */}
              <Circle
                cx={150}
                cy={120}
                r={15}
                stroke={Colors.criticalRed}
                opacity={0.5}
              />
            </G>

            {/* Damage indicators */}
            <AnimatedG animatedProps={damageDotsProps}>
              <Circle cx={110} cy={100} r={4} fill={Colors.criticalRed} />
              <Circle cx={130} cy={115} r={3} fill={Colors.damageOrange} />
              <Circle cx={170} cy={105} r={4} fill={Colors.criticalRed} />
              <Circle cx={190} cy={120} r={3} fill={Colors.damageOrange} />
              <Circle cx={145} cy={125} r={3} fill={Colors.criticalRed} />
              <Circle cx={155} cy={110} r={2} fill={Colors.damageOrange} />
              {damageScore > 0.4 && (
                <>
                  <Circle cx={115} cy={125} r={3} fill={Colors.criticalRed} />
                  <Circle cx={185} cy={130} r={3} fill={Colors.damageOrange} />
                </>
              )}
              {damageScore > 0.6 && (
                <>
                  <Circle cx={100} cy={110} r={2} fill={Colors.criticalRed} />
                  <Circle cx={200} cy={115} r={2} fill={Colors.criticalRed} />
                </>
              )}
            </AnimatedG>
          </Svg>
        </Animated.View>

        {/* Scan line */}
        <Animated.View style={[styles.scanLine, scanLineStyle]} />
      </View>

      {phase === "complete" && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>INITIAL DAMAGE INDEX</Text>
          <Text style={styles.resultValue}>{damagePercentage}%</Text>
          <Text style={styles.resultSubtext}>
            Bio-Twin calibrated. Recovery tracking initiated.
          </Text>
        </View>
      )}

      {/* Decorative corners */}
      <View style={[styles.corner, styles.cornerTL]} />
      <View style={[styles.corner, styles.cornerTR]} />
      <View style={[styles.corner, styles.cornerBL]} />
      <View style={[styles.corner, styles.cornerBR]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.spaceCharcoal,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.neonCyan,
    letterSpacing: 2,
    marginBottom: 40,
  },
  scanArea: {
    width: SCREEN_WIDTH - 60,
    height: 250,
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.3)",
    borderRadius: 8,
    overflow: "hidden",
  },
  pulseContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.neonCyan,
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  resultContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.subtleText,
    letterSpacing: 2,
  },
  resultValue: {
    fontSize: 64,
    fontWeight: "700",
    color: Colors.criticalRed,
    marginVertical: 8,
  },
  resultSubtext: {
    fontSize: 14,
    color: Colors.subtleText,
    textAlign: "center",
  },
  corner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: Colors.neonCyan,
  },
  cornerTL: {
    top: 60,
    left: 20,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerTR: {
    top: 60,
    right: 20,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  cornerBL: {
    bottom: 60,
    left: 20,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    bottom: 60,
    right: 20,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
});
