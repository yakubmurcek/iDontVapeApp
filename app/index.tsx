/**
 * Index - Entry point that redirects based on onboarding status
 */

import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useUserStore } from '@/store/userStore';
import { Colors } from '@/constants/Colors';

export default function Index() {
  const [isHydrated, setIsHydrated] = useState(false);
  const hasCompletedOnboarding = useUserStore(state => state.hasCompletedOnboarding);
  
  useEffect(() => {
    // Wait for store to hydrate from storage
    const unsubscribe = useUserStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });
    
    // If already hydrated
    if (useUserStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }
    
    return unsubscribe;
  }, []);
  
  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.neonCyan} />
      </View>
    );
  }
  
  // Redirect based on onboarding status
  if (hasCompletedOnboarding) {
    return <Redirect href="/(main)" />;
  }
  
  return <Redirect href="/onboarding" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.spaceCharcoal,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
