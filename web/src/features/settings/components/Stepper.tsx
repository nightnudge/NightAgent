import { Minus, Plus } from 'lucide-react'
import styles from './Stepper.module.css'

interface StepperProps {
  value: number
  min: number
  max: number
  step: number
  label: string
  onChange: (value: number) => void
}

export function Stepper({ value, min, max, step, label, onChange }: StepperProps) {
  return (
    <div className={styles.stepper}>
      <span className={styles.value}>{label}</span>
      <button
        type="button"
        className={styles.button}
        disabled={value <= min}
        aria-label="Verringern"
        onClick={() => onChange(Math.max(min, value - step))}
      >
        <Minus size={14} />
      </button>
      <button
        type="button"
        className={styles.button}
        disabled={value >= max}
        aria-label="Erhöhen"
        onClick={() => onChange(Math.min(max, value + step))}
      >
        <Plus size={14} />
      </button>
    </div>
  )
}
