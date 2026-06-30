import { useEffect, useRef, useState } from 'react'
import { CircleCheckBig, MoonStar } from 'lucide-react'
import { useSettings } from '../../store/useSettings'
import styles from './ConfirmButton.module.css'

interface ConfirmButtonProps {
  isConfirmed: boolean
}

/** "Ich gehe jetzt schlafen" - ported incl. the press/spring/glow sequence from ContentView.swift. */
export function ConfirmButton({ isConfirmed }: ConfirmButtonProps) {
  const { confirmToday } = useSettings()
  const [scale, setScale] = useState(1)
  const [glow, setGlow] = useState(false)
  const timeouts = useRef<number[]>([])

  useEffect(() => {
    const ids = timeouts.current
    return () => ids.forEach((id) => window.clearTimeout(id))
  }, [])

  const handleClick = () => {
    if (isConfirmed) return
    setScale(0.93)
    timeouts.current.push(
      window.setTimeout(() => {
        setScale(1)
        setGlow(true)
        confirmToday()
        timeouts.current.push(window.setTimeout(() => setGlow(false), 800))
      }, 150),
    )
  }

  return (
    <button
      type="button"
      className={isConfirmed ? styles.buttonConfirmed : styles.button}
      style={{ transform: `scale(${scale})` }}
      data-glow={glow || undefined}
      onClick={handleClick}
      disabled={isConfirmed}
    >
      {isConfirmed ? <CircleCheckBig size={19} /> : <MoonStar size={19} />}
      <span>{isConfirmed ? 'Gute Nacht ✓' : 'Ich gehe jetzt schlafen'}</span>
    </button>
  )
}
