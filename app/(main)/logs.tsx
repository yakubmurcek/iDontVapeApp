/**
 * Logs View - Recovery log history
 */

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Colors } from '@/constants/Colors'
import { MILESTONES, isMilestoneAchieved } from '@/constants/milestones'
import { LogEntryType, VapingLog, getLogTitle, useLogsStore } from '@/store/logsStore'
import { useUserStore } from '@/store/userStore'
import { useRouter } from 'expo-router'
import { AlertTriangle, CheckCircle, Eye, Hand, RotateCcw, Star, X } from 'lucide-react-native'
import React, { useMemo } from 'react'
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

// Helper to format date
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'TODAY'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'YESTERDAY'
  } else {
    return date
      .toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      .toUpperCase()
  }
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function getLogIconComponent(type: LogEntryType) {
  switch (type) {
    case 'dailyCheckIn':
      return (
        <CheckCircle
          size={20}
          color={Colors.dataBlue}
        />
      )
    case 'milestoneAchieved':
      return (
        <Star
          size={20}
          color={Colors.healthGreen}
        />
      )
    case 'cravingResisted':
      return (
        <Hand
          size={20}
          color={Colors.neonCyan}
        />
      )
    case 'relapse':
      return (
        <AlertTriangle
          size={20}
          color={Colors.criticalRed}
        />
      )
    case 'appOpened':
      return (
        <Eye
          size={20}
          color={Colors.dataBlue}
        />
      )
    default:
      return (
        <CheckCircle
          size={20}
          color={Colors.dataBlue}
        />
      )
  }
}

export default function LogsView() {
  const router = useRouter()

  // User store
  const getDaysSinceQuit = useUserStore((state) => state.getDaysSinceQuit)
  const getHoursSinceQuit = useUserStore((state) => state.getHoursSinceQuit)
  const recordRelapse = useUserStore((state) => state.recordRelapse)

  // Logs store
  const logs = useLogsStore((state) => state.logs)
  const getCravingsResisted = useLogsStore((state) => state.getCravingsResisted)
  const addLog = useLogsStore((state) => state.addLog)

  const daysClean = getDaysSinceQuit()
  const hoursSinceQuit = getHoursSinceQuit()
  const cravingsResisted = getCravingsResisted()

  // Count achieved milestones
  const achievedMilestones = useMemo(() => {
    return MILESTONES.filter((m) => isMilestoneAchieved(m, hoursSinceQuit)).length
  }, [hoursSinceQuit])

  // Group logs by date
  const groupedLogs = useMemo(() => {
    const groups: { [key: string]: VapingLog[] } = {}

    for (const log of logs) {
      const dateKey = new Date(log.timestamp).toDateString()
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(log)
    }

    // Sort by date descending
    return Object.entries(groups)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([dateKey, logs]) => ({
        date: logs[0].timestamp,
        logs,
      }))
  }, [logs])

  const handleRelapse = () => {
    Alert.alert(
      'Log a setback?',
      "This will reset your recovery timer. Remember: setbacks are part of the journey. What matters is that you're back.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, I vaped',
          style: 'destructive',
          onPress: () => {
            recordRelapse()
            addLog('relapse', { note: 'Timer reset - starting fresh' })
          },
        },
      ],
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recovery Log</Text>
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
        {/* Stats Header */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: Colors.healthGreen }]}>{daysClean}</Text>
            <Text style={styles.statLabel}>Days Clean</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: Colors.neonCyan }]}>{cravingsResisted}</Text>
            <Text style={styles.statLabel}>Cravings Beat</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: Colors.dataBlue }]}>{achievedMilestones}</Text>
            <Text style={styles.statLabel}>Milestones</Text>
          </View>
        </View>

        {/* Logs List */}
        {logs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No logs yet</Text>
            <Text style={styles.emptySubtext}>Your recovery journey will be recorded here</Text>
          </View>
        ) : (
          <View style={styles.logsList}>
            {groupedLogs.map(({ date, logs: dayLogs }) => (
              <View
                key={date}
                style={styles.logGroup}
              >
                <Text style={styles.dateHeader}>{formatDate(date)}</Text>

                {dayLogs.map((log) => (
                  <Card
                    key={log.id}
                    style={styles.logCard}
                  >
                    <View style={styles.logRow}>
                      <View style={styles.logIcon}>{getLogIconComponent(log.entryType)}</View>

                      <View style={styles.logContent}>
                        <Text style={styles.logTitle}>
                          {getLogTitle(log.entryType, log.milestoneId)}
                        </Text>
                        {log.note && <Text style={styles.logNote}>{log.note}</Text>}
                      </View>

                      <Text style={styles.logTime}>{formatTime(log.timestamp)}</Text>
                    </View>
                  </Card>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Relapse Button */}
        <View style={styles.relapseContainer}>
          <Button
            title="I vaped..."
            onPress={handleRelapse}
            variant="danger"
            icon={
              <RotateCcw
                size={18}
                color={Colors.criticalRed}
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    color: Colors.subtleText,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  logsList: {
    gap: 24,
  },
  logGroup: {
    gap: 8,
  },
  dateHeader: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.subtleText,
    letterSpacing: 1,
    marginBottom: 4,
    marginTop: 8,
  },
  logCard: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logIcon: {
    width: 32,
    alignItems: 'center',
  },
  logContent: {
    flex: 1,
    marginLeft: 8,
  },
  logTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
  },
  logNote: {
    fontSize: 12,
    color: Colors.subtleText,
    marginTop: 2,
  },
  logTime: {
    fontSize: 12,
    color: Colors.subtleText,
    fontVariant: ['tabular-nums'],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.subtleText,
    marginTop: 8,
  },
  relapseContainer: {
    marginTop: 32,
  },
})
