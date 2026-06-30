/**
 * Time helpers ported from ContentView.swift / UserSettings.swift.
 * Bedtime/wake time are represented as "minutes after midnight" (0-1439).
 */

export function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

export function clampMinutes(minutes: number): number {
  return ((minutes % 1440) + 1440) % 1440
}

/** 24h "HH:mm", matching the Swift DateFormatter("HH:mm"). */
export function clockString(minutes: number): string {
  const m = clampMinutes(minutes)
  const h = Math.floor(m / 60)
  const mm = m % 60
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

/** Next Date (after `after`) at which the clock shows `targetMinutes`. */
export function nextOccurrence(targetMinutes: number, after: Date): Date {
  const m = clampMinutes(targetMinutes)
  const candidate = new Date(after)
  candidate.setHours(Math.floor(m / 60), m % 60, 0, 0)
  if (candidate.getTime() <= after.getTime()) {
    candidate.setDate(candidate.getDate() + 1)
  }
  return candidate
}

/** Seconds from `from` (clock time incl. seconds) until the next `targetMinutes`. */
export function secondsUntil(targetMinutes: number, from: Date): number {
  const refSec = from.getHours() * 3600 + from.getMinutes() * 60 + from.getSeconds()
  const tgtSec = clampMinutes(targetMinutes) * 60
  let diff = tgtSec - refSec
  if (diff <= 0) diff += 24 * 3600
  return diff
}

/** "H:MM:SS" countdown format. */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Calendar-day difference (DST-safe: compares UTC midnight of each local Y/M/D). */
export function diffInCalendarDays(from: Date, to: Date): number {
  const utcFrom = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  const utcTo = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.round((utcTo - utcFrom) / 86_400_000)
}

export function sleepDurationMinutes(sleepMinutes: number, wakeMinutes: number): number {
  const diff = wakeMinutes - sleepMinutes
  return diff > 0 ? diff : diff + 24 * 60
}

export function formatSleepDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}
