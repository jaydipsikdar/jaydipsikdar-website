'use client'

// Small hand-authored icon set (stroke-based, currentColor) so the Marketing
// Decision Advisor doesn't need an external icon library dependency. Shared
// between AdvisorResults, AdvisorSamplePreview, and CategorySelect.

type IconProps = { className?: string }

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function IconSearch({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  )
}

export function IconTarget({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconChecklist({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9 6h11" />
      <path d="M9 12h11" />
      <path d="M9 18h11" />
      <path d="M4 6l1.2 1.2L7.5 5" />
      <path d="M4 12l1.2 1.2L7.5 11" />
      <path d="M4 18l1.2 1.2L7.5 17" />
    </svg>
  )
}

export function IconAlertTriangle({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3.5l9.5 16.5H2.5L12 3.5z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17.2" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconQuestion({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.4 9.3a2.6 2.6 0 0 1 5 1c0 1.7-2.4 1.9-2.4 3.6" />
      <circle cx="12" cy="16.7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconCompass({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 5-5 2 2-5z" />
    </svg>
  )
}

export function IconMegaphone({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 11v2a2 2 0 0 0 2 2h1l3 4V7l-3 4H5a2 2 0 0 0-2 2z" />
      <path d="M9 7l10-3.5v17L9 17" />
      <path d="M19 10.5a2.5 2.5 0 0 1 0 3" />
    </svg>
  )
}

export function IconTrendingUp({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </svg>
  )
}

export function IconSparkles({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z" />
      <path d="M19 15l0.8 2.2L22 18l-2.2 0.8L19 21l-0.8-2.2L16 18l2.2-0.8z" />
    </svg>
  )
}

export function IconRocket({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 2.5c3 1.5 5 5 5 9 0 2-1 4-2 5l-1 2h-4l-1-2c-1-1-2-3-2-5 0-4 2-7.5 5-9z" />
      <circle cx="12" cy="10" r="1.6" />
      <path d="M9 16.5L6.5 19M15 16.5L17.5 19" />
    </svg>
  )
}
