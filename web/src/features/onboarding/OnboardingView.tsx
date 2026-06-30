import { useEffect, useRef, useState } from 'react'
import { useSettings } from '../../store/useSettings'
import { PrimaryButton } from '../../components/buttons/PrimaryButton'
import { PageIndicator } from './components/PageIndicator'
import { WelcomePage } from './pages/WelcomePage'
import { SleepTimePage } from './pages/SleepTimePage'
import { WakeTimePage } from './pages/WakeTimePage'
import { AnnoyancePage } from './pages/AnnoyancePage'
import { FactModePage } from './pages/FactModePage'
import { NotificationPage } from './pages/NotificationPage'
import styles from './OnboardingView.module.css'

const PAGES = [WelcomePage, SleepTimePage, WakeTimePage, AnnoyancePage, FactModePage, NotificationPage]

export function OnboardingView() {
  const settings = useSettings()
  const [page, setPage] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const settleTimeout = useRef<number | undefined>(undefined)

  const snapTo = (index: number, smooth = true) => {
    const el = containerRef.current
    if (!el) return
    el.scrollTo({ left: index * el.clientWidth, behavior: smooth ? 'smooth' : 'auto' })
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const target = page * el.clientWidth
    if (Math.abs(el.scrollLeft - target) > 4) snapTo(page)
  }, [page])

  useEffect(() => {
    const handleResize = () => snapTo(page, false)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [page])

  useEffect(() => () => window.clearTimeout(settleTimeout.current), [])

  const handleScroll = () => {
    window.clearTimeout(settleTimeout.current)
    settleTimeout.current = window.setTimeout(() => {
      const el = containerRef.current
      if (!el || el.clientWidth === 0) return
      const index = Math.round(el.scrollLeft / el.clientWidth)
      setPage(Math.min(PAGES.length - 1, Math.max(0, index)))
    }, 100)
  }

  const isLast = page === PAGES.length - 1
  const handleNext = () => {
    if (isLast) settings.completeOnboarding()
    else setPage((p) => Math.min(PAGES.length - 1, p + 1))
  }

  return (
    <div className={styles.root}>
      <PageIndicator count={PAGES.length} current={page} onSelect={setPage} />
      <div ref={containerRef} className={`${styles.pager} no-scrollbar`} onScroll={handleScroll}>
        {PAGES.map((Page, i) => (
          <Page key={i} />
        ))}
      </div>
      <div className={styles.footer}>
        <PrimaryButton onClick={handleNext}>{isLast ? "Los geht's 🌙" : 'Weiter'}</PrimaryButton>
      </div>
    </div>
  )
}
