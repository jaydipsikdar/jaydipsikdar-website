import type { HTMLAttributes, ReactNode } from 'react'

type Tone = 'light' | 'cream' | 'dark'
type Elevation = 0 | 1 | 2

const tones: Record<Tone, string> = {
  light: 'bg-white border border-hairline text-ink-900',
  cream: 'bg-surface-cream border border-hairline text-ink-900',
  dark: 'bg-surface-dark border border-surface-dark text-white',
}

const elevations: Record<Elevation, string> = {
  0: '',
  1: 'shadow-1',
  2: 'shadow-2',
}

type CardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: Tone
  elevation?: Elevation
  interactive?: boolean
  children: ReactNode
}

export default function Card({
  tone = 'light',
  elevation = 0,
  interactive = false,
  className = '',
  children,
  ...props
}: CardProps) {
  const interactiveClasses = interactive
    ? 'transition-shadow duration-150 ease-out hover:shadow-2'
    : ''

  return (
    <div
      className={`rounded-lg p-8 ${tones[tone]} ${elevations[elevation]} ${interactiveClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
