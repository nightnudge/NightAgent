import styles from './PageIndicator.module.css'

interface PageIndicatorProps {
  count: number
  current: number
  onSelect?: (index: number) => void
}

export function PageIndicator({ count, current, onSelect }: PageIndicatorProps) {
  return (
    <div className={styles.row} role="tablist" aria-label="Onboarding-Fortschritt">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          className={i === current ? styles.dotActive : styles.dot}
          role="tab"
          aria-selected={i === current}
          aria-label={`Seite ${i + 1}`}
          onClick={() => onSelect?.(i)}
        />
      ))}
    </div>
  )
}
