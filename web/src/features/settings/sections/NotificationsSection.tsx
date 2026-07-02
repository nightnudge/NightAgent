import { useState } from 'react'
import { X } from 'lucide-react'
import { useSettings } from '../../../store/useSettings'
import { requestNotificationPermission, showLocalNotification } from '../../../services/showNotification'
import { Switch } from '../../../components/Switch/Switch'
import { SettingsSection } from '../components/SettingsSection'
import { SettingsRow } from '../components/SettingsRow'
import { Stepper } from '../components/Stepper'
import styles from './NotificationsSection.module.css'

const MAX_REMINDERS = 4

export function NotificationsSection() {
  const { notificationsEnabled, setNotificationsEnabled, reminderOffsets, setReminderOffsets } =
    useSettings()
  const [testState, setTestState] = useState<'idle' | 'sent' | 'error'>('idle')

  const sendTestNotification = async () => {
    try {
      await showLocalNotification(
        'Test-Benachrichtigung 🌙',
        'NightNudge-Benachrichtigungen funktionieren.',
        { tag: 'test' },
      )
      setTestState('sent')
    } catch {
      setTestState('error')
    }
    setTimeout(() => setTestState('idle'), 3000)
  }

  const handleToggle = async (enabled: boolean) => {
    if (!enabled) {
      setNotificationsEnabled(false)
      return
    }
    const granted = await requestNotificationPermission()
    setNotificationsEnabled(granted)
  }

  const updateOffset = (index: number, value: number) => {
    setReminderOffsets(reminderOffsets.map((o, i) => (i === index ? value : o)))
  }

  const removeOffset = (index: number) => {
    if (reminderOffsets.length <= 1) return
    setReminderOffsets(reminderOffsets.filter((_, i) => i !== index))
  }

  const addOffset = () => {
    if (reminderOffsets.length >= MAX_REMINDERS) return
    setReminderOffsets([...reminderOffsets, 15])
  }

  return (
    <SettingsSection title="Benachrichtigungen">
      <SettingsRow
        label="Benachrichtigungen"
        trailing={
          <Switch checked={notificationsEnabled} onChange={handleToggle} ariaLabel="Benachrichtigungen" />
        }
      />

      {notificationsEnabled &&
        reminderOffsets.map((offset, i) => (
          <SettingsRow
            key={i}
            label={`Erinnerung ${i + 1}`}
            trailing={
              <div className={styles.controls}>
                <Stepper
                  value={offset}
                  min={5}
                  max={120}
                  step={5}
                  label={`${offset} Min. vorher`}
                  onChange={(value) => updateOffset(i, value)}
                />
                {reminderOffsets.length > 1 && (
                  <button
                    type="button"
                    className={styles.remove}
                    aria-label={`Erinnerung ${i + 1} entfernen`}
                    onClick={() => removeOffset(i)}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            }
          />
        ))}

      {notificationsEnabled && reminderOffsets.length < MAX_REMINDERS && (
        <button type="button" className={styles.addButton} onClick={addOffset}>
          + Erinnerung hinzufügen
        </button>
      )}

      {notificationsEnabled && (
        <button type="button" className={styles.testButton} onClick={sendTestNotification}>
          {testState === 'sent' ? '✓ Gesendet' : testState === 'error' ? '✗ Fehler' : 'Test-Benachrichtigung senden'}
        </button>
      )}
    </SettingsSection>
  )
}
