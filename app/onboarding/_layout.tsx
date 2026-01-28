/**
 * Onboarding Layout - Stack navigator for onboarding flow
 */

import { ProgressDots } from "@/components/Onboarding/ProgressDots";
import { GlowText } from "@/components/ui/GlowText";
import { Colors } from "@/constants/Colors";
import { Stack, usePathname } from "expo-router";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function OnboardingLayout() {
  const pathname = usePathname();

  // Map routes to step indices
  const stepMap: Record<string, number> = {
    "/onboarding/duration": 0,
    "/onboarding/nicotine": 1,
    "/onboarding/puffs": 2,
  };

  const currentStep = stepMap[pathname];
  const showHeader = currentStep !== undefined;

  return (
    <View style={styles.container}>
      {showHeader && (
        <SafeAreaView style={styles.headerSafeArea}>
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <GlowText size="sm">SYSTEM DIAGNOSTICS</GlowText>
              <Text style={styles.title}>Bio-Twin Calibration</Text>
            </View>
            <View style={styles.dotsContainer}>
              <ProgressDots totalSteps={3} currentStep={currentStep} />
            </View>
          </View>
        </SafeAreaView>
      )}

      <View style={styles.contentContainer}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
            animation: "slide_from_right",
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="duration" />
          <Stack.Screen name="nicotine" />
          <Stack.Screen name="puffs" />
          <Stack.Screen
            name="calibration"
            options={{
              animation: "fade",
              gestureEnabled: false,
            }}
          />
        </Stack>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.spaceCharcoal,
  },
  headerSafeArea: {
    backgroundColor: Colors.spaceCharcoal,
    zIndex: 10,
  },
  headerContent: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerText: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.white,
    marginTop: 8,
  },
  dotsContainer: {
    marginBottom: 10,
  },
  contentContainer: {
    flex: 1,
  },
});
