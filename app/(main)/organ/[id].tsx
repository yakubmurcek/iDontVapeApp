/**
 * Organ Deep-Dive - Editorial hero layout with zoom-in transition
 */

import { BloodVessels } from '@/components/BioTwin/BloodVessels'
import { Heart } from '@/components/BioTwin/Heart'
import { Lungs } from '@/components/BioTwin/Lungs'
import { Card } from '@/components/ui/Card'
import { Colors } from '@/constants/Colors'
import {
  formatTimeRemaining,
  getMilestonesByOrgan,
  isMilestoneAchieved,
  OrganType,
} from '@/constants/milestones'
import { PAYWALL_PLACEMENTS } from '@/constants/paywallPlacements'
import { getOrganData } from '@/constants/organData'
import { useSettingsStore } from '@/store/settingsStore'
import { useUserStore } from '@/store/userStore'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { usePlacement } from 'expo-superwall'
import { ArrowLeft, CheckCircle2, Circle, Info } from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

function OrganVisualization({ type, recovery }: { type: OrganType; recovery: number }) {
  switch (type) {
    case 'heart':
      return (
        <Heart
          recoveryProgress={recovery}
          width={180}
          height={180}
        />
      )
    case 'lungs':
      return (
        <Lungs
          recoveryProgress={recovery}
          width={200}
          height={180}
        />
      )
    case 'bloodVessels':
      return (
        <BloodVessels
          recoveryProgress={recovery}
          width={200}
          height={200}
        />
      )
  }
}

export default function OrganDeepDive() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const getHoursSinceQuit = useUserStore((state) => state.getHoursSinceQuit)
  const getOrganRecovery = useUserStore((state) => state.getOrganRecovery)
  const canShowPaywallToday = useSettingsStore((state) => state.canShowPaywallToday)
  const recordPaywallShown = useSettingsStore((state) => state.recordPaywallShown)
  const { registerPlacement } = usePlacement({})

  const handleBack = useCallback(() => {
    if (canShowPaywallToday()) {
      registerPlacement({ placement: PAYWALL_PLACEMENTS.campaignTrigger })
      recordPaywallShown()
    }
    router.back()
  }, [canShowPaywallToday, registerPlacement, recordPaywallShown, router])

  // Tick every 60s so time-based values (milestone ETAs, recovery %) refresh.
  // 5s was excessive — the smallest unit displayed (minutes) only changes every 60s.
  const [, setTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000)
    return () => clearInterval(interval)
  }, [])

  // Screen-level zoom-in transition
  const screenScale = useSharedValue(1.15)
  const screenOpacity = useSharedValue(0)

  useEffect(() => {
    screenScale.value = withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) })
    screenOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const screenEnterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: screenScale.value }],
    opacity: screenOpacity.value,
  }))

  // Hero organ fly-in: starts large + centered, flies right + shrinks to background
  const organTranslateX = useSharedValue(0)
  const organScale = useSharedValue(1.6)
  const organOpacity = useSharedValue(0.8)

  useEffect(() => {
    const timing = { duration: 500, easing: Easing.out(Easing.cubic) }
    organTranslateX.value = withTiming(40, timing)
    organScale.value = withTiming(1, timing)
    organOpacity.value = withTiming(0.35, timing)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const organHeroStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: organTranslateX.value }, { scale: organScale.value }],
    opacity: organOpacity.value,
  }))

  const organType = id as OrganType
  const organ = getOrganData(organType)
  const milestones = getMilestonesByOrgan(organType)
  const hoursSinceQuit = getHoursSinceQuit()
  const recovery = getOrganRecovery(organType)

  if (!organ) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Unknown organ</Text>
      </SafeAreaView>
    )
  }

  const recoveryPercent = Math.round(recovery * 100)

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[{ flex: 1 }, screenEnterStyle]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
          >
            <ArrowLeft
              size={24}
              color={Colors.white}
            />
          </TouchableOpacity>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section — editorial layout */}
          <View style={styles.heroSection}>
            {/* Organ visualization — flies from center to right */}
            <Animated.View style={[styles.heroOrganContainer, organHeroStyle]}>
              <OrganVisualization
                type={organType}
                recovery={recovery}
              />
            </Animated.View>

            {/* Text — fades in after organ starts settling */}
            <Animated.View
              entering={FadeInDown.duration(350).delay(250)}
              style={styles.heroTextContainer}
            >
              <Text style={styles.heroSystemName}>{organ.systemName}</Text>
              <View style={styles.heroRecoveryRow}>
                <Text style={styles.heroRecoveryValue}>{recoveryPercent}</Text>
                <Text style={styles.heroRecoveryUnit}>%</Text>
              </View>
              <Text style={styles.heroRecoveryLabel}>RECOVERY PROGRESS</Text>
            </Animated.View>
          </View>

          {/* Damage Report */}
          <Animated.View entering={FadeInDown.duration(350).delay(300)}>
            <Card
              borderColor="rgba(255, 59, 59, 0.3)"
              style={styles.damageCard}
            >
              <View style={styles.cardHeader}>
                <Info
                  size={16}
                  color={Colors.criticalRed}
                />
                <Text style={styles.damageTitle}>{organ.damageTitle}</Text>
              </View>
              <Text style={styles.damageText}>{organ.damageDescription}</Text>
            </Card>
          </Animated.View>

          {/* Recovery Description */}
          <Animated.View entering={FadeInDown.duration(350).delay(370)}>
            <Card
              borderColor="rgba(0, 255, 136, 0.2)"
              style={styles.recoveryCard}
            >
              <View style={styles.cardHeader}>
                <CheckCircle2
                  size={16}
                  color={Colors.healthGreen}
                />
                <Text style={styles.recoveryTitle}>RECOVERY STATUS</Text>
              </View>
              <Text style={styles.recoveryText}>{organ.recoveryDescription}</Text>
            </Card>
          </Animated.View>

          {/* Recovery Timeline */}
          <Animated.View entering={FadeInDown.duration(350).delay(430)}>
            <Text style={styles.sectionLabel}>RECOVERY TIMELINE</Text>
            <View style={styles.timeline}>
              {milestones.map((milestone, index) => {
                const achieved = isMilestoneAchieved(milestone, hoursSinceQuit)
                const hoursRemaining = milestone.hoursRequired - hoursSinceQuit
                const timeRemaining = formatTimeRemaining(hoursRemaining)

                return (
                  <Animated.View
                    key={milestone.id}
                    entering={FadeInDown.duration(300).delay(470 + index * 60)}
                    style={styles.timelineItem}
                  >
                    {index > 0 && (
                      <View
                        style={[
                          styles.timelineConnector,
                          achieved && styles.timelineConnectorAchieved,
                        ]}
                      />
                    )}
                    <View style={styles.timelineIcon}>
                      {achieved ? (
                        <CheckCircle2
                          size={20}
                          color={Colors.healthGreen}
                        />
                      ) : (
                        <Circle
                          size={20}
                          color={Colors.subtleText}
                        />
                      )}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={[styles.timelineName, achieved && styles.timelineNameAchieved]}>
                        {milestone.displayName}
                      </Text>
                      <Text style={styles.timelineDescription}>{milestone.description}</Text>
                      {!achieved && timeRemaining && (
                        <Text style={styles.timelineEta}>ETA: {timeRemaining}</Text>
                      )}
                      {achieved && <Text style={styles.timelineComplete}>COMPLETE</Text>}
                    </View>
                  </Animated.View>
                )
              })}
            </View>
          </Animated.View>

          {/* Facts */}
          <Animated.View entering={FadeInDown.duration(350).delay(530)}>
            <Text style={styles.sectionLabel}>KEY FACTS</Text>
            <View style={styles.factsContainer}>
              {organ.facts.map((fact, i) => (
                <Card
                  key={i}
                  style={styles.factCard}
                >
                  <Text style={styles.factNumber}>{String(i + 1).padStart(2, '0')}</Text>
                  <Text style={styles.factText}>{fact}</Text>
                </Card>
              ))}
            </View>
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.spaceCharcoal,
  },
  errorText: {
    color: Colors.white,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },

  // Hero section — editorial layout
  heroSection: {
    position: 'relative',
    minHeight: 220,
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  heroOrganContainer: {
    position: 'absolute',
    right: -20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    opacity: 0.35,
  },
  heroTextContainer: {
    zIndex: 2,
    paddingRight: 80,
  },
  heroSystemName: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 2,
    textTransform: 'uppercase',
    lineHeight: 34,
  },
  heroRecoveryRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
  },
  heroRecoveryValue: {
    fontSize: 64,
    fontWeight: '900',
    color: Colors.neonCyan,
    fontVariant: ['tabular-nums'],
    lineHeight: 68,
  },
  heroRecoveryUnit: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.neonCyan,
    marginLeft: 2,
  },
  heroRecoveryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.subtleText,
    letterSpacing: 2,
    marginTop: 4,
  },

  // Cards
  damageCard: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  damageTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.criticalRed,
    letterSpacing: 1.5,
  },
  damageText: {
    fontSize: 14,
    color: Colors.subtleText,
    lineHeight: 22,
  },
  recoveryCard: {
    marginBottom: 24,
  },
  recoveryTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.healthGreen,
    letterSpacing: 1.5,
  },
  recoveryText: {
    fontSize: 14,
    color: Colors.subtleText,
    lineHeight: 22,
  },

  // Timeline
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.subtleText,
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  timeline: {
    marginBottom: 32,
  },
  timelineItem: {
    flexDirection: 'row',
    paddingLeft: 4,
    marginBottom: 20,
    position: 'relative',
  },
  timelineConnector: {
    position: 'absolute',
    left: 13,
    top: -20,
    width: 2,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  timelineConnectorAchieved: {
    backgroundColor: 'rgba(0, 255, 136, 0.3)',
  },
  timelineIcon: {
    marginRight: 14,
    paddingTop: 2,
  },
  timelineContent: {
    flex: 1,
  },
  timelineName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.subtleText,
    marginBottom: 4,
  },
  timelineNameAchieved: {
    color: Colors.white,
  },
  timelineDescription: {
    fontSize: 13,
    color: Colors.subtleText,
    lineHeight: 20,
    marginBottom: 4,
  },
  timelineEta: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.neonCyan,
    letterSpacing: 0.5,
  },
  timelineComplete: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.healthGreen,
    letterSpacing: 1,
  },

  // Facts
  factsContainer: {
    gap: 10,
    marginBottom: 20,
  },
  factCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  factNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.neonCyan,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  factText: {
    flex: 1,
    fontSize: 13,
    color: Colors.subtleText,
    lineHeight: 20,
  },
})
