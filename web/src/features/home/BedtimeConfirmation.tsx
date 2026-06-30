import { MoonStar } from 'lucide-react'
import { useSettings } from '../../store/useSettings'
import { clockString } from '../../lib/time'
import { PrimaryButton } from '../../components/buttons/PrimaryButton'
import { TextButton } from '../../components/buttons/TextButton'
import styles from './BedtimeConfirmation.module.css'

interface BedtimeConfirmationProps {
  onDismiss: () => void
}

/**
 * Full-screen "Sehr streng" interrupt shown once bedtime has passed
 * unconfirmed. Ported from ContentView.swift's BedtimeConfirmationView.
 */
export function BedtimeConfirmation({ onDismiss }: BedtimeConfirmationProps) {
  const { sleepMinutes, confirmToday } = useSettings()

  const handleConfirm = () => {
    confirmToday()
    onDismiss()
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <MoonStar size={72} strokeWidth={1.5} color="var(--night-accent-glow)" />
        <h1 className={styles.title}>Es ist Schlafenszeit</h1>
        <p className={styles.body}>
          Du wolltest um {clockString(sleepMinutes)} schlafen.
          <br />
          Leg das Handy jetzt weg.
        </p>
      </div>
      <div className={styles.actions}>
        <PrimaryButton onClick={handleConfirm}>Ich gehe jetzt schlafen</PrimaryButton>
        <TextButton onClick={onDismiss}>Ich brauche noch etwas</TextButton>
      </div>
    </div>
  )
}
