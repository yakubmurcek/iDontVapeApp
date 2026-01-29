import { Colors } from "@/constants/Colors";
import React, { useEffect, useState } from "react";
import { StyleProp, StyleSheet, Text, TextStyle, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface TypewriterTextProps {
  text: string;
  style?: StyleProp<TextStyle>;
  speed?: number; // ms per character
  start?: boolean;
  onComplete?: () => void;
  cursorColor?: string;
  hideCursorOnComplete?: boolean;
  showCursor?: boolean; // Force cursor visibility state control from parent if needed
  skipToEnd?: boolean; // Skip animation and show full text instantly
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  style,
  speed = 30,
  start = false,
  onComplete,
  cursorColor = Colors.neonCyan,
  hideCursorOnComplete = true,
  showCursor,
  skipToEnd = false,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const cursorOpacity = useSharedValue(0);
  const flatStyle = flattenStyle(style);

  // Cursor animation
  useEffect(() => {
    // Determine if cursor should be blinking
    const shouldBlink =
      (start && !hasCompleted) || // Typing in progress
      (hasCompleted && !hideCursorOnComplete) || // Finished but keeping cursor
      (showCursor && !hasCompleted); // Explicitly shown waiting to type

    if (shouldBlink) {
      cursorOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 0 }),
          withTiming(1, { duration: 500 }),
          withTiming(0, { duration: 0 }),
          withTiming(0, { duration: 500 }),
        ),
        -1,
        false,
      );
    } else {
      cursorOpacity.value = 0;
    }
  }, [start, hasCompleted, hideCursorOnComplete, showCursor, cursorOpacity]);

  // Typing effect
  useEffect(() => {
    if (!start) return;
    if (displayedText === text) {
      if (isTyping) {
        setIsTyping(false);
        setHasCompleted(true);
        onComplete?.();
      }
      return;
    }

    setIsTyping(true);

    // Calculate next delay:
    // Base speed +/- variance.
    // Occasionally stick a longer pause (e.g. at punctuation).
    let nextDelay = speed;

    // 1. Random variance (0.7x to 1.3x)
    const variance = Math.random() * 0.6 + 0.7;
    nextDelay = nextDelay * variance;

    // 2. Longer pause at punctuation (only if not the very last char)
    const lastChar = displayedText.slice(-1);
    if ([",", ".", "!", "?", ";", "-"].includes(lastChar)) {
      nextDelay = Math.max(nextDelay, speed * 5); // 5x pause at punctuation
    }

    // 3. Occasional random "thinking" pause (1% chance)
    if (Math.random() < 0.01) {
      nextDelay = Math.max(nextDelay, speed * 8);
    }

    const timeout = setTimeout(() => {
      setDisplayedText(text.slice(0, displayedText.length + 1));
    }, nextDelay);

    return () => clearTimeout(timeout);
  }, [start, displayedText, text, speed, onComplete, isTyping]);

  // Reset if text changes completely (optional specific behavior)
  useEffect(() => {
    if (!start) {
      setDisplayedText("");
      setHasCompleted(false);
    }
  }, [start, text]);

  // Handle skipToEnd - instantly show full text
  useEffect(() => {
    if (skipToEnd && start && !hasCompleted) {
      setDisplayedText(text);
      setIsTyping(false);
      setHasCompleted(true);
      onComplete?.();
    }
  }, [skipToEnd, start, hasCompleted, text, onComplete]);

  // Decide cursor visibility
  // It's visible if:
  // 1. We are forcibly showing it (waiting to start)
  // 2. We are currently typing
  // 3. We finished typing and hideCursorOnComplete is false
  const isCursorVisible =
    showCursor ||
    (start && !hasCompleted) ||
    (hasCompleted && !hideCursorOnComplete);

  const animatedCursorStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  return (
    <View style={styles.wrapper}>
      {/* Invisible placeholder to reserve full text space */}
      <Text style={[style, styles.placeholder]} aria-hidden>
        {text}
      </Text>
      {/* Visible typing text positioned on top */}
      <View style={styles.textOverlay}>
        <Text style={[style, styles.container]}>
          {displayedText}
          {isCursorVisible && (
            <Animated.Text
              style={[
                {
                  color: cursorColor,
                  fontSize: flatStyle?.fontSize || 16,
                  lineHeight: flatStyle?.lineHeight,
                },
                animatedCursorStyle,
              ]}
            >
              |
            </Animated.Text>
          )}
        </Text>
      </View>
    </View>
  );
};

// Helper to extract fontSize if possible to size cursor appropriately
const flattenStyle = (style: StyleProp<TextStyle>): TextStyle | undefined => {
  if (!style) return undefined;
  // This is a naive check; React Native's StyleSheet.flatten is better but we can't import it easily inside specific environments consistently without extra checks,
  // but StyleSheet.flatten IS standard.
  return StyleSheet.flatten(style);
};

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  placeholder: {
    opacity: 0, // Invisible but takes up space
  },
  textOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  container: {
    // Ensure text and cursor flow together
  },
});
