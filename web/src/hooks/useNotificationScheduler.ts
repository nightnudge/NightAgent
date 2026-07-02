import { useEffect, useRef } from 'react'
import { useSettings } from '../store/useSettings'
import {
  markSkippedToday,
  scheduleSnoozeNotification,
  tickNotifications,
} from '../services/notificationRunner'
import {
  syncPushSubscription,
  updatePushSchedule,
  unsubscribeFromPush,
  confirmSleepOnServer,
} from '../services/pushSync'

const TICK_INTERVAL_MS = 15_000

type NotificationActionMessage = {
  type: 'notification-action'
  action: 'confirm' | 'snooze' | 'skip'
}

function isActionMessage(data: unknown): data is NotificationActionMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as { type?: unknown }).type === 'notification-action'
  )
}

/**
 * Runs the whole notification system from the app root:
 *  - polls the schedule every 15 s while the app is open (local fallback)
 *  - syncs a push subscription with the push server so notifications also
 *    arrive when the app is closed (background push)
 *  - applies `?action=confirm|snooze|skip` from manifest shortcuts / SW
 *  - listens for messages the service worker forwards from notification
 *    action clicks while the app is open
 */
export function useNotificationScheduler(): void {
  const settings = useSettings()
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  // ── Local polling (works while app is in foreground) ──────────────────────
  useEffect(() => {
    if (!settings.notificationsEnabled) return
    tickNotifications(settingsRef.current, new Date())
    const id = window.setInterval(() => {
      tickNotifications(settingsRef.current, new Date())
    }, TICK_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [settings.notificationsEnabled])

  // ── Push subscription (re-sync on every mount / enable toggle) ────────────
  useEffect(() => {
    if (settings.notificationsEnabled) {
      void syncPushSubscription(settings)
    } else {
      void unsubscribeFromPush()
    }
    // intentionally omitting all settings fields — only notificationsEnabled
    // controls whether we subscribe; schedule sync is handled below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.notificationsEnabled])

  // ── Schedule sync whenever reminder settings change ───────────────────────
  useEffect(() => {
    if (!settings.notificationsEnabled) return
    void updatePushSchedule(settings)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    settings.notificationsEnabled,
    settings.sleepMinutes,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(settings.reminderOffsets),
    settings.annoyanceLevel,
    settings.factMode,
  ])

  // ── Notification action handling ──────────────────────────────────────────
  useEffect(() => {
    const applyAction = (action: string | null) => {
      const current = settingsRef.current
      if (action === 'confirm') {
        current.confirmToday()
        void confirmSleepOnServer()
      } else if (action === 'snooze') {
        scheduleSnoozeNotification()
      } else if (action === 'skip') {
        markSkippedToday(current, new Date())
      }
    }

    const params = new URLSearchParams(window.location.search)
    const initialAction = params.get('action')
    if (initialAction) {
      applyAction(initialAction)
      params.delete('action')
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`
      window.history.replaceState(null, '', next)
    }

    const onMessage = (event: MessageEvent) => {
      if (isActionMessage(event.data)) applyAction(event.data.action)
    }
    navigator.serviceWorker?.addEventListener('message', onMessage)
    return () => navigator.serviceWorker?.removeEventListener('message', onMessage)
  }, [])
}
