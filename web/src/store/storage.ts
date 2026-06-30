import { DEFAULT_SETTINGS, type SettingsState } from '../types/settings'
import { isSameCalendarDay } from '../lib/time'

const STORAGE_KEY = 'nightnudge.settings.v1'

function isValidSettings(value: unknown): value is SettingsState {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.sleepMinutes === 'number' &&
    typeof v.wakeMinutes === 'number' &&
    typeof v.notificationsEnabled === 'boolean' &&
    Array.isArray(v.reminderOffsets) &&
    typeof v.annoyanceLevel === 'number' &&
    typeof v.factMode === 'number' &&
    typeof v.onboardingDone === 'boolean' &&
    typeof v.todayConfirmed === 'boolean' &&
    typeof v.lastFactIndex === 'number' &&
    typeof v.streakCount === 'number'
  )
}

/**
 * Reads persisted settings and reconciles the daily confirmation flag, just
 * like AppSettings.init() does: todayConfirmed only survives if it happened
 * on today's real calendar date (distinct from the wake-shifted "night day"
 * used for streaks).
 */
export function loadSettings(): SettingsState {
  let parsed: unknown = null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) parsed = JSON.parse(raw)
  } catch {
    parsed = null
  }

  const base = isValidSettings(parsed) ? parsed : DEFAULT_SETTINGS

  const now = new Date()
  const confirmedToday =
    base.todayConfirmedDate != null && isSameCalendarDay(new Date(base.todayConfirmedDate), now)

  return {
    ...DEFAULT_SETTINGS,
    ...base,
    todayConfirmed: confirmedToday ? base.todayConfirmed : false,
    todayConfirmedDate: confirmedToday ? base.todayConfirmedDate : null,
  }
}

export function saveSettings(state: SettingsState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage unavailable (private mode / quota) - settings simply won't persist
  }
}
