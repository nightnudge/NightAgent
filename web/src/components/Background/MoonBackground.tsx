import styles from './MoonBackground.module.css'

/**
 * Faint, slowly rotating decorative moon (outline + craters), ported from
 * ContentView.swift's MoonBackgroundView/MoonShape. Purely cosmetic.
 */
export function MoonBackground() {
  return (
    <div className={styles.wrapper} aria-hidden="true">
      <svg className={styles.moon} viewBox="0 0 200 200" fill="none" stroke="currentColor">
        <circle cx="100" cy="100" r="99" strokeWidth="1" />
        <ellipse cx="108" cy="88" rx="20" ry="17" strokeWidth="0.8" />
        <ellipse cx="64" cy="140" rx="22" ry="19" strokeWidth="0.8" />
        <ellipse cx="148" cy="120" rx="18" ry="21" strokeWidth="0.8" />
        <circle cx="48" cy="56" r="12" strokeWidth="0.65" />
        <circle cx="140" cy="50" r="11" strokeWidth="0.65" />
        <ellipse cx="144" cy="156" rx="13" ry="10" strokeWidth="0.65" />
        <circle cx="80" cy="112" r="7" strokeWidth="0.55" />
        <circle cx="116" cy="44" r="6" strokeWidth="0.55" />
        <circle cx="90" cy="70" r="4" strokeWidth="0.45" />
        <circle cx="124" cy="144" r="3.5" strokeWidth="0.45" />
        <circle cx="44" cy="116" r="4" strokeWidth="0.45" />
      </svg>
    </div>
  )
}
