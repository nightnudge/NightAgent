import type { ReactNode } from 'react'
import { ArrowRight, Moon, Sunrise } from 'lucide-react'
import { clockString } from '../../lib/time'
import styles from './TimeRow.module.css'

interface TimeRowProps {
  sleepMinutes: number
  wakeMinutes: number
}

export function TimeRow({ sleepMinutes, wakeMinutes }: TimeRowProps) {
  return (
    <div className={styles.row}>
      <TimeCell icon={<Moon size={20} strokeWidth={1.5} />} label="Schlaf" minutes={sleepMinutes} />
      <ArrowRight size={15} className={styles.arrow} />
      <TimeCell icon={<Sunrise size={20} strokeWidth={1.5} />} label="Aufwach" minutes={wakeMinutes} />
    </div>
  )
}

function TimeCell({ icon, label, minutes }: { icon: ReactNode; label: string; minutes: number }) {
  return (
    <div className={styles.cell}>
      {icon}
      <span className={styles.time}>{clockString(minutes)}</span>
      <span className={styles.label}>{label}</span>
    </div>
  )
}
