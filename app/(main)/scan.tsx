/**
 * Daily Scan - Bio-Twin system diagnostic with recovery deltas
 */

import { GlowText } from '@/components/ui/GlowText'
import { Colors } from '@/constants/Colors'
import { PAYWALL_PLACEMENTS } from '@/constants/paywallPlacements'
import { ScanMetrics, ScanResult, useScanStore } from '@/store/scanStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUserStore } from '@/store/userStore'
import { scheduleInactivityWarning, scheduleStreakAtRiskAlert } from '@/utils/notifications'
import { refreshWidget } from '@/utils/widgetData'
import { usePlacement } from 'expo-superwall'
import * as Haptics from 'expo-haptics'
import { Href, useRouter } from 'expo-router'
import { Snowflake, X } from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

type ScanPhase = 'scanning' | 'results' | 'complete'

const METRIC_LABELS: { key: keyof ScanMetrics; label: string; unit: string }[] = [
  { key: 'systemIntegrity', label: 'System Integrity', unit: '%' },
  { key: 'lungRecovery', label: 'Lung Recovery', unit: '%' },
  { key: 'heartRecovery', label: 'Heart Recovery', unit: '%' },
  { key: 'oxygenEfficiency', label: 'Oxygen Efficiency', unit: '%' },
  { key: 'toxinClearance', label: 'Toxin Clearance', unit: '%' },
  { key: 'neuralReset', label: 'Neural Reset', unit: '%' },
]

function ScanMetricRow({
  label,
  value,
  delta,
  unit,
  index,
}: {
  label: string
  value: number
  delta: number
  unit: string
  index: number
}) {
  const deltaText =
    delta > 0 ? `+${(delta * 100).toFixed(1)}${unit}` : `${(delta * 100).toFixed(1)}${unit}`
  const deltaColor =
    delta > 0 ? Colors.healthGreen : delta < 0 ? Colors.criticalRed : Colors.subtleText

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 150).duration(400)}
      style={styles.metricRow}
    >
      <View style={styles.metricInfo}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>
          {Math.round(value * 100)}
          {unit}
        </Text>
      </View>
      <View style={styles.metricBar}>
        <View style={[styles.metricBarFill, { width: `${Math.min(value * 100, 100)}%` }]} />
      </View>
      {delta !== 0 && <Text style={[styles.metricDelta, { color: deltaColor }]}>{deltaText}</Text>}
    </Animated.View>
  )
}

export default function ScanScreen() {
  const router = useRouter()
  const [phase, setPhase] = useState<ScanPhase>('scanning')
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [currentMetrics, setCurrentMetrics] = useState<ScanMetrics | null>(null)

  const performScan = useScanStore((state) => state.performScan)
  const hasScanAvailableToday = useScanStore((state) => state.hasScanAvailableToday)
  const streakFreezes = useScanStore((state) => state.streakFreezes)
  const notificationsEnabled = useSettingsStore((state) => state.notificationsEnabled)
  const canShowPaywallToday = useSettingsStore((state) => state.canShowPaywallToday)
  const recordPaywallShown = useSettingsStore((state) => state.recordPaywallShown)
  const getDaysSinceQuit = useUserStore((state) => state.getDaysSinceQuit)
  const getSystemIntegrity = useUserStore((state) => state.getSystemIntegrity)
  const getLungRecovery = useUserStore((state) => state.getLungRecovery)
  const getHeartRecovery = useUserStore((state) => state.getHeartRecovery)
  const getOxygenEfficiency = useUserStore((state) => state.getOxygenEfficiency)
  const getToxinClearance = useUserStore((state) => state.getToxinClearance)
  const getNeuralReset = useUserStore((state) => state.getNeuralReset)

  const { registerPlacement } = usePlacement({})

  // Scan animation
  const scanProgress = useSharedValue(0)
  const scanPulse = useSharedValue(1)

  useEffect(() => {
    // Guard: if a scan has already been run today, don't replay the animation or
    // re-invoke performScan — bounce back to the dashboard. On a cold launch via
    // notification tap there's no back stack, so fall through to a replace.
    if (!hasScanAvailableToday()) {
      if (router.canGoBack()) {
        router.back()
      } else {
        router.replace('/(main)' as Href)
      }
      return
    }

    // Start scan animation
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    scanProgress.value = withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
    scanPulse.value = withRepeat(
      withSequence(withTiming(1.05, { duration: 500 }), withTiming(0.95, { duration: 500 })),
      -1,
      true,
    )

    // Complete scan after animation
    const timer = setTimeout(() => {
      const metrics: ScanMetrics = {
        systemIntegrity: getSystemIntegrity(),
        lungRecovery: getLungRecovery(),
        heartRecovery: getHeartRecovery(),
        oxygenEfficiency: getOxygenEfficiency(),
        toxinClearance: getToxinClearance(),
        neuralReset: getNeuralReset(),
      }
      setCurrentMetrics(metrics)
      const result = performScan(metrics)
      setScanResult(result)
      setPhase('results')
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      // Scan completion is the highest-value moment to refresh the widget.
      void refreshWidget()
      if (notificationsEnabled) {
        scheduleInactivityWarning().catch((e) => {
          if (__DEV__) console.error('[notifications] inactivity warning failed:', e)
        })
        // Loss-aversion push: at-risk alert fires 8pm tomorrow unless the user
        // scans again first (which will cancel + reschedule with the new count).
        scheduleStreakAtRiskAlert(result.streak).catch((e) => {
          if (__DEV__) console.error('[notifications] streak-at-risk failed:', e)
        })
      }
      // Premium feature moment: if a freeze was consumed, fire the `streak_saved`
      // placement. The user just felt the benefit viscerally — best possible time
      // to show a paywall that emphasizes the freeze entitlement. Still respects
      // the daily cap since this auto-triggers without explicit intent.
      if (result.freezeConsumed && canShowPaywallToday()) {
        void registerPlacement({
          placement: PAYWALL_PLACEMENTS.streakSaved,
          params: {
            streak: result.streak,
            days_clean: getDaysSinceQuit(),
            remaining_freezes: streakFreezes - 1,
          },
        })
        recordPaywallShown()
      }
    }, 3000)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scanProgressStyle = useAnimatedStyle(() => ({
    width: `${scanProgress.value * 100}%` as `${number}%`,
  }))

  const scanPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scanPulse.value }],
  }))

  const getMotivationalMessage = useCallback(() => {
    if (!scanResult) return ''
    if (scanResult.isFirstScan) return 'First scan complete. Your baseline has been established.'
    const totalDelta = Object.values(scanResult.deltas).reduce((sum, d) => sum + d, 0)
    if (totalDelta > 0.1) return 'Significant recovery detected. Your body is healing fast.'
    if (totalDelta > 0) return 'Progress detected. Every hour clean counts.'
    return 'Holding steady. Stay the course.'
  }, [scanResult])

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>System Diagnostic</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <X
            size={24}
            color={Colors.white}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {phase === 'scanning' && (
          <View style={styles.scanningContainer}>
            <Animated.View style={[styles.scanCircle, scanPulseStyle]}>
              <View style={styles.scanCircleInner}>
                <GlowText size="sm">SCANNING</GlowText>
              </View>
            </Animated.View>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, scanProgressStyle]} />
            </View>
            <Text style={styles.scanSubtext}>Analyzing Bio-Twin recovery metrics...</Text>
          </View>
        )}

        {phase === 'results' && currentMetrics && scanResult && (
          <View style={styles.resultsContainer}>
            <Animated.View entering={FadeInDown.duration(400)}>
              <GlowText
                size="sm"
                color={Colors.healthGreen}
              >
                SCAN COMPLETE
              </GlowText>
            </Animated.View>

            {/* Streak */}
            {scanResult.streak > 0 && (
              <Animated.View
                entering={FadeInDown.delay(100).duration(400)}
                style={styles.streakContainer}
              >
                <Text style={styles.streakLabel}>CHECK-IN STREAK</Text>
                <Text style={styles.streakValue}>{scanResult.streak}</Text>
                <Text style={styles.streakDays}>day{scanResult.streak === 1 ? '' : 's'}</Text>
              </Animated.View>
            )}

            {/* Freeze-consumed celebration — only shown when a streak freeze
                just saved the user's streak. Intentionally loud so the user
                feels the premium benefit; the streak_saved paywall fires
                alongside this in useEffect. */}
            {scanResult.freezeConsumed && (
              <Animated.View
                entering={FadeInDown.delay(150).duration(400)}
                style={styles.freezeBanner}
              >
                <Snowflake
                  size={20}
                  color="#A8DFFF"
                />
                <View style={styles.freezeTextBlock}>
                  <Text style={styles.freezeTitle}>Streak saved with a freeze</Text>
                  <Text style={styles.freezeSubtitle}>
                    You missed yesterday, but your {scanResult.streak}-day streak is still alive.
                  </Text>
                </View>
              </Animated.View>
            )}

            {/* Metrics */}
            <View style={styles.metricsContainer}>
              {METRIC_LABELS.map((metric, i) => (
                <ScanMetricRow
                  key={metric.key}
                  label={metric.label}
                  value={currentMetrics[metric.key]}
                  delta={scanResult.deltas[metric.key]}
                  unit={metric.unit}
                  index={i}
                />
              ))}
            </View>

            {/* Motivational message */}
            <Animated.View entering={FadeInDown.delay(1000).duration(600)}>
              <Text style={styles.motivationalText}>{getMotivationalMessage()}</Text>
            </Animated.View>

            {/* Done button */}
            <Animated.View entering={FadeInDown.delay(1200).duration(400)}>
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => router.back()}
              >
                <Text style={styles.doneButtonText}>DONE</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.spaceCharcoal,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    padding: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  scanningContainer: {
    alignItems: 'center',
    gap: 32,
  },
  scanCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanCircleInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 240, 255, 0.03)',
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.neonCyan,
    borderRadius: 2,
  },
  scanSubtext: {
    fontSize: 12,
    color: Colors.subtleText,
    letterSpacing: 0.5,
  },
  resultsContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingTop: 24,
    gap: 20,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  streakLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.subtleText,
    letterSpacing: 1,
  },
  streakValue: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.neonCyan,
  },
  streakDays: {
    fontSize: 14,
    color: Colors.subtleText,
  },
  freezeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(168, 223, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(168, 223, 255, 0.35)',
    width: '100%',
  },
  freezeTextBlock: {
    flex: 1,
  },
  freezeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#A8DFFF',
  },
  freezeSubtitle: {
    fontSize: 12,
    color: Colors.subtleText,
    marginTop: 2,
    lineHeight: 16,
  },
  metricsContainer: {
    width: '100%',
    gap: 12,
  },
  metricRow: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  metricInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 13,
    color: Colors.subtleText,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 15,
    color: Colors.white,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  metricBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    backgroundColor: Colors.neonCyan,
    borderRadius: 2,
  },
  metricDelta: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },
  motivationalText: {
    fontSize: 14,
    color: Colors.subtleText,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  doneButton: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    borderRadius: 24,
    paddingHorizontal: 48,
    paddingVertical: 14,
    marginTop: 8,
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.neonCyan,
    letterSpacing: 2,
  },
})
