/**
 * Calibration Step - Animated scan and damage calculation
 */

import { CalibrationAnim } from '@/components/Onboarding/CalibrationAnim'
import { useLogsStore } from '@/store/logsStore'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useUserStore } from '@/store/userStore'
import { calculateInitialDamage } from '@/utils/recoveryCalculator'
import { useRouter } from 'expo-router'
import React from 'react'

export default function CalibrationStep() {
  const router = useRouter()
  const completeOnboarding = useUserStore((state) => state.completeOnboarding)
  const addLog = useLogsStore((state) => state.addLog)

  // Get collected data from store
  const {
    vapingDurationMonths,
    nicotineStrength,
    puffsPerDay,
    reset: resetOnboarding,
  } = useOnboardingStore()

  // Calculate damage for animation display
  const damageScore = calculateInitialDamage(vapingDurationMonths, nicotineStrength, puffsPerDay)

  const handleComplete = () => {
    // Save to store
    completeOnboarding({
      vapingDurationMonths,
      nicotineStrength,
      puffsPerDay,
    })

    // Add initial log
    addLog('dailyCheckIn', { note: 'Recovery journey started' })

    // Clear temp data
    resetOnboarding()

    // Navigate to main dashboard
    router.replace('/(main)')
  }

  return (
    <CalibrationAnim
      damageScore={damageScore}
      onComplete={handleComplete}
    />
  )
}
