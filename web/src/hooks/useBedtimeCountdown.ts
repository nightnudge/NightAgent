import { useNow } from './useNow'
import { useSettings } from '../store/useSettings'
import { computeBedtimeCountdown, type BedtimeCountdown } from '../lib/bedtimeCountdown'

/** Standalone countdown hook (runs its own clock) for views not already ticking. */
export function useBedtimeCountdown(): BedtimeCountdown {
  const settings = useSettings()
  const now = useNow()
  return computeBedtimeCountdown(settings, now)
}
