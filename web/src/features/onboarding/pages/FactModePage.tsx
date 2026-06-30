import { Brain } from 'lucide-react'
import { useSettings } from '../../../store/useSettings'
import type { FactMode } from '../../../types/settings'
import { PageHeader } from '../components/PageHeader'
import { SelectionRow } from '../../../components/SelectionRow/SelectionRow'
import styles from './OnboardingPage.module.css'

const OPTIONS: { mode: FactMode; title: string; subtitle: string }[] = [
  { mode: 0, title: 'Motivierend', subtitle: 'Was guter Schlaf dir bringt' },
  {
    mode: 1,
    title: 'Motivierend + Warnend',
    subtitle: 'Vorteile und Nachteile von Schlafmangel',
  },
]

export function FactModePage() {
  const { factMode, setFactMode } = useSettings()

  return (
    <div className={`${styles.page} ${styles.tight}`}>
      <PageHeader
        icon={<Brain size={52} strokeWidth={1.5} />}
        title="Welche Fakten motivieren dich?"
      />
      <div className={styles.rows} role="radiogroup" aria-label="Faktenmodus">
        {OPTIONS.map((opt) => (
          <SelectionRow
            key={opt.mode}
            title={opt.title}
            subtitle={opt.subtitle}
            selected={factMode === opt.mode}
            onSelect={() => setFactMode(opt.mode)}
          />
        ))}
      </div>
    </div>
  )
}
