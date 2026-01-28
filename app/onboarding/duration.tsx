/**
 * Duration Step - How long have you vaped?
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { GlowText } from '@/components/ui/GlowText';
import { ProgressDots } from '@/components/Onboarding/ProgressDots';
import { SliderInput } from '@/components/Onboarding/SliderInput';

export default function DurationStep() {
  const router = useRouter();
  const [months, setMonths] = useState(12);
  
  const formatDuration = (value: number): string => {
    if (value < 12) {
      return `${value} months`;
    }
    const years = Math.floor(value / 12);
    const remainingMonths = value % 12;
    if (remainingMonths === 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    }
    return `${years}y ${remainingMonths}m`;
  };
  
  const handleNext = () => {
    // Store in a temporary location - we'll save all at calibration
    global.onboardingData = { 
      ...global.onboardingData,
      vapingDurationMonths: months,
    };
    router.push('/onboarding/nicotine');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <GlowText size="sm">SYSTEM DIAGNOSTICS</GlowText>
          <Text style={styles.title}>Bio-Twin Calibration</Text>
        </View>
        
        {/* Progress */}
        <ProgressDots totalSteps={3} currentStep={0} />
        
        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.question}>How long have you vaped?</Text>
          
          <View style={styles.sliderContainer}>
            <SliderInput
              value={months}
              min={1}
              max={120}
              step={1}
              onChange={setMonths}
              formatValue={formatDuration}
            />
          </View>
        </View>
        
        {/* Navigation */}
        <View style={styles.navigation}>
          <View style={{ flex: 1 }} />
          <Button
            title="Next"
            onPress={handleNext}
            icon={<ChevronRight size={20} color="#000" />}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.spaceCharcoal,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.white,
    marginTop: 8,
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
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
});

// Global storage for onboarding data
declare global {
  var onboardingData: {
    vapingDurationMonths?: number;
    nicotineStrength?: number;
    puffsPerDay?: number;
  };
}
global.onboardingData = {};
