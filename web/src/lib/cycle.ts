import { nextOccurrence } from './time'
import type { SettingsState } from '../types/settings'

const WARNING_WINDOW_MS = 60 * 60 * 1000 // last hour before bedtime turns the UI red

/** The bedtime occurrence the countdown is currently running towards. */
export function cycleSleep(sleepMinutes: number, now: Date): Date {
  return nextOccurrence(sleepMinutes, now)
}

/**
 * True once the user has confirmed bedtime for the cycle that is currently
 * counting down. Time-based: stays true only until that bedtime passes.
 * Ported from ContentView.swift `isConfirmedThisCycle`.
 */
export function isConfirmedThisCycle(
  state: Pick<SettingsState, 'todayConfirmed' | 'todayConfirmedDate' | 'sleepMinutes'>,
  now: Date,
): boolean {
  if (!state.todayConfirmed || state.todayConfirmedDate == null) return false
  const confirmed = new Date(state.todayConfirmedDate)
  const target = cycleSleep(state.sleepMinutes, now)
  return nextOccurrence(state.sleepMinutes, confirmed).getTime() === target.getTime()
}

/** Red = inside the last hour before bedtime and not yet confirmed. */
export function isWarning(
  state: Pick<SettingsState, 'todayConfirmed' | 'todayConfirmedDate' | 'sleepMinutes'>,
  now: Date,
): boolean {
  const target = cycleSleep(state.sleepMinutes, now)
  const inLastHour = target.getTime() - now.getTime() <= WARNING_WINDOW_MS
  return inLastHour && !isConfirmedThisCycle(state, now)
}

/**
 * True once the current wall-clock time has passed today's bedtime (and the
 * bedtime isn't more than 12h in the future, i.e. still "yesterday's" slot).
 * Ported from ContentView.swift `isPastBedtime`.
 */
export function isPastBedtime(sleepMinutes: number, now: Date): boolean {
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const diff = sleepMinutes - nowMinutes
  return diff < 0 || diff > 12 * 60
}
