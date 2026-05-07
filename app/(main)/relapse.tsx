/**
 * Relapse Compassion Flow
 *
 * Replaces the silent `recordRelapse()` flow with a three-step, non-judgmental
 * capture: (1) what triggered it, (2) what would you do differently, (3)
 * re-commit. Treats relapse as data + a re-engagement moment rather than a
 * failure, which is the highest-leverage retention change we can make — the
 * majority of successful quit attempts involve multiple relapses, and users
 * who don't re-engage after one churn permanently.
 */

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Colors } from '@/constants/Colors'
import { PAYWALL_PLACEMENTS } from '@/constants/paywallPlacements'
import { CravingTrigger, CRAVING_TRIGGERS, useLogsStore } from '@/store/logsStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUserStore } from '@/store/userStore'
import { useRouter } from 'expo-router'
import { usePlacement } from 'expo-superwall'
import { ArrowLeft, Heart, RefreshCw, X } from 'lucide-react-native'
import React, { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

type Step = 'trigger' | 'journal' | 'recommit'

const MAX_JOURNAL_LENGTH = 500

export default function RelapseFlow() {
  const router = useRouter()

  const recordRelapse = useUserStore((state) => state.recordRelapse)
  const addLog = useLogsStore((state) => state.addLog)
  const getRelapseCount = useLogsStore((state) => state.getRelapseCount)
  const canShowPaywallToday = useSettingsStore((state) => state.canShowPaywallToday)
  const recordPaywallShown = useSettingsStore((state) => state.recordPaywallShown)
  const { registerPlacement } = usePlacement({})

  const [step, setStep] = useState<Step>('trigger')
  const [trigger, setTrigger] = useState<CravingTrigger | null>(null)
  const [journal, setJournal] = useState('')

  const close = () => router.back()

  const goNext = () => {
    if (step === 'trigger') setStep('journal')
    else if (step === 'journal') setStep('recommit')
  }

  const goBack = () => {
    if (step === 'journal') setStep('trigger')
    else if (step === 'recommit') setStep('journal')
  }

  const finalize = () => {
    const context = {
      trigger: trigger ?? undefined,
      journal: journal.trim() ? journal.trim() : undefined,
    }

    // Capture relapse count BEFORE recording so the paywall trigger compares
    // against the pre-relapse count.
    const previousRelapseCount = getRelapseCount()

    recordRelapse(context)
    addLog('relapse', {
      note: context.journal,
      trigger: context.trigger as CravingTrigger | undefined,
    })

    // "Break the cycle" placement on the 2nd and later relapses. The first
    // relapse gets the flow with no paywall — piling a paywall on top of a
    // vulnerable moment is the wrong move. By the second one, it's a pattern
    // the user likely wants help breaking.
    if (previousRelapseCount >= 1 && canShowPaywallToday()) {
      recordPaywallShown()
      void registerPlacement({
        placement: PAYWALL_PLACEMENTS.relapseCycle,
        params: {
          relapse_count: previousRelapseCount + 1,
          last_trigger: context.trigger ?? 'unknown',
        },
      })
    }

    router.back()
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          {step !== 'trigger' ? (
            <TouchableOpacity
              onPress={goBack}
              style={styles.headerLeftButton}
            >
              <ArrowLeft
                size={22}
                color={Colors.white}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerLeftButton} />
          )}

          <Text style={styles.headerTitle}>
            {step === 'trigger'
              ? "You're still here"
              : step === 'journal'
                ? 'Learn from it'
                : 'Restart'}
          </Text>

          <TouchableOpacity
            onPress={close}
            style={styles.closeButton}
          >
            <X
              size={22}
              color={Colors.white}
            />
          </TouchableOpacity>
        </View>

        {/* Step indicator */}
        <View style={styles.stepDots}>
          {(['trigger', 'journal', 'recommit'] as Step[]).map((s) => (
            <View
              key={s}
              style={[styles.dot, step === s && styles.dotActive]}
            />
          ))}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'trigger' && (
            <>
              <Card style={styles.leadCard}>
                <Text style={styles.leadTitle}>Slipping happens.</Text>
                <Text style={styles.leadBody}>
                  Most people who successfully quit relapse several times first. What matters is
                  that you opened the app. Let&apos;s turn this into information.
                </Text>
              </Card>

              <Text style={styles.sectionLabel}>WHAT SET IT OFF?</Text>
              <Text style={styles.sectionHint}>Optional. Helps spot patterns over time.</Text>
              <View style={styles.chipRow}>
                {CRAVING_TRIGGERS.map((opt) => {
                  const active = trigger === opt.id
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => setTrigger(active ? null : opt.id)}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </>
          )}

          {step === 'journal' && (
            <>
              <Card style={styles.leadCard}>
                <Text style={styles.leadTitle}>What would you do differently?</Text>
                <Text style={styles.leadBody}>
                  A single sentence is enough. Future-you will read this the next time a craving
                  hits.
                </Text>
              </Card>

              <TextInput
                value={journal}
                onChangeText={(t) => setJournal(t.slice(0, MAX_JOURNAL_LENGTH))}
                placeholder="e.g. Next time I'm stressed after work, I'll go for a walk before I open anything."
                placeholderTextColor={Colors.subtleText}
                style={styles.textInput}
                multiline
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>
                {journal.length}/{MAX_JOURNAL_LENGTH}
              </Text>
            </>
          )}

          {step === 'recommit' && (
            <>
              <Card style={styles.leadCard}>
                <View style={styles.recommitIconRow}>
                  <Heart
                    size={28}
                    color={Colors.healthGreen}
                  />
                </View>
                <Text style={styles.leadTitle}>Ready to restart the clock?</Text>
                <Text style={styles.leadBody}>
                  Your recovery timer will reset. Your history, insights, and streak freezes stay.
                  You&apos;re still here — that&apos;s what counts.
                </Text>
              </Card>
            </>
          )}
        </ScrollView>

        {/* Footer actions */}
        <View style={styles.footer}>
          {step !== 'recommit' ? (
            <Button
              title="Continue"
              onPress={goNext}
              fullWidth
            />
          ) : (
            <Button
              title="Re-commit to Day 1"
              onPress={finalize}
              icon={
                <RefreshCw
                  size={18}
                  color="#000"
                />
              }
              fullWidth
            />
          )}
        </View>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerLeftButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  dotActive: {
    backgroundColor: Colors.neonCyan,
    width: 22,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  leadCard: {
    marginBottom: 20,
  },
  leadTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  leadBody: {
    fontSize: 14,
    color: Colors.subtleText,
    lineHeight: 21,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.subtleText,
    letterSpacing: 1.4,
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 12,
    color: Colors.subtleText,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
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
  textInput: {
    minHeight: 140,
    padding: 14,
    borderRadius: 14,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    color: Colors.white,
    fontSize: 14,
    lineHeight: 20,
  },
  charCount: {
    fontSize: 11,
    color: Colors.subtleText,
    textAlign: 'right',
    marginTop: 6,
  },
  recommitIconRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
})
