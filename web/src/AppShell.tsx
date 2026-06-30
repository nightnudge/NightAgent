import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Background } from './components/Background/Background'
import { UpdateToast } from './components/UpdateToast/UpdateToast'
import { useSettings } from './store/useSettings'
import { useNotificationScheduler } from './hooks/useNotificationScheduler'
import { useAppBadge } from './hooks/useAppBadge'
import { useOnForeground } from './hooks/useOnForeground'
import { isPastBedtime } from './lib/cycle'
import { OnboardingView } from './features/onboarding/OnboardingView'
import { HomeView } from './features/home/HomeView'
import { BedtimeConfirmation } from './features/home/BedtimeConfirmation'
import { SettingsView } from './features/settings/SettingsView'
import { WidgetPage } from './features/widget/WidgetPage'
import styles from './AppShell.module.css'

function dismissSplash() {
  const splash = document.getElementById('splash')
  if (!splash) return
  splash.classList.add('splash-hidden')
  window.setTimeout(() => splash.remove(), 500)
}

/** "/" shows Onboarding until it's done, then the Home countdown screen. */
function RootGate() {
  const settings = useSettings()
  return settings.onboardingDone ? <HomeView /> : <OnboardingView />
}

export function AppShell() {
  const settings = useSettings()
  const [showBedtimeAlert, setShowBedtimeAlert] = useState(false)

  useNotificationScheduler()
  useAppBadge()

  useEffect(() => {
    dismissSplash()
  }, [])

  // Mirrors ContentView.swift's checkBedtimeAlert(): re-checked on mount and
  // every time the app regains focus, only ever relevant for "Sehr streng".
  useOnForeground(() => {
    if (!settings.onboardingDone || settings.annoyanceLevel !== 3 || settings.todayConfirmed) {
      return
    }
    if (isPastBedtime(settings.sleepMinutes, new Date())) {
      setShowBedtimeAlert(true)
    }
  })

  return (
    <div className={styles.viewport}>
      <Background />
      <div className={styles.stage}>
        <Routes>
          <Route path="/" element={<RootGate />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="/widget" element={<WidgetPage />} />
        </Routes>
      </div>
      {showBedtimeAlert && (
        <BedtimeConfirmation onDismiss={() => setShowBedtimeAlert(false)} />
      )}
      <UpdateToast />
    </div>
  )
}
