import { MoonBackground } from './MoonBackground'
import styles from './Background.module.css'

/** App-wide backdrop: dark green base, top glow, faint rotating moon. */
export function Background() {
  return (
    <div className={styles.background} aria-hidden="true">
      <div className={styles.glow} />
      <MoonBackground />
    </div>
  )
}
