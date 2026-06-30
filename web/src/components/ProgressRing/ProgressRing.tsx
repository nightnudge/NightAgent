import type { ReactNode } from 'react'
import styles from './ProgressRing.module.css'

interface ProgressRingProps {
  /** 0-1 */
  progress: number
  size: number
  strokeWidth?: number
  color: string
  trackColor?: string
  children?: ReactNode
}

/** Circular progress indicator with centered content, used for the bedtime countdown. */
export function ProgressRing({
  progress,
  size,
  strokeWidth = 6,
  color,
  trackColor = 'rgba(255, 255, 255, 0.08)',
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(1, Math.max(0, progress))
  const offset = circumference * (1 - clamped)
  const center = size / 2

  return (
    <div className={styles.wrap} style={{ width: size, height: size }}>
      <svg className={styles.svg} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          className={styles.progress}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className={styles.content}>{children}</div>
    </div>
  )
}
