import { createContext } from 'react'
import type { AnnoyanceLevel, FactMode, SettingsState } from '../types/settings'

export interface SettingsActions {
  setSleepMinutes: (minutes: number) => void
  setWakeMinutes: (minutes: number) => void
  setNotificationsEnabled: (enabled: boolean) => void
  setReminderOffsets: (offsets: number[]) => void
  setAnnoyanceLevel: (level: AnnoyanceLevel) => void
  setFactMode: (mode: FactMode) => void
  completeOnboarding: () => void
  confirmToday: () => void
  setLastFactIndex: (index: number) => void
  debugBumpStreak: () => void
  debugResetStreak: () => void
}

export type SettingsContextValue = SettingsState & SettingsActions

export const SettingsContext = createContext<SettingsContextValue | null>(null)
