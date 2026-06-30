import { diffInCalendarDays } from './time'
import type { SettingsState } from '../types/settings'

/**
 * Buckets a timestamp into a "night". The day boundary sits at the wake
 * time, so a late evening and the early morning after it count as the same
 * night. Ported from UserSettings.swift `nightDay(for:)`.
 */
export function nightDay(date: Date, wakeMinutes: number): Date {
  const shiftMs = wakeMinutes * 60_000
  const shifted = new Date(date.getTime() - shiftMs)
  shifted.setHours(0, 0, 0, 0)
  return shifted
}

/** Result of confirming bedtime "now" — mirrors `registerStreak()`. */
export function registerStreak(
  state: Pick<SettingsState, 'streakCount' | 'lastStreakDay' | 'wakeMinutes'>,
  now: Date,
): { streakCount: number; lastStreakDay: number } {
  const today = nightDay(now, state.wakeMinutes)

  let streakCount: number
  if (state.lastStreakDay != null) {
    const days = diffInCalendarDays(new Date(state.lastStreakDay), today)
    if (days < 1) streakCount = state.streakCount // same night (or clock turned back)
    else if (days === 1) streakCount = state.streakCount + 1 // directly following night
    else streakCount = 1 // real gap (>= 2 nights) -> restart
  } else {
    streakCount = 1 // very first confirmation
  }

  return { streakCount, lastStreakDay: today.getTime() }
}

/**
 * Display streak: decays to 0 once a full night has passed without a
 * confirmation. Ported from `AppSettings.currentStreak`.
 */
export function currentStreak(
  state: Pick<SettingsState, 'streakCount' | 'lastStreakDay' | 'wakeMinutes'>,
  now: Date,
): number {
  if (state.lastStreakDay == null) return 0
  const today = nightDay(now, state.wakeMinutes)
  const days = diffInCalendarDays(new Date(state.lastStreakDay), today)
  // 0 = already counted today · 1 = counted yesterday (today still open) -> alive
  return days <= 1 ? state.streakCount : 0
}

export type StreakTier = 'gold' | 'platinum' | 'ruby' | 'diamond' | null

/** Tier border: 1-4 plain · 5-9 Gold · 10-14 Platinum · 15-20 Ruby · 21+ Diamond. */
export function streakTier(streak: number): StreakTier {
  if (streak < 5) return null
  if (streak < 10) return 'gold'
  if (streak < 15) return 'platinum'
  if (streak < 21) return 'ruby'
  return 'diamond'
}

export const STREAK_TIER_COLOR_VAR: Record<Exclude<StreakTier, null>, string> = {
  gold: 'var(--streak-gold)',
  platinum: 'var(--streak-platinum)',
  ruby: 'var(--streak-ruby)',
  diamond: 'var(--streak-diamond)',
}

export const STREAK_TIER_LABEL: Record<Exclude<StreakTier, null>, string> = {
  gold: 'Gold',
  platinum: 'Platin',
  ruby: 'Rubin',
  diamond: 'Diamant',
}

/** Minutes (as a streak count) until the next tier is reached, or null at max tier. */
export function nextTierThreshold(streak: number): number | null {
  if (streak < 5) return 5
  if (streak < 10) return 10
  if (streak < 15) return 15
  if (streak < 21) return 21
  return null
}
