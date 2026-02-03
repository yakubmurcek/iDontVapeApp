/**
 * Nicotine Step - What nicotine strength?
 */

import { SliderInput } from "@/components/Onboarding/SliderInput";
import { Button } from "@/components/ui/Button";
import { Colors } from "@/constants/Colors";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function NicotineStep() {
  const router = useRouter();
  const [strength, setStrength] = useState(20);
  const setNicotineStrength = useOnboardingStore(
    (state) => state.setNicotineStrength,
  );

  const formatStrength = (value: number): string => {
    return `${value}mg`;
  };

  const handleBack = () => {
    router.back();
  };

  const handleNext = () => {
    setNicotineStrength(strength);
    router.push("/onboarding/puffs");
  };

  // Custom non-linear scaling for nicotine
  // Spread low values more: 3-10mg gets 40%, 10-20mg gets 25%, 20-30mg gets 20%, 30-50mg gets 15%
  const nicotineToPosition = (
    val: number,
    min: number,
    max: number,
  ): number => {
    // Range 1: 3 -> 10 (takes 0% -> 40% of slider) - most granular for low nicotine
    if (val <= 10) {
      return ((val - 3) / (10 - 3)) * 0.4;
    }
    // Range 2: 10 -> 20 (takes 40% -> 65% of slider)
    if (val <= 20) {
      return 0.4 + ((val - 10) / (20 - 10)) * 0.25;
    }
    // Range 3: 20 -> 30 (takes 65% -> 85% of slider)
    if (val <= 30) {
      return 0.65 + ((val - 20) / (30 - 20)) * 0.2;
    }
    // Range 4: 30 -> 50 (takes 85% -> 100% of slider)
    return 0.85 + ((val - 30) / (max - 30)) * 0.15;
  };

  const positionToNicotine = (
    pos: number,
    min: number,
    max: number,
  ): number => {
    let val: number;
    let step = 1;

    if (pos <= 0.4) {
      // 0 -> 0.4 maps to 3 -> 10 (step 1mg)
      val = 3 + (pos / 0.4) * (10 - 3);
      step = 1;
    } else if (pos <= 0.65) {
      // 0.4 -> 0.65 maps to 10 -> 20 (step 1mg)
      val = 10 + ((pos - 0.4) / 0.25) * (20 - 10);
      step = 1;
    } else if (pos <= 0.85) {
      // 0.65 -> 0.85 maps to 20 -> 30 (step 5mg)
      val = 20 + ((pos - 0.65) / 0.2) * (30 - 20);
      step = 5;
    } else {
      // 0.85 -> 1.0 maps to 30 -> 50 (step 10mg)
      val = 30 + ((pos - 0.85) / 0.15) * (max - 30);
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
