/**
 * MilestoneCelebration - Full-screen modal for milestone achievements
 * Shows a dramatic "repair sequence" animation when a milestone is reached
 */

import { GlowText } from '@/components/ui/GlowText'
import { Colors } from '@/constants/Colors'
import { RecoveryMilestone } from '@/constants/milestones'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import { useCallback, useEffect, useState } from 'react'
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

interface MilestoneCelebrationProps {
  milestone: RecoveryMilestone | null
  onDismiss: () => void
}

const ORGAN_LABELS: Record<string, string> = {
  lungs: 'PULMONARY',
  heart: 'CARDIAC',
  bloodVessels: 'VASCULAR',
}

export function MilestoneCelebration({ milestone, onDismiss }: MilestoneCelebrationProps) {
  const [phase, setPhase] = useState<'scanning' | 'repairing' | 'complete'>('scanning')

  // Animated values
  const scanLineY = useSharedValue(0)
  const repairProgress = useSharedValue(0)
  const glowIntensity = useSharedValue(0)
  const damageOpacity = useSharedValue(1)

  const triggerHaptic = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }, [])

  useEffect(() => {
    if (!milestone) return

    // Reset phase and animated values so back-to-back milestones replay from scratch
    // instead of jumping to the "complete" frame of the previous run.
    setPhase('scanning')
    scanLineY.value = 0
    damageOpacity.value = 1
    repairProgress.value = 0
    glowIntensity.value = 0

    // Phase 1: Scanning (0-2s)
    scanLineY.value = withTiming(1, { duration: 2000, easing: Easing.linear })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    // Phase 2: Repairing (2-4.5s)
    const repairTimer = setTimeout(() => {
      setPhase('repairing')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      damageOpacity.value = withTiming(0, { duration: 2000 })
      repairProgress.value = withTiming(1, { duration: 2500, easing: Easing.out(Easing.cubic) })
      glowIntensity.value = withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.6, { duration: 1000 }),
      )
    }, 2000)

    // Phase 3: Complete (4.5s+)
    const completeTimer = setTimeout(() => {
      setPhase('complete')
      runOnJS(triggerHaptic)()
    }, 4500)

    return () => {
      clearTimeout(repairTimer)
      clearTimeout(completeTimer)
    }
  }, [milestone, scanLineY, repairProgress, glowIntensity, damageOpacity, triggerHaptic])

  const scanLineStyle = useAnimatedStyle(() => ({
    top: `${scanLineY.value * 100}%` as `${number}%`,
    opacity: phase === 'scanning' ? 1 : 0,
  }))

  const damageStyle = useAnimatedStyle(() => ({
    opacity: damageOpacity.value,
  }))

  const repairGlowStyle = useAnimatedStyle(() => ({
    opacity: glowIntensity.value * 0.4,
    transform: [{ scale: 1 + glowIntensity.value * 0.1 }],
  }))

  if (!milestone) return null

  const organLabel = ORGAN_LABELS[milestone.relatedOrgan] || 'SYSTEM'

  return (
    <Modal
      visible={!!milestone}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Scan line */}
          <Animated.View style={[styles.scanLine, scanLineStyle]}>
            <LinearGradient
              colors={['transparent', Colors.neonCyan, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.scanLineGradient}
            />
          </Animated.View>

          {/* Damage overlay (fades out during repair) */}
          <Animated.View style={[styles.damageOverlay, damageStyle]} />

          {/* Repair glow */}
          <Animated.View style={[styles.repairGlow, repairGlowStyle]} />

          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(600)}
            style={styles.header}
          >
            <GlowText
              size="sm"
              color={phase === 'complete' ? Colors.healthGreen : Colors.neonCyan}
            >
              {phase === 'scanning'
                ? 'SCANNING...'
                : phase === 'repairing'
                  ? 'REPAIR SEQUENCE INITIATED'
                  : 'REPAIR COMPLETE'}
            </GlowText>
          </Animated.View>

          {/* Content column - flow layout for organ ring, info, and button */}
          <View style={styles.contentColumn}>
            {/* Center content */}
            <View style={styles.center}>
              {/* Organ indicator ring */}
              <View style={styles.organRing}>
                <View
                  style={[styles.organRingInner, phase === 'complete' && styles.organRingComplete]}
                >
                  <Text style={styles.organLabel}>{organLabel}</Text>
                  <GlowText
                    size="xl"
                    color={phase === 'complete' ? Colors.healthGreen : Colors.neonCyan}
                  >
                    {milestone.systemName.split('_')[0]}
                  </GlowText>
                </View>
              </View>
            </View>

            {/* Milestone info (appears after repair) */}
            {phase === 'complete' && (
              <Animated.View
                entering={FadeInUp.delay(200).duration(600)}
                style={styles.milestoneInfo}
              >
                <Text style={styles.milestoneName}>{milestone.displayName}</Text>
                <Text style={styles.milestoneDescription}>{milestone.description}</Text>
              </Animated.View>
            )}

            {/* Dismiss button */}
            {phase === 'complete' && (
              <Animated.View entering={FadeIn.delay(600).duration(400)}>
                <TouchableOpacity
                  style={styles.dismissButton}
                  onPress={onDismiss}
                >
                  <LinearGradient
                    colors={[Colors.neonCyan, Colors.healthGreen]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.dismissGradient}
                  >
                    <Text style={styles.dismissText}>CONTINUE</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
  },
  scanLineGradient: {
    width: '100%',
    height: '100%',
  },
  damageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 59, 59, 0.05)',
  },
  repairGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.neonCyan,
  },
  header: {
    position: 'absolute',
    top: 120,
    alignItems: 'center',
  },
  contentColumn: {
    alignItems: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  organRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  organRingInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.03)',
  },
  organRingComplete: {
    borderColor: 'rgba(0, 255, 136, 0.3)',
    backgroundColor: 'rgba(0, 255, 136, 0.05)',
  },
  organLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.subtleText,
    letterSpacing: 2,
    marginBottom: 4,
  },
  milestoneInfo: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 40,
  },
  milestoneName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 12,
  },
  milestoneDescription: {
    fontSize: 14,
    color: Colors.subtleText,
    textAlign: 'center',
    lineHeight: 22,
  },
  dismissButton: {
    marginTop: 32,
  },
  dismissGradient: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 28,
  },
  dismissText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 2,
  },
})
