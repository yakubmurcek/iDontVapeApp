/**
 * Onboarding Layout - Stack navigator for onboarding flow
 */

import { Colors } from "@/constants/Colors";
import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.spaceCharcoal },
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
  );
}
