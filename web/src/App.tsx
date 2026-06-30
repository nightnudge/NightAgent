import { BrowserRouter } from 'react-router-dom'
import { SettingsProvider } from './store/SettingsContext'
import { AppShell } from './AppShell'

export default function App() {
  return (
    <SettingsProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AppShell />
      </BrowserRouter>
    </SettingsProvider>
  )
}
