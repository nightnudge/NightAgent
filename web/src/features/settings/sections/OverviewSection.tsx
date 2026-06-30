import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../../../store/useSettings'
import { formatSleepDuration, sleepDurationMinutes } from '../../../lib/time'
import { SettingsSection } from '../components/SettingsSection'
import { SettingsRow } from '../components/SettingsRow'
import styles from './OverviewSection.module.css'

export function OverviewSection() {
  const { sleepMinutes, wakeMinutes } = useSettings()
  const navigate = useNavigate()
  const duration = sleepDurationMinutes(sleepMinutes, wakeMinutes)

  return (
    <SettingsSection title="Übersicht">
      <SettingsRow
        label="Schlafdauer"
        trailing={<span className={styles.value}>{formatSleepDuration(duration)}</span>}
      />
      <button type="button" className={styles.widgetRow} onClick={() => navigate('/widget')}>
        <span className={styles.widgetLabel}>Widget-Vorschau</span>
        <ChevronRight size={16} className={styles.chevron} />
      </button>
    </SettingsSection>
  )
}
