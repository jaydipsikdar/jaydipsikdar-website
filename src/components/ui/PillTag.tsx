import type { HTMLAttributes, ReactNode } from 'react'

export default function PillTag({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-pill bg-primary-subtle px-3 py-1 text-xs font-normal text-primary-press ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
