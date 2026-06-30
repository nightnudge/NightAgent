import type { ReactNode } from 'react'
import styles from './SettingsRow.module.css'

interface SettingsRowProps {
  label: string
  trailing?: ReactNode
}

/** One row of a SettingsSection card: label on the left, controls on the right. */
export function SettingsRow({ label, trailing }: SettingsRowProps) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      {trailing}
    </div>
  )
}
