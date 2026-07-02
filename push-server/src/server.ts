import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import webpush from 'web-push'
import { store } from './store'
import { startScheduler, nextSleepTime } from './scheduler'

// ── VAPID setup ─────────────────────────────────────────────────────────────

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY ?? ''
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? ''
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? 'mailto:nightnudge@example.com'

if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
  console.error('Missing VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY — set them as env vars')
  process.exit(1)
}

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)

// ── Express app ─────────────────────────────────────────────────────────────

const app = express()
app.use(express.json())
app.use(cors({
  origin: (origin, cb) => {
    const allowed = process.env.ALLOWED_ORIGINS?.split(',') ?? ['https://nightnudge.github.io']
    if (!origin || allowed.includes(origin) || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      cb(null, true)
    } else {
      cb(new Error(`CORS: origin "${origin}" not allowed`))
    }
  },
}))

// ── Routes ───────────────────────────────────────────────────────────────────

/** Client fetches this to get the public VAPID key for subscribing. */
app.get('/vapid-public-key', (_req, res) => {
  res.json({ key: VAPID_PUBLIC })
})

/** Registers (or re-registers) a push subscription + the user's schedule. */
app.post('/subscribe', (req, res) => {
  const { subscription, schedule } = req.body as {
    subscription?: typeof store.subscription
    schedule?: typeof store.schedule
  }
  if (!subscription?.endpoint || !schedule?.timezone) {
    res.status(400).json({ error: 'subscription.endpoint and schedule.timezone are required' })
    return
  }
  store.subscription = subscription
  store.schedule = schedule
  console.log(`Subscription registered  tz=${schedule.timezone}  sleep=${schedule.sleepMinutes}min`)
  res.json({ ok: true })
})

/** Updates the schedule without changing the subscription (used when settings change). */
app.patch('/schedule', (req, res) => {
  const { schedule } = req.body as { schedule?: typeof store.schedule }
  if (!schedule?.timezone) {
    res.status(400).json({ error: 'schedule.timezone is required' })
    return
  }
  store.schedule = schedule
  res.json({ ok: true })
})

/**
 * Marks that the user confirmed going to sleep.
 * Suppresses follow-up notifications until the next sleep cycle.
 */
app.post('/confirm', (_req, res) => {
  if (store.schedule) {
    store.confirmedUntil = nextSleepTime(store.schedule.sleepMinutes, store.schedule.timezone)
    console.log(`Confirmed sleep — follow-ups suppressed until ${store.confirmedUntil.toISOString()}`)
  }
  res.json({ ok: true })
})

/** Clears the subscription — browser has already unsubscribed. */
app.delete('/unsubscribe', (_req, res) => {
  store.subscription = null
  store.schedule = null
  res.json({ ok: true })
})

app.get('/health', (_req, res) => res.json({ ok: true, subscription: !!store.subscription }))

// ── Start ────────────────────────────────────────────────────────────────────

const port = Number(process.env.PORT ?? 3000)
app.listen(port, () => console.log(`NightNudge push-server listening on :${port}`))

startScheduler()
