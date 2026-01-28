/**
 * BioTwinScene - Main container for the Bio-Twin visualization
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing,
} from 'react-native-reanimated';
import { Lungs } from './Lungs';
import { Heart } from './Heart';
import { BloodVessels } from './BloodVessels';

interface BioTwinSceneProps {
  damageLevel: number; // 0-1 (for initial display)
  recoveryProgress: number; // 0-1
  height?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function BioTwinScene({ 
  damageLevel, 
  recoveryProgress,
  height = 350,
}: BioTwinSceneProps) {
  // Slow rotation animation
  const rotation = useSharedValue(0);
  
  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 30000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);
  
  const rotationStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${rotation.value * 0.05}deg` }, // Very subtle rotation
    ],
  }));
  
  return (
    <View style={[styles.container, { height }]}>
      <Animated.View style={[styles.scene, rotationStyle]}>
        {/* Blood vessels in the background */}
        <View style={styles.bloodVesselsContainer}>
          <BloodVessels 
            recoveryProgress={recoveryProgress}
            width={SCREEN_WIDTH * 0.8}
            height={height * 0.85}
          />
        </View>
        
        {/* Lungs positioned behind/around heart */}
        <View style={styles.lungsContainer}>
          <Lungs 
            recoveryProgress={recoveryProgress}
            width={SCREEN_WIDTH * 0.7}
            height={height * 0.6}
          />
        </View>
        
        {/* Heart in the center-front */}
        <View style={styles.heartContainer}>
          <Heart 
            recoveryProgress={recoveryProgress}
            width={80}
            height={80}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  scene: {
    position: 'relative',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloodVesselsContainer: {
    position: 'absolute',
    top: '5%',
    alignItems: 'center',
    opacity: 0.6,
  },
  lungsContainer: {
    position: 'absolute',
    top: '10%',
    alignItems: 'center',
  },
  heartContainer: {
    position: 'absolute',
    top: '30%',
    alignItems: 'center',
  },
});
