import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight } from "lucide-react-native";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    cancelAnimation,
    Easing,
    Extrapolation,
    interpolate,
    interpolateColor,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";

const SCREEN_WIDTH = Dimensions.get("window").width;
const BUTTON_HEIGHT = 60;
const BUTTON_WIDTH = SCREEN_WIDTH - 48; // Padding horizontal 24 * 2
const SWIPEABLE_DIMENSIONS = BUTTON_HEIGHT - 8; // Margin 4
const H_SWIPE_RANGE = BUTTON_WIDTH - BUTTON_HEIGHT;

interface SlideButtonProps {
  onComplete: () => void;
  text?: string;
}

export function SlideButton({
  onComplete,
  text = "Slide to Begin",
}: SlideButtonProps) {
  const translateX = useSharedValue(0);
  const isComplete = useSharedValue(false);
  const isLoading = useSharedValue(false);

  const context = useSharedValue({ x: 0 });

  const hintX = useSharedValue(0);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    const runAnimations = () => {
      // Shimmer effect (Breathing)
      shimmer.value = withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );

      // Nudge effect (Beckoning)
      hintX.value = withRepeat(
        withSequence(
          withDelay(
            2000,
            withTiming(20, {
              duration: 500,
              easing: Easing.out(Easing.cubic),
            }),
          ),
          withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }),
        ),
        -1,
        false,
      );
    };

    runAnimations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pan = Gesture.Pan()
    .onStart(() => {
      if (isComplete.value) return;
      cancelAnimation(hintX);
      cancelAnimation(shimmer);
      hintX.value = withTiming(0);
      shimmer.value = withTiming(0);
      context.value = { x: translateX.value };
    })
    .onUpdate((event) => {
      if (isComplete.value || isLoading.value) return;

      let newValue = event.translationX + context.value.x;

      // Clamp value
      if (newValue < 0) {
        newValue = 0;
      } else if (newValue > H_SWIPE_RANGE) {
        newValue = H_SWIPE_RANGE;
      }

      translateX.value = newValue;
    })
    .onEnd(() => {
      if (isComplete.value || isLoading.value) return;

      if (translateX.value > H_SWIPE_RANGE * 0.7) {
        // Completed
        translateX.value = withSpring(H_SWIPE_RANGE, {
          mass: 0.5,
          damping: 15,
          stiffness: 120,
        });
        isComplete.value = true;
        runOnJS(onComplete)();
      } else {
        // Snap back
        translateX.value = withSpring(0, {
          mass: 0.5,
          damping: 15,
          stiffness: 120,
        });
        // Restart shimmer for engagement if not completed
        shimmer.value = withRepeat(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          -1,
          true,
        );
      }
    });

  const animatedThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value + hintX.value }],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateX.value,
        [0, H_SWIPE_RANGE / 2],
        // Pulse opacity when idle (0.6 -> 1), fade out when dragging
        [interpolate(shimmer.value, [0, 1], [0.6, 1]), 0],
        Extrapolation.CLAMP,
      ),
      color: interpolateColor(
        shimmer.value,
        [0, 1],
        [Colors.white, Colors.neonCyan],
      ),
      transform: [
        {
          translateX: interpolate(
            translateX.value,
            [0, H_SWIPE_RANGE],
            [0, 20],
            Extrapolation.CLAMP,
          ),
        },
        {
          scale: interpolate(shimmer.value, [0, 1], [0.98, 1.02]),
        },
      ],
    };
  });

  const animatedTrackStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        translateX.value,
        [0, H_SWIPE_RANGE],
        [Colors.cardBackground, "rgba(0, 240, 255, 0.1)"],
      ),
      borderColor: interpolateColor(
        translateX.value,
        [0, H_SWIPE_RANGE],
        // Pulse border slightly with the shimmer
        [
          interpolateColor(
            shimmer.value,
            [0, 1],
            ["rgba(255, 255, 255, 0.1)", "rgba(0, 240, 255, 0.3)"],
          ),
          Colors.neonCyan,
        ],
      ),
    };
  });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.track, animatedTrackStyle]}>
          <Animated.Text style={[styles.text, animatedTextStyle]}>
            {text}
          </Animated.Text>

          <Animated.View style={[styles.thumbContainer, animatedThumbStyle]}>
            <LinearGradient
              colors={[Colors.neonCyan, Colors.dataBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.thumb}
            >
              <ChevronRight size={24} color="#000" strokeWidth={3} />
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: BUTTON_HEIGHT,
    width: BUTTON_WIDTH,
    alignSelf: "center",
  },
  track: {
    flex: 1,
    borderRadius: BUTTON_HEIGHT / 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    backgroundColor: Colors.cardBackground,
    overflow: "hidden",
  },
  thumbContainer: {
    position: "absolute",
    left: 4,
    width: SWIPEABLE_DIMENSIONS,
    height: SWIPEABLE_DIMENSIONS,
    zIndex: 2,
  },
  thumb: {
    width: "100%",
    height: "100%",
    borderRadius: SWIPEABLE_DIMENSIONS / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  text: {
    textAlign: "center",
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
    zIndex: 1,
    paddingLeft: 15,
  },
});
