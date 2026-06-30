import { WheelColumn } from './WheelColumn'
import styles from './WheelTimePicker.module.css'

interface WheelTimePickerProps {
  valueMinutes: number
  onChange: (minutes: number) => void
  ariaLabel?: string
}

/** Custom iOS-style scrolling wheel picker for hour:minute, mirroring DatePicker(.wheel). */
export function WheelTimePicker({
  valueMinutes,
  onChange,
  ariaLabel = 'Uhrzeit',
}: WheelTimePickerProps) {
  const hour = Math.floor(valueMinutes / 60)
  const minute = valueMinutes % 60

  return (
    <div className={styles.picker}>
      <div className={styles.highlight} aria-hidden="true" />
      <WheelColumn
        count={24}
        value={hour}
        onChange={(h) => onChange(h * 60 + minute)}
        ariaLabel={`${ariaLabel} Stunde`}
      />
      <span className={styles.colon} aria-hidden="true">
        :
      </span>
      <WheelColumn
        count={60}
        value={minute}
        onChange={(m) => onChange(hour * 60 + m)}
        ariaLabel={`${ariaLabel} Minute`}
      />
    </div>
  )
}
