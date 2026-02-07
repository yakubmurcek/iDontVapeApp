/**
 * MilestoneCard - Displays next milestone with progress
 */

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Check } from 'lucide-react-native'
import { Colors } from '@/constants/Colors'
import { RecoveryMilestone, formatTimeRemaining } from '@/constants/milestones'
import { Card } from '@/components/ui/Card'
import { LinearGradient } from 'expo-linear-gradient'

interface MilestoneCardProps {
  nextMilestone: RecoveryMilestone | null
  progress: number // 0-1
  hoursSinceQuit: number
}

export function MilestoneCard({ nextMilestone, progress, hoursSinceQuit }: MilestoneCardProps) {
  if (!nextMilestone) {
    return (
      <Card
        borderColor="rgba(0, 255, 136, 0.3)"
        style={styles.completedCard}
      >
        <View style={styles.completedContent}>
          <View style={styles.checkIcon}>
            <Check
              size={24}
              color={Colors.healthGreen}
            />
          </View>
          <View style={styles.completedText}>
            <Text style={styles.completedTitle}>ALL MILESTONES ACHIEVED</Text>
            <Text style={styles.completedSubtitle}>Your body continues to heal</Text>
          </View>
        </View>
      </Card>
    )
  }

  const hoursRemaining = nextMilestone.hoursRequired - hoursSinceQuit
  const timeRemaining = formatTimeRemaining(hoursRemaining)

  return (
    <Card borderColor="rgba(0, 240, 255, 0.2)">
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>NEXT MILESTONE</Text>
          <Text style={styles.milestoneName}>{nextMilestone.displayName}</Text>
        </View>
        <View style={styles.etaContainer}>
          <Text style={styles.label}>ETA</Text>
          <Text style={styles.etaValue}>{timeRemaining || 'Soon'}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <LinearGradient
            colors={Colors.recoveryGradient as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progress * 100}%` }]}
          />
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.subtleText,
    letterSpacing: 1,
    marginBottom: 4,
  },
  milestoneName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  etaContainer: {
    alignItems: 'flex-end',
  },
  etaValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neonCyan,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  completedCard: {
    backgroundColor: Colors.cardBackground,
  },
  completedContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: 12,
  },
  completedText: {
    flex: 1,
  },
  completedTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.healthGreen,
    letterSpacing: 1,
  },
  completedSubtitle: {
    fontSize: 14,
    color: Colors.white,
    marginTop: 2,
  },
})
