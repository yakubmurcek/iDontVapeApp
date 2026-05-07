/**
 * Dashboard - Main screen with Bio-Twin and stats
 */

import { BioTwinScene } from '@/components/BioTwin/BioTwinScene'
import { MilestoneCelebration } from '@/components/Celebration/MilestoneCelebration'
import { HealthMetricCard } from '@/components/Dashboard/HealthMetricCard'
import { InsightsCard } from '@/components/Dashboard/InsightsCard'
import { MilestoneCard } from '@/components/Dashboard/MilestoneCard'
import { QuitFundCard } from '@/components/Dashboard/QuitFundCard'
import { SystemAnnotation } from '@/components/Dashboard/SystemAnnotation'
import { Button } from '@/components/ui/Button'
import { GlowText } from '@/components/ui/GlowText'
import { Colors } from '@/constants/Colors'
import { RecoveryMilestone } from '@/constants/milestones'
import { PAYWALL_PLACEMENTS } from '@/constants/paywallPlacements'
import { useScanStore } from '@/store/scanStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUserStore } from '@/store/userStore'
import { resetAppData } from '@/utils/appReset'
import { refreshWidget } from '@/utils/widgetData'
import { LinearGradient } from 'expo-linear-gradient'
import { Href, useRouter } from 'expo-router'
import { usePlacement } from 'expo-superwall'
import {
  Activity,
  AlertTriangle,
  Brain,
  Clock,
  List,
  Share2,
  ShieldAlert,
  Snowflake,
  Wind,
} from 'lucide-react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Alert,
  AppState,
  AppStateStatus,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
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
  const streakFreezes = useScanStore((state) => state.streakFreezes)

  // Settings store (paywall rate limiting)
  const canShowPaywallToday = useSettingsStore((state) => state.canShowPaywallToday)
  const recordPaywallShown = useSettingsStore((state) => state.recordPaywallShown)
  const getDaysSinceQuit = useUserStore((state) => state.getDaysSinceQuit)

  // Milestone celebration state
  const [celebratingMilestone, setCelebratingMilestone] = useState<RecoveryMilestone | null>(null)
  const [pendingCelebrations, setPendingCelebrations] = useState<RecoveryMilestone[]>([])

  // Force re-render every minute to update time-based computed values
  // (display format is DDd HHh MMm, so per-minute updates are sufficient)
  const [tick, setTick] = useState(0)
  const appState = useRef<AppStateStatus>(AppState.currentState)
  useEffect(() => {
    const interval = setInterval(() => setTick((t: number) => t + 1), 60000)
    return () => clearInterval(interval)
  }, [])
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        setTick((t: number) => t + 1)
      }
      appState.current = nextState
    })

    return () => subscription.remove()
  }, [])

  // Smart paywall: show on dashboard load only after day 3 (user has invested time).
  // Record "shown for today" BEFORE the timer so a fast remount (navigate away and
  // back within 3s) can't schedule two placements — the second mount sees the gate
  // closed. We accept that a user who bounces off in <3s just misses today's paywall.
  //
  // Depends on `tick` so a user who keeps the dashboard open across the day 2 → 3
  // transition still sees the placement on the next minute tick. canShowPaywallToday()
  // and recordPaywallShown() make subsequent ticks idempotent within the same day.
  useEffect(() => {
    const daysSinceQuit = getDaysSinceQuit()
    if (daysSinceQuit >= 3 && canShowPaywallToday()) {
      recordPaywallShown()
      const timer = setTimeout(() => {
        void registerPlacement({
          placement: PAYWALL_PLACEMENTS.campaignTrigger,
          params: {
            days_clean: daysSinceQuit,
            money_saved: Math.round(getMoneySaved() * 100) / 100,
            streak: scanStreak,
          },
        })
      }, 3000)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick])

  // Check for newly achieved milestones. Depend on `tick` so that a milestone
  // rolling over while the dashboard stays open still fires a celebration.
  useEffect(() => {
    if (celebratingMilestone) return
    const newMilestones = getNewlyAchievedMilestones()
    if (newMilestones.length > 0) {
      setPendingCelebrations(newMilestones)
      setCelebratingMilestone(newMilestones[0])
    }
  }, [tick, celebratingMilestone, getNewlyAchievedMilestones])

  // Keep widget payload fresh whenever the dashboard is visited or time ticks.
  // No-op until native widgets are wired (see utils/widgetData.ts).
  useEffect(() => {
    void refreshWidget()
  }, [tick])

  const handleCelebrationDismiss = useCallback(() => {
    if (celebratingMilestone) {
      markMilestoneCelebrated(celebratingMilestone.id)
    }

    // Show next pending celebration or close
    const remaining = pendingCelebrations.slice(1)
    if (remaining.length > 0) {
      setPendingCelebrations(remaining)
      setCelebratingMilestone(remaining[0])
    } else {
      setPendingCelebrations([])
      setCelebratingMilestone(null)
      // Earned-context paywall fires once at the end of the celebration queue.
      // Firing on every dismissal would stack N paywalls on a binge-open user
      // (e.g. someone who returns after a long absence with several milestones
      // earned at once) — that lands as upsell-spam during a vulnerable moment.
      void registerPlacement({ placement: PAYWALL_PLACEMENTS.campaignTrigger })
      recordPaywallShown()
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

  // Share my progress — text-only share (no view-shot dep, works in managed
  // Expo). Deliberately written as something a user would actually send: short,
  // concrete numbers, no corporate branding. We include a referral-ish line
  // only if there's real progress to share (≥1 day); before that it reads
  // tryhard.
  const handleShare = useCallback(async () => {
    const days = getDaysSinceQuit()
    const money = Math.round(getMoneySaved())
    const streak = scanStreak

    const parts: string[] = []
    if (days >= 1) {
      parts.push(`${days} day${days === 1 ? '' : 's'} without vaping.`)
    } else {
      parts.push(`Day 1 — I'm done vaping.`)
    }
    if (money > 0) parts.push(`$${money} saved.`)
    if (streak >= 2) parts.push(`${streak}-day check-in streak.`)
    parts.push(`One breath at a time.`)

    const message = parts.join(' ')

    try {
      await Share.share({ message })
    } catch (err) {
      if (__DEV__) console.error('[share] failed:', err)
    }
  }, [getDaysSinceQuit, getMoneySaved, scanStreak])

  const handleReset = () => {
    Alert.alert(
      'Erase all data and start over?',
      'This permanently deletes your quit date, recovery progress, logs, scans, and settings. You will be returned to onboarding. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase Everything',
          style: 'destructive',
          onPress: async () => {
            await resetAppData()
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
              visualMode="hologram"
              showFrame={false}
              animateFrame={false}
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

            {/* Quit Fund — visceral money with goal progress */}
            <QuitFundCard moneySaved={moneySaved} />

            {/* Pattern Insights — free headline + paywalled rest */}
            <InsightsCard />

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
                value={toxinClearance >= 1 ? 'CLEARED' : 'PURGING...'}
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
            {scanAvailable && (
              <TouchableOpacity
                style={styles.scanBannerReachable}
                onPress={() => router.push('/(main)/scan' as Href)}
              >
                <LinearGradient
                  colors={['rgba(10, 35, 44, 0.9)', 'rgba(8, 25, 33, 0.9)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.scanBannerGradient}
                >
                  <View style={styles.scanBannerLeft}>
                    <Activity
                      size={15}
                      color={Colors.neonCyan}
                    />
                    <View style={styles.scanBannerTextWrap}>
                      <View style={styles.scanBannerTitleRow}>
                        <Text style={styles.scanBannerText}>Daily Scan Ready</Text>
                        {scanStreak > 0 && (
                          <View style={styles.streakBadge}>
                            <Text style={styles.streakText}>{scanStreak}</Text>
                          </View>
                        )}
                        {streakFreezes > 0 && (
                          <View style={styles.freezeBadge}>
                            <Snowflake
                              size={10}
                              color="#000"
                              strokeWidth={3}
                            />
                            <Text style={styles.freezeText}>{streakFreezes}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.scanBannerSubtext}>
                        Check today&apos;s recovery changes
                      </Text>
                    </View>
                  </View>
                  <View style={styles.scanBannerAction}>
                    <Text style={styles.scanBannerActionText}>Run</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}

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

            {/* Share my progress — low-key link-level button. Organic word-of-
                mouth is our cheapest acquisition channel; surface it once the
                user has a streak or clean days to show off, without nagging. */}
            <TouchableOpacity
              onPress={handleShare}
              style={styles.shareButton}
              accessibilityRole="button"
              accessibilityLabel="Share my progress"
            >
              <Share2
                size={14}
                color={Colors.subtleText}
              />
              <Text style={styles.shareButtonText}>Share my progress</Text>
            </TouchableOpacity>
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
    backgroundColor: '#090B10',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  scanBanner: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 6,
  },
  scanBannerReachable: {
    width: '100%',
    marginBottom: 4,
  },
  scanBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.16)',
  },
  scanBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  scanBannerTextWrap: {
    flexShrink: 1,
  },
  scanBannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scanBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.neonCyan,
    letterSpacing: 0.3,
  },
  scanBannerSubtext: {
    marginTop: 1,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.62)',
  },
  streakBadge: {
    backgroundColor: Colors.neonCyan,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#000',
  },
  freezeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#A8DFFF',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    justifyContent: 'center',
  },
  freezeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#000',
  },
  scanBannerAction: {
    marginLeft: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 240, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.22)',
  },
  scanBannerActionText: {
    color: Colors.neonCyan,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
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
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 4,
  },
  shareButtonText: {
    fontSize: 12,
    color: Colors.subtleText,
    fontWeight: '500',
  },
  resetContainer: {
    marginTop: 12,
    marginBottom: 20,
    alignItems: 'center',
    opacity: 0.5,
  },
})
