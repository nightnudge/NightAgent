import { Flame } from 'lucide-react'
import { STREAK_TIER_COLOR_VAR, streakTier } from '../../lib/streak'
import styles from './StreakBox.module.css'

interface StreakBoxProps {
  streak: number
}

export function StreakBox({ streak }: StreakBoxProps) {
  const tier = streakTier(streak)
  const color = tier ? STREAK_TIER_COLOR_VAR[tier] : undefined

  return (
    <div
      className={styles.box}
      style={
        color
          ? { borderColor: color, boxShadow: `0 0 10px color-mix(in srgb, ${color} 35%, transparent)` }
          : undefined
      }
    >
      <Flame size={22} color={color ?? 'var(--night-text-secondary)'} />
      <div className={styles.text}>
        <span className={styles.caption}>Deine Streak</span>
        <span className={styles.value}>
          {streak} {streak === 1 ? 'Tag' : 'Tage'}
        </span>
      </div>
    </div>
  )
}
