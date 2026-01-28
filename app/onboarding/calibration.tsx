/**
 * Calibration Step - Animated scan and damage calculation
 */

import React from 'react';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { useLogsStore } from '@/store/logsStore';
import { CalibrationAnim } from '@/components/Onboarding/CalibrationAnim';
import { calculateInitialDamage } from '@/utils/recoveryCalculator';

export default function CalibrationStep() {
  const router = useRouter();
  const completeOnboarding = useUserStore(state => state.completeOnboarding);
  const addLog = useLogsStore(state => state.addLog);
  
  // Get collected data
  const data = global.onboardingData || {};
  const vapingDurationMonths = data.vapingDurationMonths || 12;
  const nicotineStrength = data.nicotineStrength || 20;
  const puffsPerDay = data.puffsPerDay || 100;
  
  // Calculate damage for animation display
  const damageScore = calculateInitialDamage(
    vapingDurationMonths,
    nicotineStrength,
    puffsPerDay
  );
  
  const handleComplete = () => {
    // Save to store
    completeOnboarding({
      vapingDurationMonths,
      nicotineStrength,
      puffsPerDay,
    });
    
    // Add initial log
    addLog('dailyCheckIn', { note: 'Recovery journey started' });
    
    // Clear temp data
    global.onboardingData = {};
    
    // Navigate to main dashboard
    router.replace('/(main)');
  };
  
  return (
    <CalibrationAnim 
      damageScore={damageScore}
      onComplete={handleComplete}
    />
  );
}
