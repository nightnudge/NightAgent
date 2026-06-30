import { useRegisterSW } from 'virtual:pwa-register/react'
import styles from './UpdateToast.module.css'

/** Small banner for service-worker lifecycle events (offline-ready / update available). */
export function UpdateToast() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError: (error) => console.error('Service worker registration failed', error),
  })

  if (!offlineReady && !needRefresh) return null

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div className={styles.toast} role="status">
      <span>
        {needRefresh
          ? 'Eine neue Version ist verfügbar.'
          : 'NightNudge ist jetzt offline verfügbar.'}
      </span>
      <div className={styles.actions}>
        {needRefresh && (
          <button type="button" className={styles.primary} onClick={() => updateServiceWorker(true)}>
            Aktualisieren
          </button>
        )}
        <button type="button" className={styles.dismiss} onClick={close}>
          Schließen
        </button>
      </div>
    </div>
  )
}
