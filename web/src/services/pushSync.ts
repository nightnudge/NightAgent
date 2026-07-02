import type { SettingsState } from '../types/settings'

const SERVER = (import.meta.env.VITE_PUSH_SERVER_URL as string | undefined)?.replace(/\/$/, '') ?? ''

function supported(): boolean {
  return !!SERVER && 'serviceWorker' in navigator && 'PushManager' in window
}

function urlBase64ToUint8Array(base64: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  const buf = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i)
  return buf.buffer
}

async function fetchVapidKey(): Promise<string> {
  const res = await fetch(`${SERVER}/vapid-public-key`)
  if (!res.ok) throw new Error(`VAPID key fetch failed: ${res.status}`)
  const { key } = (await res.json()) as { key: string }
  return key
}

function buildSchedule(s: SettingsState) {
  return {
    sleepMinutes: s.sleepMinutes,
    reminderOffsets: s.reminderOffsets,
    annoyanceLevel: s.annoyanceLevel,
    factMode: s.factMode,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    iconUrl: `${window.location.origin}${import.meta.env.BASE_URL}icons/icon-192.png`,
  }
}

/**
 * Subscribes (or re-subscribes) to browser push and syncs the current
 * schedule with the push server. Called on every app open when notifications
 * are enabled so the server always has an up-to-date subscription + schedule.
 */
export async function syncPushSubscription(settings: SettingsState): Promise<void> {
  if (!supported() || Notification.permission !== 'granted') return
  try {
    const vapidKey = await fetchVapidKey()
    const reg = await navigator.serviceWorker.ready

    let sub = await reg.pushManager.getSubscription()
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })
    }

    await fetch(`${SERVER}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub.toJSON(), schedule: buildSchedule(settings) }),
    })
  } catch (err) {
    console.warn('[push] syncPushSubscription failed:', err)
  }
}

/** Sends updated schedule to server when user changes reminder settings. */
export async function updatePushSchedule(settings: SettingsState): Promise<void> {
  if (!supported()) return
  try {
    await fetch(`${SERVER}/schedule`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schedule: buildSchedule(settings) }),
    })
  } catch (err) {
    console.warn('[push] updatePushSchedule failed:', err)
  }
}

/** Tells the server the user confirmed going to sleep (suppresses follow-ups). */
export async function confirmSleepOnServer(): Promise<void> {
  if (!supported()) return
  try {
    await fetch(`${SERVER}/confirm`, { method: 'POST' })
  } catch {}
}

/** Unsubscribes from push and notifies the server. */
export async function unsubscribeFromPush(): Promise<void> {
  if (!supported()) return
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    await sub?.unsubscribe()
    await fetch(`${SERVER}/unsubscribe`, { method: 'DELETE' })
  } catch (err) {
    console.warn('[push] unsubscribeFromPush failed:', err)
  }
}
