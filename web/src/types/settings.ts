/** 0 Sanft · 1 Normal · 2 Streng · 3 Sehr streng */
export type AnnoyanceLevel = 0 | 1 | 2 | 3

/** 0 Positiv · 1 Positiv+Direkt */
export type FactMode = 0 | 1

/**
 * Persisted app state. Mirrors NightAgent/UserSettings.swift (AppSettings).
 * Sleep/wake times are stored as minutes-after-midnight (0-1439) rather than
 * Date objects, since the original only ever read the hour/minute components.
 */
export interface SettingsState {
  sleepMinutes: number
  wakeMinutes: number

  notificationsEnabled: boolean
  /** Minutes before bedtime, one entry per reminder (1-4 entries, 5-120 each). */
  reminderOffsets: number[]

  annoyanceLevel: AnnoyanceLevel
  factMode: FactMode

  onboardingDone: boolean
  todayConfirmed: boolean
  /** Epoch ms of the confirmation tap, or null. */
  todayConfirmedDate: number | null
  lastFactIndex: number

  streakCount: number
  /** Epoch ms of the start-of-day for the last confirmed "night", or null. */
  lastStreakDay: number | null
}

export const DEFAULT_SETTINGS: SettingsState = {
  sleepMinutes: 22 * 60 + 30,
  wakeMinutes: 7 * 60,
  notificationsEnabled: false,
  reminderOffsets: [60, 30],
  annoyanceLevel: 0,
  factMode: 0,
  onboardingDone: false,
  todayConfirmed: false,
  todayConfirmedDate: null,
  lastFactIndex: 0,
  streakCount: 0,
  lastStreakDay: null,
}

export const ANNOYANCE_LABELS: Record<AnnoyanceLevel, string> = {
  0: 'Sanft',
  1: 'Normal',
  2: 'Streng',
  3: 'Sehr streng',
}

export const FACT_MODE_LABELS: Record<FactMode, string> = {
  0: 'Motivierend',
  1: 'Motivierend + Warnend',
}
