/**
 * Puffs Step - How many puffs per day?
 */

import { SliderInput } from '@/components/Onboarding/SliderInput'
import { Button } from '@/components/ui/Button'
import { Colors } from '@/constants/Colors'
import { useOnboardingStore } from '@/store/onboardingStore'
import { useRouter } from 'expo-router'
import { ChevronLeft, Zap } from 'lucide-react-native'
import React, { useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View } from 'react-native'

export default function PuffsStep() {
  const router = useRouter()
  const [puffs, setPuffs] = useState(100)
  const setPuffsPerDay = useOnboardingStore((state) => state.setPuffsPerDay)

  const formatPuffs = (value: number): string => {
    return `${value}`
  }

  const handleBack = () => {
    router.back()
  }

  const handleBeginScan = () => {
    setPuffsPerDay(puffs)
    router.push('/onboarding/calibration')
  }

  // Calculate device equivalent
  const getDeviceEquivalent = (puffs: number): string => {
    if (puffs < 100) return '~½ disposable/day'
    if (puffs < 200) return '~1 disposable/day'
    if (puffs < 400) return '~2 disposables/day'
    return '~3+ disposables/day'
  }

  // Custom non-linear scaling for puffs
  const puffsToPosition = (val: number, min: number, max: number): number => {
    // Range 1: 50 -> 150 (takes 0% -> 50% of slider)
    if (val <= 150) {
      return ((val - 50) / (150 - 50)) * 0.5
    }
    // Range 2: 150 -> 300 (takes 50% -> 80% of slider)
    if (val <= 300) {
      return 0.5 + ((val - 150) / (300 - 150)) * 0.3
    }
    // Range 3: 300 -> 500+ (takes 80% -> 100% of slider)
    return 0.8 + ((val - 300) / (max - 300)) * 0.2
  }

  const positionToPuffs = (pos: number, min: number, max: number): number => {
    let val: number
    let step: number

    if (pos <= 0.5) {
      // 0 -> 0.5 maps to 50 -> 150
      val = 50 + (pos / 0.5) * (150 - 50)

      // Step logic for this range
      if (val <= 100) {
        step = 5
      } else {
        step = 10
      }
    } else if (pos <= 0.8) {
      // 0.5 -> 0.8 maps to 150 -> 300
      val = 150 + ((pos - 0.5) / 0.3) * (300 - 150)
      step = 50
    } else {
      // 0.8 -> 1.0 maps to 300 -> 500
      val = 300 + ((pos - 0.8) / 0.2) * (max - 300)
      step = 100
    }

    // Snap to step
    // Special handling to ensure we hit exact boundary points (150, 300) nicely
    const snapped = Math.round(val / step) * step
    return Math.max(min, Math.min(max, snapped))
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.question}>How many puffs per day?</Text>

          <View style={styles.sliderContainer}>
            <SliderInput
              value={puffs}
              min={50}
              max={500}
              step={1} // Handled by custom logic, but providing base
              onChange={setPuffs}
              formatValue={formatPuffs}
              label="puffs"
              customValueToPosition={puffsToPosition}
              customPositionToValue={positionToPuffs}
            />
          </View>

          {/* Device equivalent */}
          <View style={styles.reference}>
            <Text style={styles.referenceText}>{getDeviceEquivalent(puffs)}</Text>
          </View>
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          <Button
            title="Back"
            onPress={handleBack}
            variant="ghost"
            icon={
              <ChevronLeft
                size={20}
                color="rgba(255,255,255,0.7)"
              />
            }
          />
          <Button
            title="Begin Scan"
            onPress={handleBeginScan}
            icon={
              <Zap
                size={20}
                color="#000"
              />
            }
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.spaceCharcoal,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  question: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 48,
  },
  sliderContainer: {
    width: '100%',
    alignItems: 'center',
  },
  reference: {
    marginTop: 32,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderRadius: 8,
  },
  referenceText: {
    fontSize: 14,
    color: Colors.neonCyan,
    textAlign: 'center',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
})
