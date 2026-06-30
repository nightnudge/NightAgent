import type { ButtonHTMLAttributes } from 'react'
import styles from './Buttons.module.css'

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

/** Filled accent-glow CTA button used throughout onboarding and confirmation screens. */
export function PrimaryButton({ className, ...props }: PrimaryButtonProps) {
  return (
    <button type="button" className={`${styles.primary} ${className ?? ''}`} {...props} />
  )
}
