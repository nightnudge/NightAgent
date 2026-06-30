import type { ReactNode } from 'react'
import styles from './SettingsSection.module.css'

interface SettingsSectionProps {
  title: string
  footer?: string
  children: ReactNode
}

/** Grouped card with a caption header, mirroring SwiftUI Form Section styling. */
export function SettingsSection({ title, footer, children }: SettingsSectionProps) {
  return (
    <section className={styles.section}>
      <h2 className={styles.header}>{title}</h2>
      <div className={styles.card}>{children}</div>
      {footer && <p className={styles.footer}>{footer}</p>}
    </section>
  )
}
