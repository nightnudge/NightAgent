import { useState } from 'react'
import { ChevronDown, CircleCheckBig } from 'lucide-react'
import { useSettings } from '../../../store/useSettings'
import { ANNOYANCE_LABELS, FACT_MODE_LABELS } from '../../../types/settings'
import type { AnnoyanceLevel, FactMode } from '../../../types/settings'
import { SettingsSection } from '../components/SettingsSection'
import styles from './BehaviourSection.module.css'

const ANNOYANCE_LEVELS: AnnoyanceLevel[] = [0, 1, 2, 3]
const FACT_MODES: FactMode[] = [0, 1]

const ANNOYANCE_FOOTERS: Record<AnnoyanceLevel, string> = {
  0: 'Sanft: Nur normale Erinnerungen.',
  1: 'Normal: Erinnerungen + Hinweis wenn du über der Schlafzeit bist.',
  2: 'Streng: Zusätzliche Folge-Notifications, wenn du nicht bestätigt hast.',
  3: 'Sehr streng: Folge-Notifications + Bestätigungs-Screen beim App-Öffnen.',
}

type Group = 'annoyance' | 'fact' | null

export function BehaviourSection() {
  const { annoyanceLevel, setAnnoyanceLevel, factMode, setFactMode } = useSettings()
  const [expanded, setExpanded] = useState<Group>(null)

  const toggle = (group: Exclude<Group, null>) =>
    setExpanded((current) => (current === group ? null : group))

  return (
    <SettingsSection title="Verhalten" footer={ANNOYANCE_FOOTERS[annoyanceLevel]}>
      <button type="button" className={styles.row} onClick={() => toggle('annoyance')}>
        <span className={styles.label}>Erinnerungsintensität</span>
        <span className={styles.value}>
          {ANNOYANCE_LABELS[annoyanceLevel]}
          <ChevronDown size={16} className={expanded === 'annoyance' ? styles.chevronOpen : styles.chevron} />
        </span>
      </button>
      {expanded === 'annoyance' && (
        <div className={styles.options} role="radiogroup" aria-label="Erinnerungsintensität">
          {ANNOYANCE_LEVELS.map((level) => (
            <OptionRow
              key={level}
              label={ANNOYANCE_LABELS[level]}
              selected={annoyanceLevel === level}
              onSelect={() => setAnnoyanceLevel(level)}
            />
          ))}
        </div>
      )}

      <button type="button" className={styles.row} onClick={() => toggle('fact')}>
        <span className={styles.label}>Faktenmodus</span>
        <span className={styles.value}>
          {FACT_MODE_LABELS[factMode]}
          <ChevronDown size={16} className={expanded === 'fact' ? styles.chevronOpen : styles.chevron} />
        </span>
      </button>
      {expanded === 'fact' && (
        <div className={styles.options} role="radiogroup" aria-label="Faktenmodus">
          {FACT_MODES.map((mode) => (
            <OptionRow
              key={mode}
              label={FACT_MODE_LABELS[mode]}
              selected={factMode === mode}
              onSelect={() => setFactMode(mode)}
            />
          ))}
        </div>
      )}
    </SettingsSection>
  )
}

function OptionRow({
  label,
  selected,
  onSelect,
}: {
  label: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      className={styles.option}
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
    >
      <span className={selected ? styles.optionLabelSelected : styles.optionLabel}>{label}</span>
      {selected && <CircleCheckBig size={17} className={styles.check} />}
    </button>
  )
}
