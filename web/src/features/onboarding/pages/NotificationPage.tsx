import { useState } from 'react'
import { Bell, CircleCheckBig } from 'lucide-react'
import { useSettings } from '../../../store/useSettings'
import { requestNotificationPermission } from '../../../services/showNotification'
import { PrimaryButton } from '../../../components/buttons/PrimaryButton'
import { TextButton } from '../../../components/buttons/TextButton'
import { PageHeader } from '../components/PageHeader'
import styles from './OnboardingPage.module.css'
import pageStyles from './NotificationPage.module.css'

export function NotificationPage() {
  const settings = useSettings()
  const [granted, setGranted] = useState(false)
  const [requesting, setRequesting] = useState(false)

  const handleAllow = async () => {
    setRequesting(true)
    const ok = await requestNotificationPermission()
    setGranted(ok)
    settings.setNotificationsEnabled(ok)
    setRequesting(false)
  }

  const showGranted = granted || settings.notificationsEnabled

  return (
    <div className={styles.page}>
      <PageHeader icon={<Bell size={52} strokeWidth={1.5} />} title="Darf ich dich erinnern?" />
      <p className={styles.body}>
        NightNudge kann dich automatisch erinnern, rechtzeitig das Handy wegzulegen. Dafür
        brauchen wir deine Erlaubnis.
      </p>
      {showGranted ? (
        <span className={pageStyles.granted}>
          <CircleCheckBig size={18} />
          Notifications erlaubt
        </span>
      ) : (
        <div className={pageStyles.actions}>
          <PrimaryButton onClick={handleAllow} disabled={requesting}>
            Notifications erlauben
          </PrimaryButton>
          <TextButton onClick={() => settings.setNotificationsEnabled(false)}>
            Jetzt nicht
          </TextButton>
        </div>
      )}
    </div>
  )
}
