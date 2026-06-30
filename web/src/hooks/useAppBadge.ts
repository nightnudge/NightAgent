import { useEffect } from 'react'
import { useSettings } from '../store/useSettings'
import { useNow } from './useNow'
import { currentStreak } from '../lib/streak'

/**
 * Reflects the current streak on the installed PWA's app icon via the
 * Badging API (Chrome/Edge/iOS 16.4+ standalone). No native equivalent in
 * the Swift app - added as a small piece of the "best possible web
 * alternative" to home-screen widgets/glanceable state.
 */
export function useAppBadge(): void {
  const settings = useSettings()
  // Streak only changes once per night, a slow poll is enough.
  const now = useNow(60_000)
  const streak = currentStreak(settings, now)

  useEffect(() => {
    if (!('setAppBadge' in navigator)) return
    if (streak > 0) {
      void navigator.setAppBadge(streak).catch(() => {})
    } else {
      void navigator.clearAppBadge().catch(() => {})
    }
  }, [streak])
}
