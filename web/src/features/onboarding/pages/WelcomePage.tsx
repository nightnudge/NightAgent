import { MoonStar } from 'lucide-react'
import styles from './OnboardingPage.module.css'

export function WelcomePage() {
  return (
    <div className={styles.page}>
      <MoonStar size={72} strokeWidth={1.5} color="var(--night-accent-glow)" />
      <h1 className={styles.title}>
        Willkommen bei
        <br />
        NightNudge
      </h1>
      <p className={styles.body}>
        Du wirst dabei unterstützt, abends rechtzeitig das Handy wegzulegen. Kein Zwang – aber ein
        guter Begleiter, der dich erinnert.
      </p>
    </div>
  )
}
