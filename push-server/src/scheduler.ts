import cron from 'node-cron'
import webpush from 'web-push'
import { store } from './store'
import type { Schedule } from './store'

// ── Facts (ported from web/src/data/facts.ts) ──────────────────────────────

type FactType = 'positive' | 'direct'
interface Fact { body: string; type: FactType }

const FACT_POOL: Fact[] = [
  { body: 'Guter Schlaf unterstützt Stimmung und emotionale Stabilität.', type: 'positive' },
  { body: 'Guter Schlaf kann Kreativität und Problemlösen unterstützen.', type: 'positive' },
  { body: 'Weniger Handyzeit vor dem Schlafen kann Lernen und Konzentration am nächsten Tag unterstützen.', type: 'positive' },
  { body: 'Im Schlaf laufen wichtige Aufräum- und Erholungsprozesse im Gehirn.', type: 'positive' },
  { body: 'Schon eine gute Erholungsnacht kann helfen, Folgen von Schlafmangel zu verbessern.', type: 'positive' },
  { body: 'Abendliches Bildschirmlicht kann Melatonin unterdrücken und deine innere Uhr nach hinten schieben.', type: 'direct' },
  { body: 'Smartphone-Nutzung im Bett kann mit höherer Herzfrequenz und schlechterer Erholung zusammenhängen.', type: 'direct' },
  { body: 'Schlafmangel kann emotionale Kontrolle verschlechtern und impulsivere Reaktionen begünstigen.', type: 'direct' },
  { body: 'Zwei Wochen mit nur 6 Stunden Schlaf pro Nacht können die kognitive Leistung deutlich verschlechtern.', type: 'direct' },
  { body: 'Lichtemittierende Geräte vor dem Schlafen können Einschlafen, innere Uhr und Aufmerksamkeit am Morgen stören.', type: 'direct' },
]

function pickFact(factMode: number): string {
  const pool = factMode === 0 ? FACT_POOL.filter(f => f.type === 'positive') : FACT_POOL
  if (pool.length === 0) return 'Leg das Handy weg und schlaf gut.'
  store.factIndex = (store.factIndex + 1) % pool.length
  return pool[store.factIndex].body
}

// ── Schedule helpers ────────────────────────────────────────────────────────

const FOLLOW_UP_MINUTES: Record<number, number[]> = {
  0: [],
  1: [5],
  2: [15, 30],
  3: [5, 20, 40],
}

interface ScheduleItem {
  id: string
  minute: number
  title: string
  isFollowUp: boolean
}

function clampMinutes(m: number): number {
  return ((m % 1440) + 1440) % 1440
}

function buildSchedule(s: Schedule): ScheduleItem[] {
  const items: ScheduleItem[] = s.reminderOffsets.map((offset, i) => ({
    id: `reminder_${i}`,
    minute: clampMinutes(s.sleepMinutes - offset),
    title: `Noch ${offset} Min. bis Schlafzeit`,
    isFollowUp: false,
  }))

  ;(FOLLOW_UP_MINUTES[s.annoyanceLevel] ?? []).forEach((delta, i) => {
    items.push({
      id: `followup_${i}`,
      minute: clampMinutes(s.sleepMinutes + delta),
      title: 'Du bist über deiner Schlafzeit',
      isFollowUp: true,
    })
  })

  return items
}

function getLocalTime(timezone: string): { nowMinute: number; dayKey: string } {
  const now = new Date()
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit', minute: '2-digit',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour12: false,
    }).formatToParts(now).map(({ type, value }) => [type, value]),
  )
  const hour = parseInt(p.hour ?? '0', 10) % 24
  const minute = parseInt(p.minute ?? '0', 10)
  return {
    nowMinute: hour * 60 + minute,
    dayKey: `${p.year}-${p.month}-${p.day}`,
  }
}

// Returns the next Date when sleepMinutes occurs (tomorrow if already passed today).
function nextSleepTime(sleepMinutes: number, timezone: string): Date {
  const { nowMinute } = getLocalTime(timezone)
  const minutesUntil = sleepMinutes > nowMinute
    ? sleepMinutes - nowMinute
    : 1440 - nowMinute + sleepMinutes
  return new Date(Date.now() + minutesUntil * 60 * 1000)
}

// ── Scheduler ───────────────────────────────────────────────────────────────

export function startScheduler(): void {
  cron.schedule('* * * * *', () => {
    const { subscription, schedule } = store
    if (!subscription || !schedule) return

    const { nowMinute, dayKey } = getLocalTime(schedule.timezone)
    const fired = store.firedMap[dayKey] ?? []

    // Cleanup previous days to keep the map small
    for (const key of Object.keys(store.firedMap)) {
      if (key !== dayKey) delete store.firedMap[key]
    }

    for (const item of buildSchedule(schedule)) {
      if (item.minute !== nowMinute) continue
      if (fired.includes(item.id)) continue
      if (item.isFollowUp && store.confirmedUntil && new Date() < store.confirmedUntil) continue

      store.firedMap[dayKey] = [...fired, item.id]

      const payload = JSON.stringify({
        title: item.title,
        body: pickFact(schedule.factMode),
        tag: item.id,
        icon: schedule.iconUrl,
      })

      webpush.sendNotification(subscription, payload).catch((err: { statusCode?: number }) => {
        console.error('Push send failed:', err)
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription expired — clear it so we stop trying
          store.subscription = null
          console.log('Subscription expired, cleared.')
        }
      })
    }
  })

  console.log('Scheduler started (cron: every minute)')

  // Refresh confirmedUntil from schedule on startup so it's always current
  if (store.schedule) {
    store.confirmedUntil = nextSleepTime(store.schedule.sleepMinutes, store.schedule.timezone)
  }
}

export { nextSleepTime }
