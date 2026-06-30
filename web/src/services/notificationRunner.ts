import { nextFact } from '../data/facts'
import { cycleSleep, isConfirmedThisCycle } from '../lib/cycle'
import { clampMinutes } from '../lib/time'
import type { SettingsState } from '../types/settings'
import { showLocalNotification } from './showNotification'

/**
 * Follow-up delays after bedtime, in minutes, keyed by annoyanceLevel.
 * Ported 1:1 from NotificationScheduler.swift `scheduleNotifications`.
 */
const FOLLOW_UP_MINUTES: Record<number, number[]> = {
  0: [], // Sanft: keine Follow-ups
  1: [5], // Normal
  2: [15, 30], // Streng
  3: [5, 20, 40], // Sehr streng
}

interface ScheduleItem {
  id: string
  minute: number // absolute minute-of-day (0-1439) this item fires at
  title: string
  isFollowUp: boolean
}

function buildSchedule(settings: SettingsState): ScheduleItem[] {
  const items: ScheduleItem[] = settings.reminderOffsets.map((offset, i) => ({
    id: `reminder_${i}`,
    minute: clampMinutes(settings.sleepMinutes - offset),
    title: `Noch ${offset} Min. bis Schlafzeit`,
    isFollowUp: false,
  }))

  const followUps = FOLLOW_UP_MINUTES[settings.annoyanceLevel] ?? []
  followUps.forEach((delta, i) => {
    items.push({
      id: `followup_${i}`,
      minute: clampMinutes(settings.sleepMinutes + delta),
      title: 'Du bist über deiner Schlafzeit',
      isFollowUp: true,
    })
  })

  return items
}

const FIRED_STORAGE_KEY = 'nightnudge.notif-fired.v1'

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function loadFiredMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(FIRED_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function hasFiredToday(id: string, today: string): boolean {
  return loadFiredMap()[id] === today
}

function markFired(id: string, today: string): void {
  const fired = loadFiredMap()
  fired[id] = today
  try {
    localStorage.setItem(FIRED_STORAGE_KEY, JSON.stringify(fired))
  } catch {
    // ignore quota/private-mode errors - at worst a reminder fires twice
  }
}

// Avoids two items in the same tick re-reading the same stale persisted
// lastFactIndex before React has a chance to commit the update (mirrors the
// Swift scheduler looping with a local `lastIndex` before persisting once).
let factIndexCache: number | null = null

export interface NotificationRunnerSettings extends SettingsState {
  setLastFactIndex: (index: number) => void
}

const SKIP_STORAGE_KEY = 'nightnudge.notif-skip-until.v1'

/** "Heute aussetzen": suppresses reminders/follow-ups until the next bedtime cycle. */
export function markSkippedToday(settings: SettingsState, now: Date): void {
  const target = cycleSleep(settings.sleepMinutes, now).getTime()
  try {
    localStorage.setItem(SKIP_STORAGE_KEY, String(target))
  } catch {
    // ignore - worst case "skip today" silently no-ops
  }
}

function isCurrentCycleSkipped(settings: SettingsState, now: Date): boolean {
  let stored: string | null
  try {
    stored = localStorage.getItem(SKIP_STORAGE_KEY)
  } catch {
    return false
  }
  if (!stored) return false
  return Number(stored) === cycleSleep(settings.sleepMinutes, now).getTime()
}

/** Checks the schedule against `now` and fires any reminder/follow-up that just became due. */
export function tickNotifications(settings: NotificationRunnerSettings, now: Date): void {
  if (!settings.notificationsEnabled) return
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  if (isCurrentCycleSkipped(settings, now)) return

  const nowMinute = now.getHours() * 60 + now.getMinutes()
  const today = dayKey(now)

  for (const item of buildSchedule(settings)) {
    if (item.minute !== nowMinute) continue
    if (hasFiredToday(item.id, today)) continue
    if (item.isFollowUp && isConfirmedThisCycle(settings, now)) continue

    const baseIndex = factIndexCache ?? settings.lastFactIndex
    const { fact, index } = nextFact(baseIndex, settings.factMode)
    factIndexCache = index
    settings.setLastFactIndex(index)

    markFired(item.id, today)
    void showLocalNotification(item.title, fact.body, { tag: item.id })
  }
}

/** "Noch 5 Min": one-off reminder 5 minutes from now. Ported from NightAgentApp.swift `scheduleSnooze`. */
export function scheduleSnoozeNotification(): void {
  window.setTimeout(
    () => {
      void showLocalNotification(
        'Handy noch da? 👀',
        'Deine 5 Minuten sind um. Leg es jetzt weg.',
        { tag: 'snooze' },
      )
    },
    5 * 60 * 1000,
  )
}
