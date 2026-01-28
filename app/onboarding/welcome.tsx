/**
 * Welcome Step - Personal message from the founder
 */

import { Button } from "@/components/ui/Button";
import { GlowText } from "@/components/ui/GlowText";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { ChevronRight, Heart } from "lucide-react-native";
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

export default function WelcomeStep() {
  const router = useRouter();

  const handleNext = () => {
    router.push("/onboarding/duration");
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

            <Text style={styles.messageText}>Hey, I'm Yakub.</Text>

            <Text style={styles.messageText}>
              Like you, I really wanted to quit vaping, but every app I tried
              felt generic and just money grab.
            </Text>

            <Text style={styles.messageText}>
              So I built iDontVape for myself first – to visualize what was
              happening inside my body and to have a companion that truly gets
              the struggle.
            </Text>

            <Text style={styles.messageHighlight}>We'll quit together.</Text>

            <Text style={styles.signature}>– Yakub</Text>
          </View>
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <Button
          title="Let's Begin"
          onPress={handleNext}
          icon={<ChevronRight size={20} color="#000" />}
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
    marginBottom: 16,
    opacity: 0.9,
  },
  messageHighlight: {
    fontSize: 18,
    lineHeight: 28,
    color: Colors.healthGreen,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 16,
    textAlign: "center",
  },
  signature: {
    fontSize: 16,
    color: Colors.subtleText,
    fontStyle: "italic",
    textAlign: "right",
    marginTop: 8,
  },
  encouragement: {
    marginTop: 32,
    paddingHorizontal: 8,
  },
  encouragementText: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.subtleText,
    textAlign: "center",
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
});
