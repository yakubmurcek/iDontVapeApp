import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    Extrapolation,
    interpolate,
    interpolateColor,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
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

  const pan = Gesture.Pan()
    .onStart(() => {
      if (isComplete.value) return;
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
      }
    });

  const animatedThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateX.value,
        [0, H_SWIPE_RANGE / 2],
        [1, 0],
        Extrapolation.CLAMP,
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
        ["rgba(255, 255, 255, 0.1)", Colors.neonCyan],
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
              colors={["#00F0FF", "#0080FF"]}
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
