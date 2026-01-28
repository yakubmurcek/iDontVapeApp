/**
 * SliderInput - Styled slider for onboarding inputs
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 80;
const THUMB_SIZE = 28;

interface SliderInputProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  label?: string;
}

export function SliderInput({
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue,
  label,
}: SliderInputProps) {
  const progress = (value - min) / (max - min);
  const translateX = useSharedValue(progress * (SLIDER_WIDTH - THUMB_SIZE));
  const startX = useSharedValue(0);
  
  React.useEffect(() => {
    const newProgress = (value - min) / (max - min);
    translateX.value = withSpring(newProgress * (SLIDER_WIDTH - THUMB_SIZE), { damping: 20 });
  }, [value, min, max]);
  
  const updateValue = (x: number) => {
    const clampedX = Math.max(0, Math.min(x, SLIDER_WIDTH - THUMB_SIZE));
    const progress = clampedX / (SLIDER_WIDTH - THUMB_SIZE);
    const rawValue = min + progress * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    const finalValue = Math.max(min, Math.min(max, steppedValue));
    onChange(finalValue);
  };
  
  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      const newX = startX.value + event.translationX;
      translateX.value = Math.max(0, Math.min(newX, SLIDER_WIDTH - THUMB_SIZE));
      runOnJS(updateValue)(translateX.value);
    });
  
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  
  const fillStyle = useAnimatedStyle(() => ({
    width: translateX.value + THUMB_SIZE / 2,
  }));
  
  const displayValue = formatValue ? formatValue(value) : String(value);
  
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <Text style={styles.value}>{displayValue}</Text>
      
      <View style={styles.sliderContainer}>
        {/* Track */}
        <View style={styles.track}>
          <Animated.View style={[styles.trackFill, fillStyle]}>
            <LinearGradient
              colors={Colors.recoveryGradient as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
        
        {/* Thumb */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.thumb, thumbStyle]}>
            <View style={styles.thumbInner} />
          </Animated.View>
        </GestureDetector>
      </View>
      
      {/* Min/Max labels */}
      <View style={styles.rangeLabels}>
        <Text style={styles.rangeLabel}>{formatValue ? formatValue(min) : min}</Text>
        <Text style={styles.rangeLabel}>{formatValue ? formatValue(max) : max}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SLIDER_WIDTH,
    alignSelf: 'center',
  },
  label: {
    fontSize: 14,
    color: Colors.subtleText,
    textAlign: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 24,
  },
  sliderContainer: {
    width: SLIDER_WIDTH,
    height: 40,
    justifyContent: 'center',
  },
  track: {
    width: SLIDER_WIDTH,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: Colors.neonCyan,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
  },
  thumbInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.spaceCharcoal,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rangeLabel: {
    fontSize: 12,
    color: Colors.subtleText,
  },
});
