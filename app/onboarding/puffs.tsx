/**
 * Puffs Step - How many puffs per day?
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Zap } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { GlowText } from '@/components/ui/GlowText';
import { ProgressDots } from '@/components/Onboarding/ProgressDots';
import { SliderInput } from '@/components/Onboarding/SliderInput';

export default function PuffsStep() {
  const router = useRouter();
  const [puffs, setPuffs] = useState(100);
  
  const formatPuffs = (value: number): string => {
    return `${value}`;
  };
  
  const handleBack = () => {
    router.back();
  };
  
  const handleBeginScan = () => {
    global.onboardingData = { 
      ...global.onboardingData,
      puffsPerDay: puffs,
    };
    router.push('/onboarding/calibration');
  };
  
  // Calculate device equivalent
  const getDeviceEquivalent = (puffs: number): string => {
    if (puffs < 100) return '~½ disposable/day';
    if (puffs < 200) return '~1 disposable/day';
    if (puffs < 400) return '~2 disposables/day';
    return '~3+ disposables/day';
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
        <ProgressDots totalSteps={3} currentStep={2} />
        
        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.question}>How many puffs per day?</Text>
          
          <View style={styles.sliderContainer}>
            <SliderInput
              value={puffs}
              min={50}
              max={500}
              step={10}
              onChange={setPuffs}
              formatValue={formatPuffs}
              label="puffs"
            />
          </View>
          
          {/* Device equivalent */}
          <View style={styles.reference}>
            <Text style={styles.referenceText}>
              {getDeviceEquivalent(puffs)}
            </Text>
          </View>
        </View>
        
        {/* Navigation */}
        <View style={styles.navigation}>
          <Button
            title="Back"
            onPress={handleBack}
            variant="ghost"
            icon={<ChevronLeft size={20} color="rgba(255,255,255,0.7)" />}
          />
          <Button
            title="Begin Scan"
            onPress={handleBeginScan}
            icon={<Zap size={20} color="#000" />}
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
});
