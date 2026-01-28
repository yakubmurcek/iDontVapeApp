/**
 * Main Layout - Tab/Stack structure for main app
 */

import { Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.spaceCharcoal },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen 
        name="sos" 
        options={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }} 
      />
      <Stack.Screen 
        name="logs" 
        options={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }} 
      />
    </Stack>
  );
}
