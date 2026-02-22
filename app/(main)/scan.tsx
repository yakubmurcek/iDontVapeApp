/**
 * Daily Scan - Bio-Twin system diagnostic with recovery deltas
 */

import { GlowText } from '@/components/ui/GlowText'
import { Colors } from '@/constants/Colors'
import { useScanStore, ScanMetrics, ScanResult } from '@/store/scanStore'
import { useUserStore } from '@/store/userStore'
import * as Haptics from 'expo-haptics'
import { useRouter } from 'expo-router'
import { X } from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

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
  const getSystemIntegrity = useUserStore((state) => state.getSystemIntegrity)
  const getLungRecovery = useUserStore((state) => state.getLungRecovery)
  const getHeartRecovery = useUserStore((state) => state.getHeartRecovery)
  const getOxygenEfficiency = useUserStore((state) => state.getOxygenEfficiency)
  const getToxinClearance = useUserStore((state) => state.getToxinClearance)
  const getNeuralReset = useUserStore((state) => state.getNeuralReset)

  // Scan animation
  const scanProgress = useSharedValue(0)
  const scanPulse = useSharedValue(1)

  useEffect(() => {
    // Start scan animation
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
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
                DIAGNOSTIC COMPLETE
              </GlowText>
            </Animated.View>

            {/* Streak */}
            {scanResult.streak > 0 && (
              <Animated.View
                entering={FadeInDown.delay(100).duration(400)}
                style={styles.streakContainer}
              >
                <Text style={styles.streakLabel}>SCAN STREAK</Text>
                <Text style={styles.streakValue}>{scanResult.streak}</Text>
                <Text style={styles.streakDays}>day{scanResult.streak === 1 ? '' : 's'}</Text>
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
