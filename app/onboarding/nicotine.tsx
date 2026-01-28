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
