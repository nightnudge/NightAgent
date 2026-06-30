import type { ReactNode } from 'react'
import styles from './PageHeader.module.css'

interface PageHeaderProps {
  icon: ReactNode
  title: string
}

export function PageHeader({ icon, title }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.icon}>{icon}</div>
      <h2 className={styles.title}>{title}</h2>
    </div>
  )
}
