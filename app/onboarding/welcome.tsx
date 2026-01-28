/**
 * Welcome Step - Personal message from the founder
 */

import { Button } from "@/components/ui/Button";
import { GlowText } from "@/components/ui/GlowText";
import { TypewriterText } from "@/components/ui/TypewriterText";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { ChevronRight, Heart } from "lucide-react-native";
import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

export default function WelcomeStep() {
  const router = useRouter();
  const [typingStep, setTypingStep] = useState(0);

  const handleNext = () => {
    router.push("/onboarding/duration");
  };

  const advanceStep = (nextStep: number, delay: number = 0) => {
    if (delay === 0) {
      setTypingStep(nextStep);
    } else {
      setTimeout(() => {
        setTypingStep(nextStep);
      }, delay);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Welcome Header */}
          <View style={styles.header}>
            <View style={styles.heartContainer}>
              <Heart size={32} color={Colors.neonCyan} fill={Colors.neonCyan} />
            </View>
            <GlowText size="lg">Welcome</GlowText>
          </View>

          {/* Personal Message */}
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>A note from the founder</Text>

            <TypewriterText
              text="Hey, Yakub here. So I nearly died cause of vaping."
              style={styles.messageText}
              start={typingStep >= 0}
              onComplete={() => advanceStep(1, 400)}
              hideCursorOnComplete={true}
              speed={35}
            />

            <View style={styles.spacer} />

            <TypewriterText
              text="Like you, I really wanted to quit vaping, but every app I tried felt generic and just money grab."
              style={styles.messageText}
              start={typingStep >= 1}
              onComplete={() => advanceStep(2, 600)}
              hideCursorOnComplete={true}
              speed={18}
            />

            <View style={styles.spacer} />

            <TypewriterText
              text="I built I Don't Vape for myself first – to visualize what was happening to my body."
              style={styles.messageText}
              start={typingStep >= 2}
              onComplete={() => advanceStep(3, 500)}
              hideCursorOnComplete={false}
              speed={18}
            />

            <View style={styles.spacer} />

            {typingStep >= 3 && (
              <Animated.View entering={FadeIn.duration(800)}>
                <Text style={styles.messageHighlight}>
                  We'll quit together.
                </Text>
                <Text style={styles.signature}>– Yakub</Text>
              </Animated.View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={[styles.navigation, { opacity: typingStep >= 3 ? 1 : 0 }]}>
        <Button
          title="Let's Begin"
          onPress={handleNext}
          icon={<ChevronRight size={20} color="#000" />}
          disabled={typingStep < 3}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.spaceCharcoal,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Extra padding for button
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  heartContainer: {
    marginBottom: 16,
  },
  messageCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.2)",
    minHeight: 400, // Prevent layout jump
  },
  messageTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.neonCyan,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 20,
    textAlign: "center",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 26,
    color: Colors.white,
    // marginBottom: 16, // Removed margin from text itself, handle with spacer or container
    opacity: 0.9,
  },
  spacer: {
    height: 16,
  },
  messageHighlight: {
    fontSize: 18,
    lineHeight: 28,
    color: Colors.healthGreen,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 8,
    textAlign: "center",
  },
  signature: {
    fontSize: 16,
    color: Colors.subtleText,
    fontStyle: "italic",
    textAlign: "right",
    marginTop: 8,
  },
  navigation: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
});
