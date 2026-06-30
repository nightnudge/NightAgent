import { Circle, CircleCheckBig } from 'lucide-react'
import styles from './SelectionRow.module.css'

interface SelectionRowProps {
  title: string
  subtitle: string
  selected: boolean
  onSelect: () => void
}

export function SelectionRow({ title, subtitle, selected, onSelect }: SelectionRowProps) {
  return (
    <button
      type="button"
      className={selected ? styles.rowSelected : styles.row}
      onClick={onSelect}
      role="radio"
      aria-checked={selected}
    >
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        <span className={styles.subtitle}>{subtitle}</span>
      </span>
      {selected ? (
        <CircleCheckBig size={20} className={styles.iconSelected} />
      ) : (
        <Circle size={20} className={styles.icon} />
      )}
    </button>
  )
}
