import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useSettings } from '../../../store/useSettings'
import { clockString } from '../../../lib/time'
import { WheelTimePicker } from '../../../components/WheelTimePicker/WheelTimePicker'
import { SettingsSection } from '../components/SettingsSection'
import styles from './TimesSection.module.css'

type Field = 'sleep' | 'wake' | null

export function TimesSection() {
  const { sleepMinutes, setSleepMinutes, wakeMinutes, setWakeMinutes } = useSettings()
  const [expanded, setExpanded] = useState<Field>(null)

  const toggle = (field: Exclude<Field, null>) =>
    setExpanded((current) => (current === field ? null : field))

  return (
    <SettingsSection title="Zeiten">
      <button type="button" className={styles.row} onClick={() => toggle('sleep')}>
        <span className={styles.label}>Schlafzeit</span>
        <span className={styles.value}>
          {clockString(sleepMinutes)}
          <ChevronDown size={16} className={expanded === 'sleep' ? styles.chevronOpen : styles.chevron} />
        </span>
      </button>
      {expanded === 'sleep' && (
        <div className={styles.pickerWrap}>
          <WheelTimePicker valueMinutes={sleepMinutes} onChange={setSleepMinutes} ariaLabel="Schlafzeit" />
        </div>
      )}

      <button type="button" className={styles.row} onClick={() => toggle('wake')}>
        <span className={styles.label}>Aufwachzeit</span>
        <span className={styles.value}>
          {clockString(wakeMinutes)}
          <ChevronDown size={16} className={expanded === 'wake' ? styles.chevronOpen : styles.chevron} />
        </span>
      </button>
      {expanded === 'wake' && (
        <div className={styles.pickerWrap}>
          <WheelTimePicker valueMinutes={wakeMinutes} onChange={setWakeMinutes} ariaLabel="Aufwachzeit" />
        </div>
      )}
    </SettingsSection>
  )
}
