import {
  calculateSystemIntegrity,
  MAX_RECOVERY_HOURS,
  MAX_RECOVERABLE_FRACTION,
  MIN_DAMAGE_SCORE,
  MAX_DAMAGE_SCORE,
} from './recoveryCalculator';

describe('calculateSystemIntegrity', () => {
  describe('hoursSinceQuit edge cases', () => {
    it('should handle hoursSinceQuit = 0 as 0 recovery progress', () => {
      const initialDamage = 0.5;
      const result = calculateSystemIntegrity(initialDamage, 0);
      // recoveryProgress = 0
      // currentDamage = 0.5 - (0.5 * 0.8 * 0) = 0.5
      // integrity = 1.0 - 0.5 = 0.5
      expect(result).toBeCloseTo(0.5);
    });

    it('should handle negative hoursSinceQuit as 0 recovery progress', () => {
      const initialDamage = 0.5;
      const result = calculateSystemIntegrity(initialDamage, -10);
      expect(result).toBeCloseTo(0.5);
    });

    it('should handle hoursSinceQuit = MAX_RECOVERY_HOURS as 1.0 recovery progress', () => {
      const initialDamage = 0.5;
      const result = calculateSystemIntegrity(initialDamage, MAX_RECOVERY_HOURS);
      // recoveryProgress = 1.0
      // currentDamage = 0.5 - (0.5 * MAX_RECOVERABLE_FRACTION * 1.0) = 0.5 - 0.4 = 0.1
      // integrity = 1.0 - 0.1 = 0.9
      expect(result).toBeCloseTo(0.9);
    });

    it('should handle hoursSinceQuit > MAX_RECOVERY_HOURS as 1.0 recovery progress', () => {
      const initialDamage = 0.5;
      const result = calculateSystemIntegrity(initialDamage, 10000);
      expect(result).toBeCloseTo(0.9);
    });
  });

  describe('initialDamage edge cases', () => {
    it('should handle MIN_DAMAGE_SCORE (0.15)', () => {
      const result = calculateSystemIntegrity(MIN_DAMAGE_SCORE, 0);
      expect(result).toBeCloseTo(1.0 - MIN_DAMAGE_SCORE);
    });

    it('should handle MAX_DAMAGE_SCORE (0.85)', () => {
      const result = calculateSystemIntegrity(MAX_DAMAGE_SCORE, 0);
      expect(result).toBeCloseTo(1.0 - MAX_DAMAGE_SCORE);
    });

    it('should handle initialDamage = 1.0 and hoursSinceQuit = 0', () => {
      const result = calculateSystemIntegrity(1.0, 0);
      // recoveryProgress = 0
      // currentDamage = 1.0
      // integrity = 1.0 - 1.0 = 0
      expect(result).toBeCloseTo(0.0);
    });

    it('should handle initialDamage = 0.0', () => {
      const result = calculateSystemIntegrity(0.0, 100);
      // initialDamage = 0 => currentDamage = 0 => integrity = 1.0
      expect(result).toBeCloseTo(1.0);
    });
  });

  describe('clamping logic', () => {
    it('should clamp integrity to 1.0 even if calculations would exceed it', () => {
      // initialDamage = -0.5 (extreme case)
      // currentDamage = -0.5 - (-0.4 * progress)
      // If progress = 1, currentDamage = -0.1
      // integrity = 1.1 => should be clamped to 1.0
      const result = calculateSystemIntegrity(-0.5, MAX_RECOVERY_HOURS);
      expect(result).toBe(1.0);
    });

    it('should clamp integrity to 0.0 even if calculations would be below it', () => {
      // initialDamage = 1.5 (extreme case)
      // currentDamage = 1.5 - (1.2 * progress)
      // If progress = 0, currentDamage = 1.5
      // integrity = -0.5 => should be clamped to 0.0
      const result = calculateSystemIntegrity(1.5, 0);
      expect(result).toBe(0.0);
    });
  });
});
