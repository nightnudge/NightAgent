import { Flame } from 'lucide-react'
import { useSettings } from '../../store/useSettings'
import { useNow } from '../../hooks/useNow'
import { computeBedtimeCountdown } from '../../lib/bedtimeCountdown'
import { STREAK_TIER_COLOR_VAR, currentStreak, streakTier } from '../../lib/streak'
import styles from './WidgetPreview.module.css'

/**
 * Visual stand-in for NightAgentWidget.swift's home-screen widget. Browsers
 * can't place real widgets on the OS home screen, so this live-data card is
 * the closest equivalent - see WidgetPage for the install-as-shortcut flow.
 */
export function WidgetPreview() {
  const settings = useSettings()
  const now = useNow()
  const countdown = computeBedtimeCountdown(settings, now)
  const streak = currentStreak(settings, now)
  const tier = streakTier(streak)
  const tierColor = tier ? STREAK_TIER_COLOR_VAR[tier] : undefined
  const color = countdown.isWarning ? 'var(--night-status-red)' : 'var(--night-status-green)'

  return (
    <div className={styles.widget}>
      <div className={styles.countdown}>
        <span className={styles.label}>Bis Schlafzeit</span>
        <span className={styles.time} style={{ color }}>
          {countdown.time}
        </span>
      </div>
      <div className={styles.streak} style={tierColor ? { borderColor: tierColor } : undefined}>
        <Flame size={13} color={tierColor ?? 'var(--night-text-secondary)'} />
        <div className={styles.streakText}>
          <span className={styles.streakCaption}>Deine Streak</span>
          <span className={styles.streakValue}>
            {streak} {streak === 1 ? 'Tag' : 'Tage'}
          </span>
        </div>
      </div>
    </div>
  )
}
