/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'

declare const self: ServiceWorkerGlobalScope

// Matches the Vite `base` the app was built with (e.g. '/' locally,
// '/NightAgent/' on GitHub Pages) so navigation/openWindow URLs resolve
// correctly regardless of host.
const base = import.meta.env.BASE_URL

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// SPA offline support: any navigation (/, /settings, /widget, ...) that
// isn't a precached asset falls back to the cached app shell.
registerRoute(new NavigationRoute(createHandlerBoundToURL(`${base}index.html`)))

self.addEventListener('install', () => {
  void self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

type NotificationAction = 'confirm' | 'snooze' | 'skip' | 'open'

/**
 * Mirrors the action handling in NightAgentApp.swift's NotificationDelegate.
 * The actual confirm/snooze/skip logic lives in the page (it owns
 * localStorage), so we forward the action to an open client. If the app
 * isn't open anywhere, we open it with `?action=` and let it apply the
 * action itself on load (see useNotificationScheduler).
 */
self.addEventListener('notificationclick', (event) => {
  const action = (event.action || 'open') as NotificationAction
  event.notification.close()

  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const client = clients[0]

      if (client) {
        client.postMessage({ type: 'notification-action', action })
        if ('focus' in client) await client.focus()
        return
      }

      await self.clients.openWindow(action === 'open' ? base : `${base}?action=${action}`)
    })(),
  )
})
