import type { AnnoyanceLevel, FactMode, SettingsState } from '../types/settings'
import { registerStreak } from '../lib/streak'

export type SettingsAction =
  | { type: 'SET_SLEEP_MINUTES'; minutes: number }
  | { type: 'SET_WAKE_MINUTES'; minutes: number }
  | { type: 'SET_NOTIFICATIONS_ENABLED'; enabled: boolean }
  | { type: 'SET_REMINDER_OFFSETS'; offsets: number[] }
  | { type: 'SET_ANNOYANCE_LEVEL'; level: AnnoyanceLevel }
  | { type: 'SET_FACT_MODE'; mode: FactMode }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'CONFIRM_TODAY'; now: number }
  | { type: 'SET_LAST_FACT_INDEX'; index: number }
  | { type: 'DEBUG_BUMP_STREAK'; now: number }
  | { type: 'DEBUG_RESET_STREAK' }

export function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'SET_SLEEP_MINUTES':
      return { ...state, sleepMinutes: action.minutes }
    case 'SET_WAKE_MINUTES':
      return { ...state, wakeMinutes: action.minutes }
    case 'SET_NOTIFICATIONS_ENABLED':
      return { ...state, notificationsEnabled: action.enabled }
    case 'SET_REMINDER_OFFSETS':
      return { ...state, reminderOffsets: action.offsets }
    case 'SET_ANNOYANCE_LEVEL':
      return { ...state, annoyanceLevel: action.level }
    case 'SET_FACT_MODE':
      return { ...state, factMode: action.mode }
    case 'COMPLETE_ONBOARDING':
      return { ...state, onboardingDone: true }
    case 'SET_LAST_FACT_INDEX':
      return { ...state, lastFactIndex: action.index }
    case 'CONFIRM_TODAY': {
      const now = new Date(action.now)
      const { streakCount, lastStreakDay } = registerStreak(state, now)
      return {
        ...state,
        todayConfirmed: true,
        todayConfirmedDate: action.now,
        streakCount,
        lastStreakDay,
      }
    }
    case 'DEBUG_BUMP_STREAK': {
      const today = new Date(action.now)
      today.setHours(0, 0, 0, 0)
      return { ...state, streakCount: state.streakCount + 1, lastStreakDay: today.getTime() }
    }
    case 'DEBUG_RESET_STREAK':
      return { ...state, streakCount: 0, lastStreakDay: null }
    default:
      return state
  }
}
