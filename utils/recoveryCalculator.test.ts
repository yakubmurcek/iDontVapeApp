import { test } from 'node:test'
import assert from 'node:assert'
import { calculateSystemIntegrity } from '@/utils/recoveryCalculator'

test('calculateSystemIntegrity handles edge cases', (t) => {
  const initialDamage = 0.5

  // Case 1: hoursSinceQuit = 0
  assert.strictEqual(calculateSystemIntegrity(initialDamage, 0), 1 - initialDamage)

  // Case 1.1: hoursSinceQuit < 0
  assert.strictEqual(calculateSystemIntegrity(initialDamage, -10), 1 - initialDamage)

  // Case 2: hoursSinceQuit = 8760 (MAX_RECOVERY_HOURS)
  // recoveryProgress = 1.0
  // currentDamage = 0.5 - 0.5 * 0.8 * 1.0 = 0.5 - 0.4 = 0.1
  // integrity = 1.0 - 0.1 = 0.9
  assert.strictEqual(calculateSystemIntegrity(initialDamage, 8760), 0.9)

  // Case 2.1: hoursSinceQuit > 8760
  assert.strictEqual(calculateSystemIntegrity(initialDamage, 10000), 0.9)
})

test('calculateSystemIntegrity follows logarithmic curve', (t) => {
  const initialDamage = 0.85
  const hoursSinceQuit = 100
  const MAX_RECOVERY_HOURS = 8760
  const MAX_RECOVERABLE_FRACTION = 0.8

  const recoveryProgress = Math.log(hoursSinceQuit + 1) / Math.log(MAX_RECOVERY_HOURS + 1)
  const maxRecoverable = initialDamage * MAX_RECOVERABLE_FRACTION
  const currentDamage = initialDamage - maxRecoverable * recoveryProgress
  const expectedIntegrity = 1.0 - currentDamage

  const result = calculateSystemIntegrity(initialDamage, hoursSinceQuit)
  assert.ok(Math.abs(result - expectedIntegrity) < 1e-10)
})

test('calculateSystemIntegrity with different initial damage levels', (t) => {
  const damageLevels = [0.15, 0.5, 0.85]
  const hours = 500
  const MAX_RECOVERY_HOURS = 8760
  const MAX_RECOVERABLE_FRACTION = 0.8

  for (const initialDamage of damageLevels) {
    const recoveryProgress = Math.log(hours + 1) / Math.log(MAX_RECOVERY_HOURS + 1)
    const expectedIntegrity = 1.0 - (initialDamage - (initialDamage * MAX_RECOVERABLE_FRACTION * recoveryProgress))

    const result = calculateSystemIntegrity(initialDamage, hours)
    assert.ok(Math.abs(result - expectedIntegrity) < 1e-10)
  }
})

test('calculateSystemIntegrity clamping', (t) => {
  // Even if initialDamage is high and recovery is full, it should not exceed 1.0
  assert.strictEqual(calculateSystemIntegrity(0.1, 8760), 0.98) // 1 - (0.1 - 0.08) = 0.98

  // Test lower bound (integrity should not be negative)
  assert.strictEqual(calculateSystemIntegrity(2.0, 0), 0.0)
})
