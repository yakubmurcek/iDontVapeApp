/**
 * Duration Step - How long have you vaped?
 */

import { ProgressDots } from "@/components/Onboarding/ProgressDots";
import { SliderInput } from "@/components/Onboarding/SliderInput";
import { Button } from "@/components/ui/Button";
import { GlowText } from "@/components/ui/GlowText";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function DurationStep() {
  const router = useRouter();
  const [months, setMonths] = useState(12);

  // Dynamic step: months below 2 years, full years after
  const handleMonthsChange = (value: number) => {
    if (value < 24) {
      // Under 2 years: keep month precision
      setMonths(Math.round(value));
    } else {
      // 2+ years: snap to full years (12-month increments)
      const years = Math.round(value / 12);
      setMonths(years * 12);
    }
  };

  const formatDuration = (value: number): string => {
    if (value < 12) {
      return `${value} month${value === 1 ? "" : "s"}`;
    }
    const years = Math.floor(value / 12);
    const remainingMonths = value % 12;
    if (remainingMonths === 0) {
      return `${years} year${years > 1 ? "s" : ""}`;
    }
    return `${years}y ${remainingMonths}m`;
  };

  const handleNext = () => {
    // Store in a temporary location - we'll save all at calibration
    global.onboardingData = {
      ...global.onboardingData,
      vapingDurationMonths: months,
    };
    router.push("/onboarding/nicotine");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <GlowText size="sm">SYSTEM DIAGNOSTICS</GlowText>
          <Text style={styles.title}>Bio-Twin Calibration</Text>
        </View>

        {/* Progress */}
        <ProgressDots totalSteps={3} currentStep={0} />

        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.question}>How long have you vaped?</Text>

          <View style={styles.sliderContainer}>
            <SliderInput
              value={months}
              min={1}
              max={120}
              step={1}
              onChange={handleMonthsChange}
              formatValue={formatDuration}
              scale="logarithmic"
            />
          </View>
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          <View style={{ flex: 1 }} />
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
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.white,
    marginTop: 8,
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
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
});

// Global storage for onboarding data
declare global {
  var onboardingData: {
    vapingDurationMonths?: number;
    nicotineStrength?: number;
    puffsPerDay?: number;
  };
}
global.onboardingData = {};
