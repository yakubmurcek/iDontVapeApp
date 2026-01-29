/**
 * Nicotine Step - What nicotine strength?
 */

import { SliderInput } from "@/components/Onboarding/SliderInput";
import { Button } from "@/components/ui/Button";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function NicotineStep() {
  const router = useRouter();
  const [strength, setStrength] = useState(20);

  const formatStrength = (value: number): string => {
    return `${value}mg`;
  };

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    global.onboardingData = {
      ...global.onboardingData,
      nicotineStrength: strength,
    };
    router.push("/onboarding/puffs");
  };

  // Custom non-linear scaling for nicotine
  const nicotineToPosition = (
    val: number,
    min: number,
    max: number,
  ): number => {
    // Range 1: 3 -> 20 (takes 0% -> 60% of slider)
    if (val <= 20) {
      return ((val - 3) / (20 - 3)) * 0.6;
    }
    // Range 2: 20 -> 30 (takes 60% -> 80% of slider)
    if (val <= 30) {
      return 0.6 + ((val - 20) / (30 - 20)) * 0.2;
    }
    // Range 3: 30 -> 50 (takes 80% -> 100% of slider)
    return 0.8 + ((val - 30) / (max - 30)) * 0.2;
  };

  const positionToNicotine = (
    pos: number,
    min: number,
    max: number,
  ): number => {
    let val: number;
    let step = 1;

    if (pos <= 0.6) {
      // 0 -> 0.6 maps to 3 -> 20
      val = 3 + (pos / 0.6) * (20 - 3);
      step = 1;
    } else if (pos <= 0.8) {
      // 0.6 -> 0.8 maps to 20 -> 30
      val = 20 + ((pos - 0.6) / 0.2) * (30 - 20);
      step = 5;
    } else {
      // 0.8 -> 1.0 maps to 30 -> 50
      val = 30 + ((pos - 0.8) / 0.2) * (max - 30);
      step = 10;
    }

    const snapped = Math.round(val / step) * step;
    return Math.max(min, Math.min(max, snapped));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.question}>What nicotine strength?</Text>

          <View style={styles.sliderContainer}>
            <SliderInput
              value={strength}
              min={3}
              max={50}
              step={1}
              onChange={setStrength}
              formatValue={formatStrength}
              customValueToPosition={nicotineToPosition}
              customPositionToValue={positionToNicotine}
            />
          </View>

          {/* Common strengths reference */}
          <View style={styles.reference}>
            <Text style={styles.referenceText}>
              <Text style={styles.refLabel}>Low: </Text>3-6mg •
              <Text style={styles.refLabel}> Medium: </Text>12-20mg •
              <Text style={styles.refLabel}> High: </Text>30-50mg
            </Text>
          </View>
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          <Button
            title="Back"
            onPress={handleBack}
            variant="ghost"
            icon={<ChevronLeft size={20} color="rgba(255,255,255,0.7)" />}
          />
          <Button
            title="Next"
            onPress={handleNext}
            icon={<ChevronRight size={20} color="#000" />}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.spaceCharcoal,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  questionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  question: {
    fontSize: 20,
    fontWeight: "500",
    color: Colors.white,
    textAlign: "center",
    marginBottom: 48,
  },
  sliderContainer: {
    width: "100%",
    alignItems: "center",
  },
  reference: {
    marginTop: 32,
  },
  referenceText: {
    fontSize: 12,
    color: Colors.subtleText,
    textAlign: "center",
  },
  refLabel: {
    color: Colors.neonCyan,
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
});
