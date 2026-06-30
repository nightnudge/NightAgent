import { Moon } from 'lucide-react'
import { WheelTimePicker } from '../../../components/WheelTimePicker/WheelTimePicker'
import { useSettings } from '../../../store/useSettings'
import { PageHeader } from '../components/PageHeader'
import styles from './OnboardingPage.module.css'

export function SleepTimePage() {
  const { sleepMinutes, setSleepMinutes } = useSettings()

  return (
    <div className={styles.page}>
      <PageHeader icon={<Moon size={52} strokeWidth={1.5} />} title="Wann willst du schlafen?" />
      <WheelTimePicker
        valueMinutes={sleepMinutes}
        onChange={setSleepMinutes}
        ariaLabel="Schlafenszeit"
      />
      <span className={styles.caption}>Ziel-Schlafenszeit</span>
    </div>
  )
}
