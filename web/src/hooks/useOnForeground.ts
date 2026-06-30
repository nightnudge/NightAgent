import { useEffect, useRef } from 'react'

/**
 * Runs `callback` once on mount and again every time the app regains focus
 * or becomes visible again. Mirrors SwiftUI's `.onAppear` +
 * `.onChange(of: scenePhase)` (`phase == .active`) used to re-check the
 * bedtime alert whenever the app comes back to the foreground.
 */
export function useOnForeground(callback: () => void): void {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    callbackRef.current()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') callbackRef.current()
    }
    const handleFocus = () => callbackRef.current()

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', handleFocus)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])
}
