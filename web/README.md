# NightNudge — Web (PWA)

A Progressive Web App port of the **NightAgent** SwiftUI iOS app. Same dark-green
design, same onboarding flow, same countdown/streak/rank mechanics — rebuilt with
React, TypeScript and Vite so it installs and runs offline from any modern browser.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173, hot reload, PWA enabled in dev too
npm run build    # type-checks (tsc -b) then produces dist/
npm run preview  # serve the production build locally
npm run lint      # oxlint
```

Requires Node 18+. No backend, no environment variables — everything runs
client-side and persists to `localStorage`.

## Deployment (GitHub Pages)

A workflow at `.github/workflows/deploy-web.yml` builds and deploys this app
to GitHub Pages automatically on every push to `main` that touches `web/**`.

One-time setup: in the GitHub repo, go to **Settings → Pages → Build and
deployment → Source** and select **"GitHub Actions"**. After that, pushes
deploy automatically — no manual build/upload needed.

The app is served from a project-site subpath (`https://<user>.github.io/NightAgent/`),
so the build sets `base: '/NightAgent/'` via the `GITHUB_PAGES=true` env var
the workflow passes to `npm run build`. Building locally without that env var
keeps `base: '/'`, which is what `npm run dev`/`preview` expect.

## Installing as an app

- **Android / Desktop Chrome & Edge:** open the dev/preview URL, use the
  install icon in the address bar (or the in-app "Install" prompt).
- **iOS / iPadOS Safari:** Share → "Zum Home-Bildschirm". Standalone mode,
  status bar styling and the app icon are pre-configured in `index.html`.
- Once installed, the app launches full-screen, works offline, and survives
  reloads with all settings/streak data intact (`localStorage`).

## Architecture

```
src/
  AppShell.tsx            Root layout: routes, splash-screen teardown,
                           notification scheduler, app badge, bedtime overlay
  store/                  Global state (useReducer + Context, no external lib)
    SettingsContext.tsx     Provider — owns the reducer, persists on change
    useSettings.ts          Hook consumers import
    settingsReducer.ts      All state transitions (mirrors AppSettings.swift)
    storage.ts               localStorage read/write + migration-safe defaults
  types/settings.ts        SettingsState shape, defaults, enum labels
  lib/                      Pure functions, fully unit-testable
    time.ts                  minutes-of-day <-> Date helpers, formatting
    streak.ts                 night-bucketing, streak math, tier thresholds
    cycle.ts                  "current sleep cycle" / warning-window logic
    bedtimeCountdown.ts       countdown label + color used by Home & Widget
  services/
    showNotification.ts       Notification permission + display (SW-aware)
    notificationRunner.ts     Schedule builder, dedupe tracking, skip-today
  hooks/                     useNow, useOnForeground, useAppBadge,
                              useNotificationScheduler, useBedtimeCountdown
  features/
    onboarding/                6-page flow (Welcome, Sleep, Wake, Notifications,
                                Annoyance level, Fact mode) + PageIndicator
    home/                       Countdown card, streak box, confirm button,
                                bedtime full-screen confirmation
    settings/                   Overview / Times / Notifications / Behaviour /
                                Dev sections, reusable Row/Section/Stepper
    widget/                     Home-screen-widget stand-in (see below)
  components/                 Background (animated moon), WheelTimePicker,
                              ProgressRing, Switch, SelectionRow, buttons
  data/facts.ts               13 German sleep-science facts (ported verbatim)
  sw.ts                       Service worker (Workbox precache + SPA routing
                              + notification action handling)
```

State shape, reducer actions and persistence logic are a direct port of
`UserSettings.swift` / `AppSettings`; `lib/time.ts` and `lib/streak.ts` mirror
the date-math in the original `NotificationScheduler.swift` (sleep/wake are
stored as **minutes-of-day integers**, exactly as the Swift code derived them
via `Calendar.component`).

## Feature parity with the iOS app

| iOS (SwiftUI)                          | Web (PWA)                                              |
| --------------------------------------- | -------------------------------------------------------- |
| `OnboardingView` (6 pages)              | `features/onboarding` — identical copy, page indicator   |
| `ContentView` countdown + confirm        | `features/home` — same colors, same warning threshold    |
| Streak counter, tier border colors       | `lib/streak.ts` — gold/platinum/ruby/diamond thresholds  |
| `SettingsView`                           | `features/settings` — same sections & controls           |
| `NotificationContent.swift` facts pool   | `data/facts.ts` — all 13 facts ported verbatim           |
| `NotificationScheduler.swift`            | `services/notificationRunner.ts` (see limitation below)  |
| `NightAgentWidget` (Home Screen widget)  | `features/widget` — live preview card + install shortcut |
| App icon, launch screen                  | `public/icons/*`, `#splash` in `index.html`               |
| Dark-green theme (`NightColors.swift`)   | `styles/theme.css` — every color token ported 1:1         |

## PWA implementation

- **Manifest** (`vite.config.ts`): name, theme/background color, standalone
  display, portrait orientation, maskable + any icons (192/512), two
  shortcuts (`/?action=confirm`, `/widget`).
- **Service worker** (`src/sw.ts`, `injectManifest` strategy): precaches the
  built app shell via Workbox, serves a SPA navigation fallback so deep links
  work offline, and turns notification-action clicks into either a
  `postMessage` to an open tab or a new window with `?action=...`.
- **Offline:** after the first load, the app (including the self-hosted
  Nunito variable font) works with no network connection.
- **Update flow:** `components/UpdateToast` listens for a waiting service
  worker and lets the user apply the update on demand instead of silently
  reloading.

### Notifications — known web limitation

iOS uses repeating `UNCalendarNotificationTrigger`s that fire even when the
app isn't running. Browsers have no equivalent for **local** (non-push)
notifications — a page (or its service worker) can only react while it's
loaded. This port's best-effort equivalent:

- `useNotificationScheduler` polls the computed schedule every 15s while the
  tab/installed app is open (foreground or backgrounded-but-alive), and
  de-dupes firings per id/per-day in `localStorage`.
- Notifications are shown via `ServiceWorkerRegistration.showNotification`
  (so action buttons work on Chrome/Edge/Android) with a `Notification`
  fallback elsewhere.
- "Heute aussetzen" (skip) suppresses notifications only for the current
  sleep cycle, then clears automatically — a small, intentional improvement
  over the native build's permanent-removal behavior.
- For true background delivery you'd need a push server (Web Push); out of
  scope for this offline-first, backend-free port.

### Widget — known web limitation

Browsers cannot place content on the OS home screen. `features/widget`
provides the closest practical equivalents: a live-data preview card
(`WidgetPreview`, same countdown/streak visuals as the native widget) reachable
from Settings and from the `/widget` manifest shortcut, so it can be pinned to
a phone's home screen as its own launch icon.

## Browser support

Targets evergreen Chrome, Edge, Safari and Firefox (last 2 versions). The
Badging API and notification action buttons are Chromium-only — both degrade
gracefully (feature-detected, no-ops elsewhere) on Safari/Firefox.

## Tech stack

React 19 · TypeScript 6 · Vite 8 · React Router 7 · vite-plugin-pwa 1.3 +
Workbox 7 · lucide-react (icons) · CSS Modules + CSS custom properties
(no UI framework, no global state library).
