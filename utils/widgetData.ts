/**
 * Widget data contract — the shape of the payload a future iOS/Android widget
 * would render. Centralized here so the dashboard, a background task, or the
 * native bridge can all compute the same thing.
 *
 * Why this lives as a pure function rather than a native module: this app runs
 * in Expo's managed workflow, so shipping a real WidgetKit extension requires
 * either (a) `expo prebuild` + a Swift target, or (b) a config plugin like
 * `react-native-widget-extension`. Both require a custom dev build (not Expo
 * Go). Until that's set up, we still keep the payload shape stable so we don't
 * have to refactor stores later.
 *
 * When native widgets are wired:
 *   1. Run `expo prebuild` (one-time eject of iOS/Android dirs).
 *   2. Add a WidgetKit target + App Group (group.iDontVape.shared).
 *   3. On every write (dashboard mount, scan, SOS, relapse), call
 *      `writeWidgetPayload(buildWidgetPayload(...))` which persists to the
 *      App Group's shared UserDefaults via a small native module.
 *   4. Widget reads from the same UserDefaults key and renders.
 */

import { useLogsStore } from '@/store/logsStore'
import { useScanStore } from '@/store/scanStore'
import { useUserStore } from '@/store/userStore'

export interface WidgetPayload {
  /** Whole days since quit — widget copy is "{days} days clean". */
  daysClean: number
  /** Current check-in streak — widget shows a flame or snowflake. */
  streak: number
  /** 0..1 system integrity for the ring. */
  systemIntegrity: number
  /** Whole dollars saved — widget copy is "${money} saved". */
  moneySaved: number
  /** Cravings resisted all-time — social-proof number. */
  cravingsResisted: number
  /** ISO timestamp of when this payload was computed. Widget uses it to grey
   *  out stale data if the app hasn't opened in a while. */
  updatedAt: string
}

/**
 * Build the widget payload from current store state. Callable from anywhere —
 * the dashboard on focus, a scan completion, or a background refresh handler.
 */
export function buildWidgetPayload(): WidgetPayload {
  const user = useUserStore.getState()
  const scan = useScanStore.getState()
  const logs = useLogsStore.getState()

  return {
    daysClean: user.getDaysSinceQuit(),
    streak: scan.scanStreak,
    systemIntegrity: user.getSystemIntegrity(),
    moneySaved: Math.round(user.getMoneySaved()),
    cravingsResisted: logs.getCravingsResisted(),
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Persist the payload to the widget's shared storage. No-op in managed
 * workflow — a real implementation would route through a native module backed
 * by App Group UserDefaults (iOS) or SharedPreferences (Android).
 *
 * Called liberally from the dashboard and scan completion so that once native
 * widgets ship, no new call sites are needed.
 */
export async function writeWidgetPayload(_payload: WidgetPayload): Promise<void> {
  // Intentionally empty until native widget extension is wired. Swallowing
  // silently avoids log spam on every dashboard render.
  if (__DEV__) {
    // Comment the next line out if it gets noisy during development.
    // console.log('[widget] payload would be written:', _payload)
  }
}

/**
 * Convenience: compute + persist in one call.
 */
export async function refreshWidget(): Promise<void> {
  try {
    await writeWidgetPayload(buildWidgetPayload())
  } catch (err) {
    if (__DEV__) console.error('[widget] refresh failed:', err)
  }
}
