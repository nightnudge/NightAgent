import { useEffect, useRef } from 'react'
import { useSettings } from '../store/useSettings'
import {
  markSkippedToday,
  scheduleSnoozeNotification,
  tickNotifications,
} from '../services/notificationRunner'

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
 * Runs the whole web notification system from the app root:
 *  - polls the schedule every few seconds while notifications are enabled
 *    (the closest browser equivalent to iOS's repeating calendar triggers)
 *  - applies `?action=confirm|snooze|skip` (used by the manifest shortcut
 *    and by the service worker when it has to open a fresh window because
 *    the action button was tapped while the app wasn't running)
 *  - listens for messages the service worker forwards from notification
 *    action clicks while the app is open
 */
export function useNotificationScheduler(): void {
  const settings = useSettings()
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  useEffect(() => {
    if (!settings.notificationsEnabled) return
    tickNotifications(settingsRef.current, new Date())
    const id = window.setInterval(() => {
      tickNotifications(settingsRef.current, new Date())
    }, TICK_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [settings.notificationsEnabled])

  useEffect(() => {
    const applyAction = (action: string | null) => {
      const current = settingsRef.current
      if (action === 'confirm') current.confirmToday()
      else if (action === 'snooze') scheduleSnoozeNotification()
      else if (action === 'skip') markSkippedToday(current, new Date())
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
