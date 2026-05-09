import test from 'node:test';
import assert from 'node:assert';
import { getLogIcon, getLogTitle } from '@/store/logHelpers';
import type { LogEntryType } from '@/store/logHelpers';

test('getLogIcon returns correct icon for each LogEntryType', () => {
  const cases: Record<LogEntryType, string> = {
    dailyCheckIn: 'check-circle',
    milestoneAchieved: 'star',
    cravingResisted: 'hand',
    relapse: 'alert-triangle',
    appOpened: 'eye',
  };

  for (const [type, expectedIcon] of Object.entries(cases)) {
    assert.strictEqual(getLogIcon(type as LogEntryType), expectedIcon);
  }
});

test('getLogTitle returns correct title for each LogEntryType', () => {
  assert.strictEqual(getLogTitle('dailyCheckIn'), 'Daily Check-in');
  assert.strictEqual(getLogTitle('cravingResisted'), 'Craving Resisted');
  assert.strictEqual(getLogTitle('relapse'), 'Setback Logged');
  assert.strictEqual(getLogTitle('appOpened'), 'Session Started');
});

test('getLogTitle handling for milestoneAchieved', () => {
  // Case 1: No milestoneId provided
  assert.strictEqual(getLogTitle('milestoneAchieved'), 'Milestone Achieved');

  // Case 2: Valid milestoneId
  // From milestones.ts, 'heartRateDrops' has displayName 'Heart Rate Drops'
  assert.strictEqual(getLogTitle('milestoneAchieved', 'heartRateDrops'), 'Heart Rate Drops');

  // Case 3: Invalid milestoneId
  assert.strictEqual(getLogTitle('milestoneAchieved', 'nonExistentMilestone'), 'Milestone Achieved');
});
