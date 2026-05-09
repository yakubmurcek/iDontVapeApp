/**
 * Log Helpers - Display logic for vaping logs
 */

import { getMilestoneById } from '@/constants/milestones'

export type LogEntryType =
  | 'dailyCheckIn'
  | 'milestoneAchieved'
  | 'cravingResisted'
  | 'relapse'
  | 'appOpened'

// Helper function for display
export function getLogIcon(type: LogEntryType): string {
  switch (type) {
    case 'dailyCheckIn':
      return 'check-circle'
    case 'milestoneAchieved':
      return 'star'
    case 'cravingResisted':
      return 'hand'
    case 'relapse':
      return 'alert-triangle'
    case 'appOpened':
      return 'eye'
  }
}

export function getLogTitle(type: LogEntryType, milestoneId?: string): string {
  switch (type) {
    case 'dailyCheckIn':
      return 'Daily Check-in'
    case 'milestoneAchieved':
      return milestoneId ? (getMilestoneById(milestoneId)?.displayName ?? 'Milestone Achieved') : 'Milestone Achieved'
    case 'cravingResisted':
      return 'Craving Resisted'
    case 'relapse':
      return 'Setback Logged'
    case 'appOpened':
      return 'Session Started'
  }
}
