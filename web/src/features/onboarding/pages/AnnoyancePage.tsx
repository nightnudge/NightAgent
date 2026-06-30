import { BellRing } from 'lucide-react'
import { useSettings } from '../../../store/useSettings'
import type { AnnoyanceLevel } from '../../../types/settings'
import { PageHeader } from '../components/PageHeader'
import { SelectionRow } from '../../../components/SelectionRow/SelectionRow'
import styles from './OnboardingPage.module.css'

const OPTIONS: { level: AnnoyanceLevel; title: string; subtitle: string }[] = [
  { level: 0, title: 'Sanft', subtitle: 'Nur normale Erinnerungen' },
  { level: 1, title: 'Normal', subtitle: 'Erinnerungen + Hinweis bei Überschreitung' },
  { level: 2, title: 'Streng', subtitle: 'Zusätzliche Follow-up Notifications' },
  { level: 3, title: 'Sehr streng', subtitle: 'Follow-ups + Bestätigungs-Screen in App' },
]

export function AnnoyancePage() {
  const { annoyanceLevel, setAnnoyanceLevel } = useSettings()

  return (
    <div className={`${styles.page} ${styles.tight}`}>
      <PageHeader
        icon={<BellRing size={52} strokeWidth={1.5} />}
        title="Wie hartnäckig darf ich sein?"
      />
      <div className={styles.rows} role="radiogroup" aria-label="Erinnerungsintensität">
        {OPTIONS.map((opt) => (
          <SelectionRow
            key={opt.level}
            title={opt.title}
            subtitle={opt.subtitle}
            selected={annoyanceLevel === opt.level}
            onSelect={() => setAnnoyanceLevel(opt.level)}
          />
        ))}
      </div>
    </div>
  )
}
