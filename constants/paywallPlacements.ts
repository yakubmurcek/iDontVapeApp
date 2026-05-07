/**
 * Paywall placement keys, matched verbatim against the Superwall dashboard
 * configuration. Centralized so a typo at a call site shows up as a compile
 * error instead of a silently-ignored placement (Superwall matches by exact
 * string and quietly no-ops when there's no match — a typo is invisible until
 * a customer fails to convert).
 *
 * String values MUST stay aligned with the Superwall dashboard. If you rename
 * a placement here, rename it in the dashboard too (or vice versa).
 */
export const PAYWALL_PLACEMENTS = {
  /**
   * General "campaign trigger" placement — used for day-3 dashboard auto-fire,
   * milestone celebration follow-up, and the organ-detail back-button moment.
   */
  campaignTrigger: 'campaign_trigger',
  /** Fires after a streak freeze rescues the user's streak. */
  streakSaved: 'streak_saved',
  /** Fires after the 3rd craving the user successfully resisted. */
  resistMilestone: 'resist_milestone',
  /** Fires when the user taps the "unlock more insights" lock on the dashboard. */
  insightsUnlock: 'insights_unlock',
  /** Fires on the 2nd or later relapse (pattern detected). */
  relapseCycle: 'relapse_cycle',
} as const

export type PaywallPlacement = (typeof PAYWALL_PLACEMENTS)[keyof typeof PAYWALL_PLACEMENTS]
