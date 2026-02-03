/**
 * Duration Step - How long have you vaped?
 */

import { SliderInput } from "@/components/Onboarding/SliderInput";
import { Button } from "@/components/ui/Button";
import { Colors } from "@/constants/Colors";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function DurationStep() {
  const router = useRouter();
  const [months, setMonths] = useState(12);
  const setVapingDurationMonths = useOnboardingStore(
    (state) => state.setVapingDurationMonths,
  );

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
    // Store in global store
    setVapingDurationMonths(months);
    router.push("/onboarding/nicotine");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
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
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
});
