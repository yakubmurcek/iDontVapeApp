/**
 * Dashboard - Main screen with Bio-Twin and stats
 */

import { BioTwinScene } from '@/components/BioTwin/BioTwinScene'
import { MilestoneCard } from '@/components/Dashboard/MilestoneCard'
import { StatCard } from '@/components/Dashboard/StatCard'
import { SystemAnnotation } from '@/components/Dashboard/SystemAnnotation'
import { Button } from '@/components/ui/Button'
import { GlowText } from '@/components/ui/GlowText'
import { Colors } from '@/constants/Colors'
import { useLogsStore } from '@/store/logsStore'
import { useUserStore } from '@/store/userStore'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { usePlacement } from 'expo-superwall'
import { Activity, AlertTriangle, Clock, DollarSign, List } from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function Dashboard() {
  const router = useRouter()

  // Superwall paywall placement
  const { registerPlacement } = usePlacement({
    onError: (err) => console.error('Paywall Error:', err),
    onPresent: (info) => console.log('Paywall Presented:', info),
    onDismiss: (info, result) => console.log('Paywall Dismissed:', info, 'Result:', result),
  })

  // Subscribe to user store
  const getFormattedTimeSinceQuit = useUserStore((state) => state.getFormattedTimeSinceQuit)
  const getSystemIntegrity = useUserStore((state) => state.getSystemIntegrity)
  const getMoneySaved = useUserStore((state) => state.getMoneySaved)
  const getCurrentMilestone = useUserStore((state) => state.getCurrentMilestone)
  const getHoursSinceQuit = useUserStore((state) => state.getHoursSinceQuit)
  const getLungRecovery = useUserStore((state) => state.getLungRecovery)
  const getHeartRecovery = useUserStore((state) => state.getHeartRecovery)

  // Show paywall 2 seconds after screen loads
  useEffect(() => {
    const timer = setTimeout(async () => {
      await registerPlacement({ placement: 'campaign_trigger' })
    }, 2000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Force re-render every second to update time-based computed values
  const [, setTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setTick((t: number) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  // Get computed values
  const formattedTime = getFormattedTimeSinceQuit()
  const systemIntegrity = getSystemIntegrity()
  const moneySaved = getMoneySaved()
  const milestone = getCurrentMilestone()
  const hoursSinceQuit = getHoursSinceQuit()
  const lungRecovery = getLungRecovery()
  const heartRecovery = getHeartRecovery()

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
          />

          {/* Lung Recovery Annotation */}
          <SystemAnnotation
            score={lungRecovery}
            label="LUNG RECOVERY"
            size={65}
            position="right"
            style={{ top: 125 }}
          />

          {/* Heart Recovery Annotation */}
          <SystemAnnotation
            score={heartRecovery}
            label="HEART RECOVERY"
            size={65}
            position="left"
            style={{ top: 85 }}
          />
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          {/* Milestone Card */}
          <MilestoneCard
            nextMilestone={milestone.next}
            progress={milestone.progress}
            hoursSinceQuit={hoursSinceQuit}
          />

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
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
            <StatCard
              icon={
                <Activity
                  size={20}
                  color={Colors.neonCyan}
                />
              }
              label="SYSTEM INTEGRITY"
              value={`${Math.round(systemIntegrity * 100)}%`}
              color={Colors.neonCyan}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <View style={styles.sosButtonContainer}>
            <LinearGradient
              colors={[Colors.cautionAmber, Colors.damageOrange]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sosButton}
            >
              <Button
                title="SOS"
                onPress={() => router.push('/(main)/sos')}
                variant="ghost"
                icon={
                  <AlertTriangle
                    size={20}
                    color="#000"
                  />
                }
                style={styles.sosButtonInner}
                textStyle={styles.sosButtonText}
              />
            </LinearGradient>
          </View>

          <View style={styles.logsButtonContainer}>
            <Button
              title="Logs"
              onPress={() => router.push('/(main)/logs')}
              variant="secondary"
              icon={
                <List
                  size={20}
                  color={Colors.white}
                />
              }
              fullWidth
            />
          </View>
        </View>

        {/* Reset Button */}
        <View style={styles.resetContainer}>
          <Button
            title="Reset App Data"
            onPress={handleReset}
            variant="ghost"
            textStyle={{ color: Colors.damageOrange, fontSize: 12 }}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
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

  statsSection: {
    paddingHorizontal: 20,
    gap: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginTop: 24,
  },
  sosButtonContainer: {
    flex: 1,
  },
  sosButton: {
    borderRadius: 14,
    shadowColor: Colors.cautionAmber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  sosButtonInner: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  sosButtonText: {
    color: '#000',
  },
  logsButtonContainer: {
    flex: 1,
  },
  resetContainer: {
    marginTop: 24,
    marginBottom: 8,
    alignItems: 'center',
    opacity: 0.6,
  },
})
