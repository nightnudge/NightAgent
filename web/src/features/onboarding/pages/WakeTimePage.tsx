import { Sunrise } from 'lucide-react'
import { WheelTimePicker } from '../../../components/WheelTimePicker/WheelTimePicker'
import { useSettings } from '../../../store/useSettings'
import { formatSleepDuration, sleepDurationMinutes } from '../../../lib/time'
import { PageHeader } from '../components/PageHeader'
import styles from './OnboardingPage.module.css'

export function WakeTimePage() {
  const { sleepMinutes, wakeMinutes, setWakeMinutes } = useSettings()
  const duration = sleepDurationMinutes(sleepMinutes, wakeMinutes)

  return (
    <div className={styles.page}>
      <PageHeader icon={<Sunrise size={52} strokeWidth={1.5} />} title="Wann stehst du auf?" />
      <WheelTimePicker
        valueMinutes={wakeMinutes}
        onChange={setWakeMinutes}
        ariaLabel="Aufwachzeit"
      />
      <span className={styles.body}>Das sind {formatSleepDuration(duration)} Schlaf</span>
    </div>
  )
}
