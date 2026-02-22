/**
 * Organ Deep-Dive - Detailed view of a specific organ's damage and recovery
 */

import { Card } from '@/components/ui/Card'
import { GlowText } from '@/components/ui/GlowText'
import { Colors } from '@/constants/Colors'
import {
  getMilestonesByOrgan,
  isMilestoneAchieved,
  formatTimeRemaining,
  OrganType,
} from '@/constants/milestones'
import { getOrganData } from '@/constants/organData'
import { useSettingsStore } from '@/store/settingsStore'
import { useUserStore } from '@/store/userStore'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { usePlacement } from 'expo-superwall'
import { ArrowLeft, CheckCircle2, Circle, Info } from 'lucide-react-native'
import { useCallback, useEffect, useState } from 'react'
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated'

export default function OrganDeepDive() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const getHoursSinceQuit = useUserStore((state) => state.getHoursSinceQuit)
  const getOrganRecovery = useUserStore((state) => state.getOrganRecovery)
  const canShowPaywallToday = useSettingsStore((state) => state.canShowPaywallToday)
  const recordPaywallShown = useSettingsStore((state) => state.recordPaywallShown)
  const { registerPlacement } = usePlacement({})

  const handleBack = useCallback(() => {
    // Smart paywall: show when exiting organ deep-dive (user has seen value)
    if (canShowPaywallToday()) {
      registerPlacement({ placement: 'campaign_trigger' })
      recordPaywallShown()
    }
    router.back()
  }, [canShowPaywallToday, registerPlacement, recordPaywallShown, router])

  const [, setTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 5000)
    return () => clearInterval(interval)
  }, [])

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
        <Text style={styles.headerTitle}>{organ.name}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* System Name & Recovery */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.systemHeader}
        >
          <GlowText size="sm">{organ.systemName}</GlowText>
          <View style={styles.recoveryRing}>
            <View style={styles.recoveryRingInner}>
              <Text style={styles.recoveryPercent}>{recoveryPercent}</Text>
              <Text style={styles.recoveryUnit}>%</Text>
            </View>
          </View>
          <Text style={styles.recoveryLabel}>RECOVERY PROGRESS</Text>
        </Animated.View>

        {/* Damage Report */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
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
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Card
            borderColor="rgba(0, 255, 136, 0.2)"
            style={styles.recoveryCard}
          >
            <View style={styles.cardHeader}>
              <CheckCircle2
                size={16}
                color={Colors.healthGreen}
              />
              <Text style={styles.recoveryTitle}>RECOVERY PROTOCOL</Text>
            </View>
            <Text style={styles.recoveryText}>{organ.recoveryDescription}</Text>
          </Card>
        </Animated.View>

        {/* Recovery Timeline */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={styles.sectionLabel}>RECOVERY TIMELINE</Text>
          <View style={styles.timeline}>
            {milestones.map((milestone, index) => {
              const achieved = isMilestoneAchieved(milestone, hoursSinceQuit)
              const hoursRemaining = milestone.hoursRequired - hoursSinceQuit
              const timeRemaining = formatTimeRemaining(hoursRemaining)

              return (
                <Animated.View
                  key={milestone.id}
                  entering={FadeInRight.delay(400 + index * 100).duration(300)}
                  style={styles.timelineItem}
                >
                  {/* Timeline connector */}
                  {index > 0 && (
                    <View
                      style={[
                        styles.timelineConnector,
                        achieved && styles.timelineConnectorAchieved,
                      ]}
                    />
                  )}

                  {/* Icon */}
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

                  {/* Content */}
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
        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <Text style={styles.sectionLabel}>SYSTEM FACTS</Text>
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
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  systemHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 16,
  },
  recoveryRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoveryRingInner: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  recoveryPercent: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.neonCyan,
    fontVariant: ['tabular-nums'],
  },
  recoveryUnit: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.neonCyan,
    marginLeft: 2,
  },
  recoveryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.subtleText,
    letterSpacing: 2,
  },
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
