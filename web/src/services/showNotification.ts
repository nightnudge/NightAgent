/**
 * TS's bundled DOM lib doesn't model the Notification Actions/renotify
 * fields yet, even though Chromium's ServiceWorkerRegistration.showNotification
 * supports them. Declared locally instead of widening the global type.
 */
interface NotificationActionDescriptor {
  action: string
  title: string
  icon?: string
}

interface ExtendedNotificationOptions extends NotificationOptions {
  actions?: NotificationActionDescriptor[]
  renotify?: boolean
}

/**
 * Action identifiers mirror NotificationScheduler.swift's "NIGHT_REMINDER"
 * category (ACTION_CONFIRM / ACTION_SNOOZE / ACTION_SKIP). Action buttons on
 * notifications are only rendered by Chromium-based browsers via the Service
 * Worker; Safari/iOS shows the notification without buttons but otherwise
 * works fine.
 */
export const NOTIFICATION_ACTIONS: NotificationActionDescriptor[] = [
  { action: 'confirm', title: 'Ich schlafe jetzt' },
  { action: 'snooze', title: 'Noch 5 Min' },
  { action: 'skip', title: 'Heute aussetzen' },
]

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof Notification === 'undefined') return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

interface ShowOptions {
  tag?: string
  actions?: NotificationActionDescriptor[]
}

/** Shows a notification via the active Service Worker (so actions work), falling back to the plain API. */
export async function showLocalNotification(
  title: string,
  body: string,
  { tag, actions = NOTIFICATION_ACTIONS }: ShowOptions = {},
): Promise<void> {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready
      const options: ExtendedNotificationOptions = {
        body,
        icon: `${import.meta.env.BASE_URL}icons/icon-192.png`,
        badge: `${import.meta.env.BASE_URL}icons/icon-192.png`,
        tag,
        renotify: Boolean(tag),
        actions,
      }
      await registration.showNotification(title, options)
      return
    } catch {
      // Service worker unavailable - fall through to the plain Notification API.
    }
  }

  new Notification(title, { body, icon: `${import.meta.env.BASE_URL}icons/icon-192.png`, tag })
}
