/**
 * QuitFundCard — replaces the plain "Credits Saved" tile with a goal-anchored
 * display. Before the user picks a goal, it shows a set-goal nudge inline.
 * After, it shows progress toward that goal ("You've funded 40% of a new bike")
 * which converts meaningfully better than an abstract dollar number.
 *
 * Goal editing is handled via a lightweight bottom Modal rather than a new
 * route so this component stays self-contained and can be reused anywhere.
 */

import { Card } from '@/components/ui/Card'
import { Colors } from '@/constants/Colors'
import { QuitFundGoal, useUserStore } from '@/store/userStore'
import { DollarSign, Pencil, Target } from 'lucide-react-native'
import React, { useState } from 'react'
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

const PRESET_GOALS: QuitFundGoal[] = [
  { label: 'New AirPods Pro', amountCents: 24900 },
  { label: 'A weekend trip', amountCents: 50000 },
  { label: 'A new bike', amountCents: 80000 },
  { label: 'Noise-canceling headphones', amountCents: 35000 },
  { label: 'Six months of the gym', amountCents: 30000 },
  { label: 'An emergency fund', amountCents: 100000 },
]

export function QuitFundCard({ moneySaved }: { moneySaved: number }) {
  const quitFundGoal = useUserStore((state) => state.quitFundGoal)
  const setQuitFundGoal = useUserStore((state) => state.setQuitFundGoal)
  const [modalVisible, setModalVisible] = useState(false)

  const goalDollars = quitFundGoal ? quitFundGoal.amountCents / 100 : 0
  const pct = quitFundGoal ? Math.min(1, moneySaved / Math.max(0.01, goalDollars)) : 0

  return (
    <>
      <Card>
        <View style={styles.topRow}>
          <View style={styles.iconBadge}>
            <DollarSign
              size={18}
              color={Colors.healthGreen}
            />
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.label}>CREDITS SAVED</Text>
            <Text style={styles.amount}>${moneySaved.toFixed(2)}</Text>
          </View>
          {quitFundGoal && (
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={styles.editButton}
              accessibilityLabel="Edit quit fund goal"
            >
              <Pencil
                size={14}
                color={Colors.subtleText}
              />
            </TouchableOpacity>
          )}
        </View>

        {quitFundGoal ? (
          <View style={styles.goalBlock}>
            <View style={styles.goalHeaderRow}>
              <Target
                size={13}
                color={Colors.neonCyan}
              />
              <Text style={styles.goalLabel}>{quitFundGoal.label}</Text>
              <Text style={styles.goalPct}>{Math.round(pct * 100)}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
            </View>
            <Text style={styles.goalSubtext}>
              {pct >= 1
                ? `Goal met — you've saved $${moneySaved.toFixed(0)} toward ${quitFundGoal.label}.`
                : `$${(goalDollars - moneySaved).toFixed(0)} to go.`}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.setGoalButton}
            accessibilityRole="button"
          >
            <Target
              size={14}
              color={Colors.neonCyan}
            />
            <Text style={styles.setGoalText}>Set a goal for this money</Text>
          </TouchableOpacity>
        )}
      </Card>

      <GoalPickerModal
        visible={modalVisible}
        currentGoal={quitFundGoal}
        onClose={() => setModalVisible(false)}
        onSave={(goal) => {
          setQuitFundGoal(goal)
          setModalVisible(false)
        }}
      />
    </>
  )
}

function GoalPickerModal({
  visible,
  currentGoal,
  onClose,
  onSave,
}: {
  visible: boolean
  currentGoal: QuitFundGoal | null
  onClose: () => void
  onSave: (goal: QuitFundGoal | null) => void
}) {
  const [customLabel, setCustomLabel] = useState(
    currentGoal && !PRESET_GOALS.find((p) => p.label === currentGoal.label)
      ? currentGoal.label
      : '',
  )
  const [customAmount, setCustomAmount] = useState(
    currentGoal && !PRESET_GOALS.find((p) => p.label === currentGoal.label)
      ? String(currentGoal.amountCents / 100)
      : '',
  )

  const handleCustomSave = () => {
    const amountNum = parseFloat(customAmount)
    if (!customLabel.trim() || !Number.isFinite(amountNum) || amountNum <= 0) return
    onSave({ label: customLabel.trim(), amountCents: Math.round(amountNum * 100) })
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.modalBackdrop}
        onPress={onClose}
      >
        <Pressable style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Pick a goal</Text>
          <Text style={styles.modalSubtitle}>
            Something concrete you&apos;d buy with the money you&apos;re not spending on vaping.
          </Text>

          <ScrollView style={styles.modalList}>
            {PRESET_GOALS.map((preset) => {
              const active = currentGoal?.label === preset.label
              return (
                <TouchableOpacity
                  key={preset.label}
                  onPress={() => onSave(preset)}
                  style={[styles.presetRow, active && styles.presetRowActive]}
                >
                  <Text style={[styles.presetLabel, active && styles.presetLabelActive]}>
                    {preset.label}
                  </Text>
                  <Text style={styles.presetAmount}>${preset.amountCents / 100}</Text>
                </TouchableOpacity>
              )
            })}

            <View style={styles.customBlock}>
              <Text style={styles.customHeader}>Or something of your own</Text>
              <TextInput
                value={customLabel}
                onChangeText={setCustomLabel}
                placeholder="What you're saving for"
                placeholderTextColor={Colors.subtleText}
                style={styles.customInput}
              />
              <TextInput
                value={customAmount}
                onChangeText={setCustomAmount}
                placeholder="Amount (USD)"
                placeholderTextColor={Colors.subtleText}
                style={styles.customInput}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity
                onPress={handleCustomSave}
                style={styles.customSaveButton}
                disabled={!customLabel.trim() || !parseFloat(customAmount)}
              >
                <Text style={styles.customSaveText}>Save custom goal</Text>
              </TouchableOpacity>
            </View>

            {currentGoal && (
              <TouchableOpacity
                onPress={() => onSave(null)}
                style={styles.clearButton}
              >
                <Text style={styles.clearText}>Clear current goal</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 255, 136, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.subtleText,
    letterSpacing: 1.2,
  },
  amount: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.healthGreen,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  editButton: {
    padding: 8,
  },
  goalBlock: {
    marginTop: 14,
  },
  goalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  goalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
    flex: 1,
  },
  goalPct: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.neonCyan,
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.neonCyan,
    borderRadius: 3,
  },
  goalSubtext: {
    fontSize: 11,
    color: Colors.subtleText,
    marginTop: 8,
  },
  setGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    backgroundColor: 'rgba(0, 240, 255, 0.06)',
    alignSelf: 'flex-start',
  },
  setGoalText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neonCyan,
  },
  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.spaceCharcoal,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.subtleText,
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 18,
  },
  modalList: {
    flexGrow: 0,
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Colors.cardBackground,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  presetRowActive: {
    borderColor: 'rgba(0, 240, 255, 0.55)',
    backgroundColor: 'rgba(0, 240, 255, 0.06)',
  },
  presetLabel: {
    fontSize: 14,
    color: Colors.white,
    flex: 1,
    fontWeight: '500',
  },
  presetLabelActive: {
    color: Colors.neonCyan,
    fontWeight: '600',
  },
  presetAmount: {
    fontSize: 13,
    color: Colors.subtleText,
    fontVariant: ['tabular-nums'],
  },
  customBlock: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  customHeader: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.subtleText,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  customInput: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    color: Colors.white,
    marginBottom: 8,
    fontSize: 14,
  },
  customSaveButton: {
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.neonCyan,
    alignItems: 'center',
    marginTop: 4,
  },
  customSaveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  clearButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  clearText: {
    fontSize: 13,
    color: Colors.criticalRed,
    fontWeight: '500',
  },
})
