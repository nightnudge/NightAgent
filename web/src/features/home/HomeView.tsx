import { Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../../store/useSettings'
import { useNow } from '../../hooks/useNow'
import { computeBedtimeCountdown } from '../../lib/bedtimeCountdown'
import { currentStreak } from '../../lib/streak'
import { StreakBox } from './StreakBox'
import { CountdownCard } from './CountdownCard'
import { ConfirmButton } from './ConfirmButton'
import { TimeRow } from './TimeRow'
import styles from './HomeView.module.css'

export function HomeView() {
  const settings = useSettings()
  const navigate = useNavigate()
  const now = useNow()

  const countdown = computeBedtimeCountdown(settings, now)
  const streak = currentStreak(settings, now)

  return (
    <div className={styles.root}>
      <div className={styles.navBar}>
        <h1 className={styles.title}>NightNudge</h1>
        <button
          type="button"
          className={styles.settingsButton}
          onClick={() => navigate('/settings')}
          aria-label="Einstellungen"
        >
          <Settings size={22} strokeWidth={1.5} />
        </button>
      </div>

      <div className={styles.streakWrap}>
        <StreakBox streak={streak} />
      </div>

      <div className={styles.spacer} />
      <CountdownCard countdown={countdown} />
      <div className={styles.spacer} />

      <div className={styles.confirmWrap}>
        <ConfirmButton isConfirmed={countdown.isConfirmed} />
      </div>
      <div className={styles.timeWrap}>
        <TimeRow sleepMinutes={settings.sleepMinutes} wakeMinutes={settings.wakeMinutes} />
      </div>
    </div>
  )
}
