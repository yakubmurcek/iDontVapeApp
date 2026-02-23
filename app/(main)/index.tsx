/**
 * Dashboard - Main screen with Bio-Twin and stats
 */

import { BioTwinScene } from '@/components/BioTwin/BioTwinScene'
import { MilestoneCelebration } from '@/components/Celebration/MilestoneCelebration'
import { HealthMetricCard } from '@/components/Dashboard/HealthMetricCard'
import { MilestoneCard } from '@/components/Dashboard/MilestoneCard'
import { StatCard } from '@/components/Dashboard/StatCard'
import { SystemAnnotation } from '@/components/Dashboard/SystemAnnotation'
import { Button } from '@/components/ui/Button'
import { GlowText } from '@/components/ui/GlowText'
import { Colors } from '@/constants/Colors'
import { RecoveryMilestone } from '@/constants/milestones'
import { useLogsStore } from '@/store/logsStore'
import { useScanStore } from '@/store/scanStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUserStore } from '@/store/userStore'
import { LinearGradient } from 'expo-linear-gradient'
import { Href, useRouter } from 'expo-router'
import { usePlacement } from 'expo-superwall'
import {
  Activity,
  AlertTriangle,
  Brain,
  Clock,
  DollarSign,
  List,
  ShieldAlert,
  Wind,
} from 'lucide-react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'

// Parallax constants
const PARALLAX_FACTOR = 0.3
const CONTENT_BORDER_RADIUS = 28
const PARALLAX_SCROLL_DISTANCE = 300

export default function Dashboard() {
  const router = useRouter()

  // Superwall paywall placement
  const { registerPlacement } = usePlacement({
    onError: (err) => {
      if (__DEV__) console.error('Paywall Error:', err)
    },
    onPresent: (info) => {
      if (__DEV__) console.log('Paywall Presented:', info)
    },
    onDismiss: (info, result) => {
      if (__DEV__) console.log('Paywall Dismissed:', info, 'Result:', result)
    },
  })

  // Subscribe to user store
  const getFormattedTimeSinceQuit = useUserStore((state) => state.getFormattedTimeSinceQuit)
  const getSystemIntegrity = useUserStore((state) => state.getSystemIntegrity)
  const getMoneySaved = useUserStore((state) => state.getMoneySaved)
  const getCurrentMilestone = useUserStore((state) => state.getCurrentMilestone)
  const getHoursSinceQuit = useUserStore((state) => state.getHoursSinceQuit)
  const getLungRecovery = useUserStore((state) => state.getLungRecovery)
  const getHeartRecovery = useUserStore((state) => state.getHeartRecovery)
  const getOxygenEfficiency = useUserStore((state) => state.getOxygenEfficiency)
  const getToxinClearance = useUserStore((state) => state.getToxinClearance)
  const getNeuralReset = useUserStore((state) => state.getNeuralReset)
  const getNewlyAchievedMilestones = useUserStore((state) => state.getNewlyAchievedMilestones)
  const markMilestoneCelebrated = useUserStore((state) => state.markMilestoneCelebrated)

  // Scan store
  const hasScanAvailableToday = useScanStore((state) => state.hasScanAvailableToday)
  const scanStreak = useScanStore((state) => state.scanStreak)

  // Settings store (paywall rate limiting)
  const canShowPaywallToday = useSettingsStore((state) => state.canShowPaywallToday)
  const recordPaywallShown = useSettingsStore((state) => state.recordPaywallShown)
  const getDaysSinceQuit = useUserStore((state) => state.getDaysSinceQuit)

  // Milestone celebration state
  const [celebratingMilestone, setCelebratingMilestone] = useState<RecoveryMilestone | null>(null)
  const [pendingCelebrations, setPendingCelebrations] = useState<RecoveryMilestone[]>([])

  // Force re-render every minute to update time-based computed values
  // (display format is DDd HHh MMm, so per-minute updates are sufficient)
  const [, setTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setTick((t: number) => t + 1), 60000)
    return () => clearInterval(interval)
  }, [])

  // Smart paywall: show on dashboard load only after day 3 (user has invested time)
  useEffect(() => {
    const daysSinceQuit = getDaysSinceQuit()
    if (daysSinceQuit >= 3 && canShowPaywallToday()) {
      const timer = setTimeout(async () => {
        await registerPlacement({ placement: 'campaign_trigger' })
        recordPaywallShown()
      }, 3000) // Wait 3s so user sees their progress first
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Check for newly achieved milestones
  useEffect(() => {
    const newMilestones = getNewlyAchievedMilestones()
    if (newMilestones.length > 0 && !celebratingMilestone) {
      setPendingCelebrations(newMilestones)
      setCelebratingMilestone(newMilestones[0])
    }
  }, [getNewlyAchievedMilestones, celebratingMilestone])

  const handleCelebrationDismiss = useCallback(() => {
    if (celebratingMilestone) {
      markMilestoneCelebrated(celebratingMilestone.id)

      // Show paywall after milestone celebration (always allowed, even if already shown today)
      registerPlacement({ placement: 'campaign_trigger' })
      recordPaywallShown()
    }

    // Show next pending celebration or close
    const remaining = pendingCelebrations.slice(1)
    if (remaining.length > 0) {
      setPendingCelebrations(remaining)
      setCelebratingMilestone(remaining[0])
    } else {
      setPendingCelebrations([])
      setCelebratingMilestone(null)
    }
  }, [
    celebratingMilestone,
    pendingCelebrations,
    markMilestoneCelebrated,
    registerPlacement,
    recordPaywallShown,
  ])

  // Get computed values
  const formattedTime = getFormattedTimeSinceQuit()
  const systemIntegrity = getSystemIntegrity()
  const moneySaved = getMoneySaved()
  const milestone = getCurrentMilestone()
  const hoursSinceQuit = getHoursSinceQuit()
  const lungRecovery = getLungRecovery()
  const heartRecovery = getHeartRecovery()
  const oxygenEfficiency = getOxygenEfficiency()
  const toxinClearance = getToxinClearance()
  const neuralReset = getNeuralReset()

  const handleOrganPress = useCallback(
    (organ: 'lungs' | 'heart' | 'bloodVessels') => {
      router.push(`/(main)/organ/${organ}` as Href)
    },
    [router],
  )

  const handleReset = () => {
    Alert.alert(
      'Reset App',
      'Are you sure you want to reset all data? This will clear your profile and logs.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            useUserStore.getState().clearData()
            useLogsStore.getState().clearLogs()
            router.replace('/')
          },
        },
      ],
    )
  }

  const scanAvailable = hasScanAvailableToday()

  // Parallax scroll tracking
  const scrollY = useSharedValue(0)
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
  })

  const organParallaxStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: scrollY.value * PARALLAX_FACTOR },
      {
        scale: interpolate(
          scrollY.value,
          [0, PARALLAX_SCROLL_DISTANCE],
          [1, 0.92],
          Extrapolation.CLAMP,
        ),
      },
    ],
    opacity: interpolate(scrollY.value, [0, PARALLAX_SCROLL_DISTANCE], [1, 0], Extrapolation.CLAMP),
  }))

  return (
    <SafeAreaView style={styles.container}>
      {/* Milestone Celebration Modal */}
      <MilestoneCelebration
        milestone={celebratingMilestone}
        onDismiss={handleCelebrationDismiss}
      />

      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* Organ Section — parallax: scrolls slower, fades */}
        <Animated.View style={organParallaxStyle}>
          {/* Scan Banner */}
          {scanAvailable && (
            <TouchableOpacity
              style={styles.scanBanner}
              onPress={() => router.push('/(main)/scan' as Href)}
            >
              <LinearGradient
                colors={['rgba(0, 240, 255, 0.15)', 'rgba(0, 240, 255, 0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.scanBannerGradient}
              >
                <Activity
                  size={16}
                  color={Colors.neonCyan}
                />
                <Text style={styles.scanBannerText}>SYSTEM DIAGNOSTIC AVAILABLE</Text>
                {scanStreak > 0 && (
                  <View style={styles.streakBadge}>
                    <Text style={styles.streakText}>{scanStreak}</Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Header */}
          <View style={styles.header}>
            <GlowText size="sm">PULMONARY SYSTEM RECOVERY</GlowText>

            {/* Time since quit */}
            <View style={styles.timeContainer}>
              <Clock
                size={16}
                color={Colors.dataBlue}
              />
              <Text style={styles.timeText}>{formattedTime}</Text>
            </View>
          </View>

          {/* Bio-Twin Scene */}
          <View style={styles.bioTwinContainer}>
            <BioTwinScene
              recoveryProgress={systemIntegrity}
              height={320}
              onOrganPress={handleOrganPress}
            />

            {/* Lung Recovery Annotation */}
            <SystemAnnotation
              score={lungRecovery}
              label="LUNG RECOVERY"
              size={65}
              position="right"
              style={{ top: 125 }}
              onPress={() => handleOrganPress('lungs')}
            />

            {/* Heart Recovery Annotation */}
            <SystemAnnotation
              score={heartRecovery}
              label="HEART RECOVERY"
              size={65}
              position="left"
              style={{ top: 85 }}
              onPress={() => handleOrganPress('heart')}
            />
          </View>
        </Animated.View>

        {/* Fade gradient — smooth transition from organ section to content */}
        <LinearGradient
          colors={['transparent', Colors.spaceCharcoal]}
          style={styles.contentFade}
        />

        {/* Content Card — slides over the organ section */}
        <View style={styles.contentCard}>
          {/* Stats Section */}
          <View style={styles.statsSection}>
            {/* Milestone Card */}
            <MilestoneCard
              nextMilestone={milestone.next}
              progress={milestone.progress}
              hoursSinceQuit={hoursSinceQuit}
            />

            {/* Credits Saved - Re-added as single prominent card */}
            <StatCard
              icon={
                <DollarSign
                  size={20}
                  color={Colors.healthGreen}
                />
              }
              label="CREDITS SAVED"
              value={`$${moneySaved.toFixed(2)}`}
              color={Colors.healthGreen}
            />

            {/* Health Metrics Section */}
            <View style={styles.metricsContainer}>
              <HealthMetricCard
                label="Oxygen Efficiency"
                value={`${Math.round(oxygenEfficiency * 100)}%`}
                subValue={
                  oxygenEfficiency >= 1
                    ? 'Optimal oxygen uptake restored.'
                    : 'Improving daily. Exercise may feel easier.'
                }
                progress={oxygenEfficiency}
                type="bar"
                icon={
                  <Wind
                    size={18}
                    color={Colors.neonCyan}
                  />
                }
              />

              <HealthMetricCard
                label="Toxin Clearance"
                value={toxinClearance >= 1 ? 'CLEARED' : 'PURGUNG...'}
                subValue={
                  toxinClearance >= 1
                    ? 'Carbon monoxide eliminated from blood.'
                    : 'CO levels dropping. Blood oxygen rising.'
                }
                progress={toxinClearance}
                type="badge"
                icon={
                  <ShieldAlert
                    size={18}
                    color={Colors.damageOrange}
                  />
                }
              />

              <HealthMetricCard
                label="Neural Reset"
                value={`${Math.round(neuralReset * 100)}%`}
                subValue="Dopamine receptors normalizing."
                progress={neuralReset}
                type="progress"
                icon={
                  <Brain
                    size={18}
                    color={Colors.dataBlue}
                  />
                }
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <View style={styles.sosButtonContainer}>
              <LinearGradient
                colors={[Colors.cautionAmber, Colors.damageOrange]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sosButton}
              >
                <Button
                  title="SOS / CRAVING"
                  onPress={() => router.push('/(main)/sos')}
                  variant="ghost"
                  icon={
                    <AlertTriangle
                      size={20}
                      color="#000"
                      strokeWidth={2.5}
                    />
                  }
                  style={styles.sosButtonInner}
                  textStyle={styles.sosButtonText}
                />
              </LinearGradient>
              {/* Glow effect under SOS button */}
              <View style={styles.sosGlow} />
            </View>

            <View style={styles.logsButtonContainer}>
              <Button
                title="Daily Logs"
                onPress={() => router.push('/(main)/logs')}
                variant="secondary"
                icon={
                  <List
                    size={20}
                    color={Colors.white}
                  />
                }
                style={styles.logsButton}
              />
            </View>
          </View>

          {/* Reset Button */}
          <View style={styles.resetContainer}>
            <Button
              title="Reset Bio-Twin System"
              onPress={handleReset}
              variant="ghost"
              textStyle={{ color: Colors.subtleText, fontSize: 10, letterSpacing: 1 }}
            />
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.spaceCharcoal,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  scanBanner: {
    marginHorizontal: 20,
    marginTop: 8,
  },
  scanBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  scanBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.neonCyan,
    letterSpacing: 1.5,
  },
  streakBadge: {
    backgroundColor: Colors.neonCyan,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000',
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    fontVariant: ['tabular-nums'],
  },
  bioTwinContainer: {
    position: 'relative',
    marginTop: 8,
  },
  contentFade: {
    height: 120,
    marginTop: -120,
    zIndex: 1,
  },
  contentCard: {
    backgroundColor: Colors.spaceCharcoal,
    zIndex: 1,
  },
  statsSection: {
    paddingHorizontal: 20,
    gap: 16,
  },
  metricsContainer: {
    gap: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButtons: {
    paddingHorizontal: 20,
    gap: 16,
    marginTop: 32,
    marginBottom: 20,
  },
  sosButtonContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 8,
  },
  sosButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 0, 0.5)',
  },
  sosGlow: {
    position: 'absolute',
    top: 10,
    left: '10%',
    right: '10%',
    height: 40,
    backgroundColor: Colors.cautionAmber,
    opacity: 0.3,
    filter: 'blur(20px)',
    zIndex: -1,
    borderRadius: 20,
  },
  sosButtonInner: {
    width: '100%',
    height: 56,
    backgroundColor: 'transparent',
  },
  sosButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  logsButtonContainer: {
    width: '100%',
  },
  logsButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  resetContainer: {
    marginTop: 12,
    marginBottom: 20,
    alignItems: 'center',
    opacity: 0.5,
  },
})
