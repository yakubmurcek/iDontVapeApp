/**
 * SOS View - Craving help with breathing exercise
 */

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Colors } from '@/constants/Colors'
import { PAYWALL_PLACEMENTS } from '@/constants/paywallPlacements'
import {
  CravingTrigger,
  CRAVING_TRIGGERS,
  HaltState,
  HALT_OPTIONS,
  useLogsStore,
} from '@/store/logsStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUserStore } from '@/store/userStore'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { usePlacement } from 'expo-superwall'
import {
  Candy,
  Droplet,
  Dumbbell,
  Footprints,
  Hand,
  MessageCircle,
  Play,
  Square,
  Waves,
  X,
} from 'lucide-react-native'
import React, { useEffect, useRef, useState } from 'react'
import {
  AppState,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CRAVING_DURATION_MS = 15 * 60 * 1000 // 15 minutes

const CRAVING_TIPS = [
  {
    title: 'Drink ice water',
    desc: 'The cold sensation can distract your brain and reduce cravings.',
    icon: Droplet,
  },
  {
    title: 'Take a walk',
    desc: 'Even 5 minutes of movement releases dopamine naturally.',
    icon: Footprints,
  },
  {
    title: 'Chew gum or mints',
    desc: 'Keeping your mouth busy helps fight the oral fixation.',
    icon: Candy,
  },
  {
    title: 'Text a friend',
    desc: 'Social connection reduces stress and craving intensity.',
    icon: MessageCircle,
  },
  {
    title: 'Do 10 push-ups',
    desc: "Physical exertion redirects your body's energy.",
    icon: Dumbbell,
  },
  {
    title: 'Splash cold water',
    desc: 'Cold water on your face activates the dive reflex, calming nerves.',
    icon: Waves,
  },
]

export default function SOSView() {
  const router = useRouter()
  const addLog = useLogsStore((state) => state.addLog)
  const cravingResistCount = useLogsStore((state) => state.getCravingsResisted())
  const recordPaywallShown = useSettingsStore((state) => state.recordPaywallShown)
  const getDaysSinceQuit = useUserStore((state) => state.getDaysSinceQuit)
  const getMoneySaved = useUserStore((state) => state.getMoneySaved)
  const { registerPlacement } = usePlacement({})

  const [remainingMs, setRemainingMs] = useState(CRAVING_DURATION_MS)
  const [isBreathing, setIsBreathing] = useState(false)
  const [breathPhase, setBreathPhase] = useState('Breathe In')

  // HALT self-check (Hungry/Angry/Lonely/Tired) + trigger tag. Multi-select for
  // HALT (often co-occurring), single-select for trigger (keeps pattern analysis
  // unambiguous — each resist event points to one primary cause).
  const [halt, setHalt] = useState<HaltState[]>([])
  const [trigger, setTrigger] = useState<CravingTrigger | null>(null)

  const toggleHalt = (id: HaltState) => {
    setHalt((prev) => (prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]))
  }

  const breatheScale = useSharedValue(1)
  // Timestamp-based countdown: derive remaining from wall-clock, so the timer
  // stays correct while the app is backgrounded and tick rates throttle.
  const startedAtRef = useRef(Date.now())

  useEffect(() => {
    startedAtRef.current = Date.now()
    setRemainingMs(CRAVING_DURATION_MS)

    const recompute = () => {
      const elapsed = Date.now() - startedAtRef.current
      setRemainingMs(Math.max(0, CRAVING_DURATION_MS - elapsed))
    }

    const interval = setInterval(recompute, 30_000)
    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') recompute()
    })

    return () => {
      clearInterval(interval)
      appStateSub.remove()
    }
  }, [])

  const cravingMinutes = Math.max(0, Math.ceil(remainingMs / 60000))

  // Breathing cycle: track every timeout in a ref so we can cancel on unmount
  // or on user-stop, preventing overlapping cycles that cause phase flicker.
  useEffect(() => {
    if (!isBreathing) return

    const timers: ReturnType<typeof setTimeout>[] = []
    let cancelled = false

    const runCycle = () => {
      if (cancelled) return

      // Breathe in (4s)
      setBreathPhase('Breathe In')
      breatheScale.value = withTiming(1.4, {
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
      })

      timers.push(
        setTimeout(() => {
          if (cancelled) return
          // Hold (7s)
          setBreathPhase('Hold')

          timers.push(
            setTimeout(() => {
              if (cancelled) return
              // Breathe out (8s)
              setBreathPhase('Breathe Out')
              breatheScale.value = withTiming(1, {
                duration: 8000,
                easing: Easing.inOut(Easing.ease),
              })

              timers.push(
                setTimeout(() => {
                  if (!cancelled) runCycle()
                }, 8000),
              )
            }, 7000),
          )
        }, 4000),
      )
    }

    runCycle()

    return () => {
      cancelled = true
      for (const t of timers) clearTimeout(t)
      cancelAnimation(breatheScale)
    }
  }, [isBreathing, breatheScale])

  const breatheStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breatheScale.value }],
  }))

  const toggleBreathing = () => {
    if (isBreathing) {
      setIsBreathing(false)
      setBreathPhase('Breathe In')
      breatheScale.value = withTiming(1, { duration: 300 })
    } else {
      setIsBreathing(true)
    }
  }

  const handleResisted = () => {
    addLog('cravingResisted', {
      trigger: trigger ?? undefined,
      halt: halt.length > 0 ? halt : undefined,
    })

    // Smart paywall: trigger after 3rd craving resisted (user relies on the app).
    // Pass personalized params so Superwall can interpolate them into paywall
    // copy ("You've resisted 3 cravings and saved $X").
    if (cravingResistCount + 1 === 3) {
      registerPlacement({
        placement: PAYWALL_PLACEMENTS.resistMilestone,
        params: {
          resist_count: cravingResistCount + 1,
          days_clean: getDaysSinceQuit(),
          money_saved: Math.round(getMoneySaved() * 100) / 100,
        },
      })
      recordPaywallShown()
    }

    router.back()
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Craving Help</Text>
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Craving Timer */}
        <Card
          borderColor="rgba(255, 184, 0, 0.3)"
          style={styles.timerCard}
        >
          <Text style={styles.timerLabel}>CRAVING WILL FADE IN</Text>
          <View style={styles.timerRow}>
            <Text style={styles.timerValue}>~{cravingMinutes}</Text>
            <Text style={styles.timerUnit}>min</Text>
          </View>
          <Text style={styles.timerSubtext}>
            Most cravings peak at 3-5 minutes and fade within 15-20 minutes
          </Text>
        </Card>

        {/* Breathing Exercise */}
        <Card style={styles.breathingCard}>
          <Text style={styles.sectionTitle}>4-7-8 BREATHING</Text>

          <View style={styles.breathingContainer}>
            {/* Outer ring */}
            <View style={styles.breathRingOuter} />

            {/* Animated circle */}
            <Animated.View style={[styles.breathCircle, breatheStyle]}>
              <LinearGradient
                colors={['rgba(0, 240, 255, 0.4)', 'rgba(0, 240, 255, 0.1)']}
                style={styles.breathGradient}
              />
            </Animated.View>

            {/* Phase text */}
            <Text style={styles.breathPhase}>{breathPhase}</Text>
          </View>

          <TouchableOpacity
            onPress={toggleBreathing}
            style={styles.breathButton}
          >
            {isBreathing ? (
              <Square
                size={20}
                color={Colors.white}
                fill={Colors.white}
              />
            ) : (
              <Play
                size={20}
                color="#000"
                fill="#000"
              />
            )}
            <Text style={[styles.breathButtonText, isBreathing && styles.breathButtonTextAlt]}>
              {isBreathing ? 'Stop' : 'Start Breathing'}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Quick Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionLabel}>QUICK DISTRACTIONS</Text>
          <FlatList
            horizontal
            data={CRAVING_TIPS}
            keyExtractor={(_, i) => i.toString()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tipsList}
            renderItem={({ item }) => (
              <Card style={styles.tipCard}>
                <item.icon
                  size={24}
                  color={Colors.dataBlue}
                />
                <Text style={styles.tipTitle}>{item.title}</Text>
                <Text style={styles.tipDesc}>{item.desc}</Text>
              </Card>
            )}
          />
        </View>

        {/* HALT self-check — Hungry / Angry / Lonely / Tired. Multi-select.
            Shown before "I Resisted" so the tap captures context at the moment
            of resistance rather than requiring a follow-up screen. */}
        <View style={styles.haltSection}>
          <Text style={styles.sectionLabel}>HALT CHECK</Text>
          <Text style={styles.haltHint}>
            Cravings often ride on an underlying state. Tap any that apply.
          </Text>
          <View style={styles.chipRow}>
            {HALT_OPTIONS.map((opt) => {
              const active = halt.includes(opt.id)
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => toggleHalt(opt.id)}
                  style={[styles.chip, active && styles.chipActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Trigger tag — single-select. Feeds the insights engine so the
            dashboard can eventually say "your top trigger is stress". */}
        <View style={styles.triggerSection}>
          <Text style={styles.sectionLabel}>WHAT TRIGGERED THIS?</Text>
          <View style={styles.chipRow}>
            {CRAVING_TRIGGERS.map((opt) => {
              const active = trigger === opt.id
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => setTrigger(active ? null : opt.id)}
                  style={[styles.chip, active && styles.chipActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* I Resisted Button */}
        <View style={styles.resistedContainer}>
          <Button
            title="I Resisted This Craving!"
            onPress={handleResisted}
            icon={
              <Hand
                size={20}
                color="#000"
              />
            }
            fullWidth
          />
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  timerCard: {
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.subtleText,
    letterSpacing: 1,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  timerValue: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.cautionAmber,
  },
  timerUnit: {
    fontSize: 18,
    color: Colors.subtleText,
    marginLeft: 8,
  },
  timerSubtext: {
    fontSize: 12,
    color: Colors.subtleText,
    textAlign: 'center',
    marginTop: 12,
  },
  breathingCard: {
    marginTop: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neonCyan,
    letterSpacing: 1,
    marginBottom: 24,
  },
  breathingContainer: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathRingOuter: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  breathCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
  },
  breathGradient: {
    width: '100%',
    height: '100%',
  },
  breathPhase: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  breathButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.neonCyan,
    borderRadius: 20,
  },
  breathButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  breathButtonTextAlt: {
    color: Colors.white,
  },
  tipsSection: {
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.subtleText,
    letterSpacing: 1,
    marginBottom: 12,
  },
  tipsList: {
    gap: 12,
    paddingRight: 20,
  },
  tipCard: {
    width: SCREEN_WIDTH * 0.55,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginTop: 12,
  },
  tipDesc: {
    fontSize: 12,
    color: Colors.subtleText,
    marginTop: 6,
    lineHeight: 18,
  },
  resistedContainer: {
    marginTop: 32,
  },
  haltSection: {
    marginTop: 24,
  },
  haltHint: {
    fontSize: 12,
    color: Colors.subtleText,
    marginBottom: 10,
    lineHeight: 16,
  },
  triggerSection: {
    marginTop: 20,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  chipActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.14)',
    borderColor: 'rgba(0, 240, 255, 0.55)',
  },
  chipText: {
    fontSize: 13,
    color: Colors.subtleText,
    fontWeight: '500',
  },
  chipTextActive: {
    color: Colors.neonCyan,
    fontWeight: '600',
  },
})
