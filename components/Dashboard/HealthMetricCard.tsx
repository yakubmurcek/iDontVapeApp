/**
 * HealthMetricCard - Reusable card for health stats
 */

import { Card } from '@/components/ui/Card'
import { Colors } from '@/constants/Colors'
import { LinearGradient } from 'expo-linear-gradient'
import { Check } from 'lucide-react-native'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export type VisualizationType = 'bar' | 'badge' | 'progress'

interface HealthMetricCardProps {
  label: string
  value: string
  subValue?: string
  progress: number // 0-1
  type: VisualizationType
  icon: React.ReactNode
}

export function HealthMetricCard({
  label,
  value,
  subValue,
  progress,
  type,
  icon,
}: HealthMetricCardProps) {
  const isComplete = progress >= 1

  return (
    <Card
      borderColor={isComplete ? 'rgba(0, 255, 136, 0.4)' : 'rgba(0, 240, 255, 0.15)'}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.headerText}>
          <Text style={styles.label}>{label}</Text>
          <Text style={[styles.value, isComplete && styles.completedValue]}>
            {isComplete ? 'OPTIMIZED' : value}
          </Text>
        </View>
        {isComplete && (
          <View style={styles.checkContainer}>
            <Check
              size={16}
              color={Colors.healthGreen}
            />
          </View>
        )}
      </View>

      {/* Visualization based on type */}
      <View style={styles.visContainer}>
        {type === 'bar' && (
          <View style={styles.barContainer}>
            {/* Segmentation lines */}
            <View style={styles.segmentLines}>
              {[...Array(10)].map((_, i) => (
                <View
                  key={i}
                  style={styles.segmentSeparator}
                />
              ))}
            </View>
            <View style={styles.barBackground}>
              <LinearGradient
                colors={
                  isComplete
                    ? [Colors.healthGreen, Colors.neonCyan]
                    : [Colors.damageOrange, Colors.cautionAmber]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.barFill, { width: `${Math.min(100, progress * 100)}%` }]}
              />
            </View>
          </View>
        )}

        {type === 'progress' && (
          <View style={styles.progressContainer}>
            <View style={styles.track}>
              <View style={[styles.knob, { left: `${Math.min(100, progress * 100)}%` }]} />
              <LinearGradient
                colors={[Colors.neonCyan, 'transparent']}
                start={{ x: 1, y: 0 }}
                end={{ x: 0, y: 0 }}
                style={[styles.trail, { width: `${Math.min(100, progress * 100)}%` }]}
              />
            </View>
          </View>
        )}

        {type === 'badge' && (
          <View style={styles.badgeContainer}>
            <View
              style={[styles.badge, isComplete ? styles.badgeComplete : styles.badgeInProgress]}
            >
              <Text
                style={[
                  styles.badgeText,
                  isComplete ? styles.badgeTextComplete : styles.badgeTextProgress,
                ]}
              >
                {isComplete ? 'CLEARED' : 'PURGUNG...'}
              </Text>
            </View>
          </View>
        )}
      </View>

      {subValue && !isComplete && <Text style={styles.subValue}>{subValue}</Text>}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: Colors.subtleText,
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  completedValue: {
    color: Colors.healthGreen,
  },
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  visContainer: {
    height: 24,
    justifyContent: 'center',
  },
  // Bar Type
  barContainer: {
    height: 12,
    position: 'relative',
    justifyContent: 'center',
  },
  barBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  segmentLines: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    zIndex: 10,
  },
  segmentSeparator: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.spaceCharcoal,
  },
  // Progress Type
  progressContainer: {
    height: 20,
    justifyContent: 'center',
  },
  track: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    borderRadius: 1,
  },
  knob: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.neonCyan,
    position: 'absolute',
    top: -4,
    marginLeft: -5,
    shadowColor: Colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  trail: {
    position: 'absolute',
    height: 2,
    top: 0,
    right: 0,
  },
  // Badge Type
  badgeContainer: {
    alignItems: 'flex-start',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeInProgress: {
    backgroundColor: 'rgba(255, 150, 0, 0.1)',
    borderColor: Colors.cautionAmber,
  },
  badgeComplete: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderColor: Colors.healthGreen,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  badgeTextProgress: {
    color: Colors.cautionAmber,
  },
  badgeTextComplete: {
    color: Colors.healthGreen,
  },
  subValue: {
    fontSize: 11,
    color: Colors.subtleText,
    marginTop: 8,
    fontStyle: 'italic',
  },
})
