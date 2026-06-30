import { isConfirmedThisCycle, isWarning } from './cycle'
import { clockString, formatDuration, secondsUntil, sleepDurationMinutes } from './time'
import type { SettingsState } from '../types/settings'

export interface BedtimeCountdown {
  time: string
  sub: string
  isWarning: boolean
  isConfirmed: boolean
  /** 0-1, how far today's awake window has progressed towards bedtime. */
  progress: number
}

/**
 * Shared countdown logic behind ContentView.swift's HomeView countdown card
 * and NightAgentWidget.swift's timeline. Pure function (no ticking of its
 * own) so callers can share a single `now` clock across multiple derived
 * views instead of running one timer per consumer.
 */
export function computeBedtimeCountdown(
  settings: Pick<SettingsState, 'sleepMinutes' | 'wakeMinutes' | 'todayConfirmed' | 'todayConfirmedDate'>,
  now: Date,
): BedtimeCountdown {
  const secondsToSleep = secondsUntil(settings.sleepMinutes, now)
  const confirmed = isConfirmedThisCycle(settings, now)
  const warning = isWarning(settings, now)

  const totalAwakeSeconds = sleepDurationMinutes(settings.sleepMinutes, settings.wakeMinutes) * 60
  const elapsed = totalAwakeSeconds - secondsToSleep
  const progress = totalAwakeSeconds > 0 ? Math.min(1, Math.max(0, elapsed / totalAwakeSeconds)) : 0

  return {
    time: formatDuration(secondsToSleep),
    sub: confirmed ? 'Gute Nacht 🌙' : clockString(settings.sleepMinutes),
    isWarning: warning,
    isConfirmed: confirmed,
    progress,
  }
}
