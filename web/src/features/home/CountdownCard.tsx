import type { BedtimeCountdown } from '../../lib/bedtimeCountdown'
import { ProgressRing } from '../../components/ProgressRing/ProgressRing'
import styles from './CountdownCard.module.css'

interface CountdownCardProps {
  countdown: BedtimeCountdown
}

export function CountdownCard({ countdown }: CountdownCardProps) {
  const { time, sub, isWarning, progress } = countdown
  const color = isWarning ? 'var(--night-status-red)' : 'var(--night-status-green)'

  return (
    <div className={styles.card}>
      <ProgressRing progress={progress} size={216} strokeWidth={5} color={color}>
        <div className={styles.center}>
          <span className={styles.label}>Bis zur Schlafzeit</span>
          <span className={styles.time} style={{ color }}>
            {time}
          </span>
          <span className={styles.sub} style={{ color }}>
            {sub}
          </span>
        </div>
      </ProgressRing>
    </div>
  )
}
