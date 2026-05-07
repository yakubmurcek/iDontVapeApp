/**
 * InsightsCard — dashboard surface for pattern insights.
 *
 * Free tier: shows the single strongest insight we've detected.
 * Premium tease: shows a lock with "N more patterns detected — unlock" that
 * fires the `insights_unlock` Superwall placement on tap.
 *
 * When there isn't enough signal yet (< MIN_EVENTS_FOR_INSIGHT tagged
 * cravings), render a coaching placeholder that tells the user how many more
 * taggings they need — turns an empty state into a nudge toward more engagement.
 */

import { Card } from '@/components/ui/Card'
import { Colors } from '@/constants/Colors'
import { useLogsStore } from '@/store/logsStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUserStore } from '@/store/userStore'
import { generateInsights, partitionInsights } from '@/utils/insights'
import { usePlacement } from 'expo-superwall'
import { Lock, Sparkles, TrendingUp } from 'lucide-react-native'
import React, { useMemo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const MIN_TAGGED_FOR_INSIGHTS = 3

export function InsightsCard() {
  const logs = useLogsStore((state) => state.logs)
  const canShowPaywallToday = useSettingsStore((state) => state.canShowPaywallToday)
  const recordPaywallShown = useSettingsStore((state) => state.recordPaywallShown)
  const getDaysSinceQuit = useUserStore((state) => state.getDaysSinceQuit)
  const { registerPlacement } = usePlacement({})

  const { headline, locked, taggedCount } = useMemo(() => {
    const insights = generateInsights(logs)
    const { headline, locked } = partitionInsights(insights)
    const taggedCount = logs.filter(
      (l) =>
        (l.entryType === 'cravingResisted' ||
          l.entryType === 'cravingLost' ||
          l.entryType === 'relapse') &&
        l.trigger,
    ).length
    return { headline, locked, taggedCount }
  }, [logs])

  const handleUnlock = () => {
    // Unlike the day-3 auto-trigger, this placement is user-initiated so we
    // don't gate it behind `canShowPaywallToday` — a user tapping the lock
    // is an explicit conversion intent. We still record the show so other
    // auto-triggers respect the daily cap.
    registerPlacement({
      placement: 'insights_unlock',
      params: {
        locked_insight_count: locked.length,
        days_clean: getDaysSinceQuit(),
      },
    })
    if (canShowPaywallToday()) {
      recordPaywallShown()
    }
  }

  // Empty / not-enough-signal state — nudge toward tagging rather than hiding.
  if (!headline && locked.length === 0) {
    const remaining = Math.max(0, MIN_TAGGED_FOR_INSIGHTS - taggedCount)
    return (
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <Sparkles
            size={16}
            color={Colors.dataBlue}
          />
          <Text style={styles.header}>YOUR PATTERNS</Text>
        </View>
        <Text style={styles.placeholderTitle}>
          {remaining === 0
            ? 'Building insights...'
            : `Tag ${remaining} more craving${remaining === 1 ? '' : 's'} to unlock`}
        </Text>
        <Text style={styles.placeholderBody}>
          When you log cravings with a trigger, we surface patterns you can act on — your top
          trigger, the time of day they spike, what state you&apos;re usually in.
        </Text>
      </Card>
    )
  }

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <Sparkles
          size={16}
          color={Colors.dataBlue}
        />
        <Text style={styles.header}>YOUR PATTERNS</Text>
      </View>

      {headline && (
        <View style={styles.insightBlock}>
          <View style={styles.insightIconRow}>
            <TrendingUp
              size={14}
              color={Colors.neonCyan}
            />
            <Text style={styles.insightTitle}>{headline.title}</Text>
          </View>
          <Text style={styles.insightDetail}>{headline.detail}</Text>
        </View>
      )}

      {locked.length > 0 && (
        <TouchableOpacity
          style={styles.lockedBlock}
          onPress={handleUnlock}
          accessibilityRole="button"
          accessibilityLabel={`Unlock ${locked.length} more insights`}
        >
          <Lock
            size={14}
            color={Colors.cautionAmber}
          />
          <View style={styles.lockedTextBlock}>
            <Text style={styles.lockedTitle}>
              {locked.length} more pattern{locked.length === 1 ? '' : 's'} detected
            </Text>
            <Text style={styles.lockedSubtitle}>Unlock deep insights →</Text>
          </View>
        </TouchableOpacity>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    // inherits Card base styling
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  header: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.dataBlue,
    letterSpacing: 1.4,
  },
  insightBlock: {
    marginBottom: 8,
  },
  insightIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    flex: 1,
  },
  insightDetail: {
    fontSize: 13,
    color: Colors.subtleText,
    lineHeight: 19,
  },
  placeholderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 6,
  },
  placeholderBody: {
    fontSize: 12,
    color: Colors.subtleText,
    lineHeight: 18,
  },
  lockedBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  lockedTextBlock: {
    flex: 1,
  },
  lockedTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.cautionAmber,
  },
  lockedSubtitle: {
    fontSize: 11,
    color: Colors.subtleText,
    marginTop: 2,
  },
})
