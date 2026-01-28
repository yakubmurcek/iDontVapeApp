/**
 * Onboarding Index - Redirects to first step
 */

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function OnboardingIndex() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/onboarding/duration');
  }, []);
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.neonCyan} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.spaceCharcoal,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
