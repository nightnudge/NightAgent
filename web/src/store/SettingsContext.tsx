import { useEffect, useMemo, useReducer, type ReactNode } from 'react'
import type { AnnoyanceLevel, FactMode } from '../types/settings'
import { settingsReducer } from './settingsReducer'
import { loadSettings, saveSettings } from './storage'
import { SettingsContext, type SettingsActions, type SettingsContextValue } from './context'

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(settingsReducer, undefined, loadSettings)

  useEffect(() => {
    saveSettings(state)
  }, [state])

  const actions = useMemo<SettingsActions>(
    () => ({
      setSleepMinutes: (minutes) => dispatch({ type: 'SET_SLEEP_MINUTES', minutes }),
      setWakeMinutes: (minutes) => dispatch({ type: 'SET_WAKE_MINUTES', minutes }),
      setNotificationsEnabled: (enabled) =>
        dispatch({ type: 'SET_NOTIFICATIONS_ENABLED', enabled }),
      setReminderOffsets: (offsets) => dispatch({ type: 'SET_REMINDER_OFFSETS', offsets }),
      setAnnoyanceLevel: (level: AnnoyanceLevel) => dispatch({ type: 'SET_ANNOYANCE_LEVEL', level }),
      setFactMode: (mode: FactMode) => dispatch({ type: 'SET_FACT_MODE', mode }),
      completeOnboarding: () => dispatch({ type: 'COMPLETE_ONBOARDING' }),
      confirmToday: () => dispatch({ type: 'CONFIRM_TODAY', now: Date.now() }),
      setLastFactIndex: (index) => dispatch({ type: 'SET_LAST_FACT_INDEX', index }),
      debugBumpStreak: () => dispatch({ type: 'DEBUG_BUMP_STREAK', now: Date.now() }),
      debugResetStreak: () => dispatch({ type: 'DEBUG_RESET_STREAK' }),
    }),
    [],
  )

  const value = useMemo<SettingsContextValue>(() => ({ ...state, ...actions }), [state, actions])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
