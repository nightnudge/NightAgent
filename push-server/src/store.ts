export interface Schedule {
  sleepMinutes: number
  reminderOffsets: number[]
  annoyanceLevel: number
  factMode: number
  timezone: string
  iconUrl: string
}

export interface PushSubscriptionJSON {
  endpoint: string
  expirationTime?: number | null
  keys: { p256dh: string; auth: string }
}

export const store: {
  subscription: PushSubscriptionJSON | null
  schedule: Schedule | null
  firedMap: Record<string, string[]>
  factIndex: number
  confirmedUntil: Date | null
} = {
  subscription: null,
  schedule: null,
  firedMap: {},
  factIndex: 0,
  confirmedUntil: null,
}
