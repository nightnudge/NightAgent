import type { ButtonHTMLAttributes } from 'react'
import styles from './Buttons.module.css'

type TextButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

/** Plain secondary-colored text button (no background), e.g. "Jetzt nicht". */
export function TextButton({ className, ...props }: TextButtonProps) {
  return <button type="button" className={`${styles.text} ${className ?? ''}`} {...props} />
}
