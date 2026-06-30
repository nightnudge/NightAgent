import { useSettings } from '../../../store/useSettings'
import { SettingsSection } from '../components/SettingsSection'
import styles from './DevSection.module.css'

/** Mirrors SwiftUI's `#if DEBUG` streak test buttons - stripped from production builds. */
export function DevSection() {
  const { debugBumpStreak, debugResetStreak } = useSettings()
  if (!import.meta.env.DEV) return null

  return (
    <SettingsSection
      title="Streak-Test (nur Debug)"
      footer={
        '„Streak +1" zählt die Streak hoch (zum Testen der Stufen-Rahmen), „Streak zurücksetzen" setzt sie auf 0. Nur in Debug-Builds sichtbar – Testpersonen sehen das nicht.'
      }
    >
      <button type="button" className={styles.bump} onClick={debugBumpStreak}>
        🔥 Streak +1 (Test)
      </button>
      <button type="button" className={styles.reset} onClick={debugResetStreak}>
        🗑️ Streak zurücksetzen
      </button>
    </SettingsSection>
  )
}
