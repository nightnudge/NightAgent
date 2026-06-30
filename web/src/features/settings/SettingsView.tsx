import { useNavigate } from 'react-router-dom'
import { TimesSection } from './sections/TimesSection'
import { NotificationsSection } from './sections/NotificationsSection'
import { BehaviourSection } from './sections/BehaviourSection'
import { OverviewSection } from './sections/OverviewSection'
import { DevSection } from './sections/DevSection'
import styles from './SettingsView.module.css'

export function SettingsView() {
  const navigate = useNavigate()

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.title}>Einstellungen</h1>
        <button type="button" className={styles.done} onClick={() => navigate('/')}>
          Fertig
        </button>
      </div>
      <div className={styles.content}>
        <TimesSection />
        <NotificationsSection />
        <BehaviourSection />
        <OverviewSection />
        <DevSection />
      </div>
    </div>
  )
}
