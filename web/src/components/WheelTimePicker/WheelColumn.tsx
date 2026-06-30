import { useEffect, useRef } from 'react'
import styles from './WheelTimePicker.module.css'

export const ITEM_HEIGHT = 40
const VISIBLE_ROWS = 5
export const COLUMN_PADDING = (ITEM_HEIGHT * VISIBLE_ROWS - ITEM_HEIGHT) / 2
const SETTLE_DELAY_MS = 120

interface WheelColumnProps {
  count: number
  value: number
  onChange: (value: number) => void
  ariaLabel: string
}

/** One scroll-snapping column (hours or minutes) of the wheel picker. */
export function WheelColumn({ count, value, onChange, ariaLabel }: WheelColumnProps) {
  const ref = useRef<HTMLDivElement>(null)
  const settleTimeout = useRef<number | undefined>(undefined)

  // Keep the scroll position in sync when `value` changes from outside
  // (initial mount, or the value being reset elsewhere) without fighting
  // scroll position changes the user just produced themselves.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const target = value * ITEM_HEIGHT
    if (Math.abs(el.scrollTop - target) > 1) el.scrollTop = target
  }, [value])

  useEffect(() => () => window.clearTimeout(settleTimeout.current), [])

  const settle = (index: number) => {
    ref.current?.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' })
  }

  const handleScroll = () => {
    window.clearTimeout(settleTimeout.current)
    settleTimeout.current = window.setTimeout(() => {
      const el = ref.current
      if (!el) return
      const index = Math.min(count - 1, Math.max(0, Math.round(el.scrollTop / ITEM_HEIGHT)))
      if (index !== value) onChange(index)
      else settle(index)
    }, SETTLE_DELAY_MS)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const next = Math.max(0, value - 1)
      settle(next)
      onChange(next)
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      const next = Math.min(count - 1, value + 1)
      settle(next)
      onChange(next)
    }
  }

  return (
    <div
      ref={ref}
      className={`${styles.column} no-scrollbar`}
      onScroll={handleScroll}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="listbox"
      aria-label={ariaLabel}
      aria-activedescendant={`wheel-item-${ariaLabel}-${value}`}
    >
      <div className={styles.spacer} style={{ height: COLUMN_PADDING }} />
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          id={`wheel-item-${ariaLabel}-${i}`}
          type="button"
          tabIndex={-1}
          role="option"
          aria-selected={i === value}
          className={i === value ? styles.itemActive : styles.item}
          onClick={() => settle(i)}
        >
          {String(i).padStart(2, '0')}
        </button>
      ))}
      <div className={styles.spacer} style={{ height: COLUMN_PADDING }} />
    </div>
  )
}
