import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { WidgetPreview } from './WidgetPreview'
import styles from './WidgetPage.module.css'

export function WidgetPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <button type="button" className={styles.back} onClick={() => navigate('/')}>
        <ArrowLeft size={17} />
        Zurück
      </button>

      <div className={styles.previewWrap}>
        <WidgetPreview />
      </div>

      <h1 className={styles.title}>Web-Widget</h1>
      <p className={styles.body}>
        Echte Home-Bildschirm-Widgets gibt es im Browser nicht. Diese Karte zeigt dieselben
        Live-Daten wie das iOS-Widget und lässt sich als eigene Verknüpfung auf deinen
        Home-Bildschirm legen.
      </p>

      <div className={styles.tips}>
        <p className={styles.tipsTitle}>Verknüpfung einrichten</p>
        <ul className={styles.tipsList}>
          <li>iOS Safari: Teilen-Symbol → „Zum Home-Bildschirm"</li>
          <li>Android Chrome: Menü → „App installieren"</li>
          <li>Desktop: Adresszeile → Installations-Symbol</li>
        </ul>
      </div>
    </div>
  )
}
