/**
 * Dashboard - Main screen with Bio-Twin and stats
 */

import { BioTwinScene } from '@/components/BioTwin/BioTwinScene'
import { HealthMetricCard } from '@/components/Dashboard/HealthMetricCard'
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
import {
  AlertTriangle,
  Brain,
  Clock,
  DollarSign,
  List,
  ShieldAlert,
  Wind,
} from 'lucide-react-native'
import React, { useEffect, useState } from 'react'
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'

export default function Dashboard() {
  const router = useRouter()

  // Superwall paywall placement
  const { registerPlacement } = usePlacement({
    onError: (err) => { if (__DEV__) console.error('Paywall Error:', err) },
    onPresent: (info) => { if (__DEV__) console.log('Paywall Presented:', info) },
    onDismiss: (info, result) => { if (__DEV__) console.log('Paywall Dismissed:', info, 'Result:', result) },
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

  // Show paywall 2 seconds after screen loads
  useEffect(() => {
    const timer = setTimeout(async () => {
      await registerPlacement({ placement: 'campaign_trigger' })
    }, 2000)
    return () => clearTimeout(timer)
  }, [registerPlacement])

  // Force re-render every minute to update time-based computed values
  // (display format is DDd HHh MMm, so per-minute updates are sufficient)
  const [, setTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setTick((t: number) => t + 1), 60000)
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
  const oxygenEfficiency = getOxygenEfficiency()
  const toxinClearance = getToxinClearance()
  const neuralReset = getNeuralReset()

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
