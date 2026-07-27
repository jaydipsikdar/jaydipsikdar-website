import type { HTMLAttributes, ReactNode } from 'react'

export default function Eyebrow({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { children: ReactNode }) {
  return (
    <p
      className={`text-[10px] font-normal uppercase tracking-[0.1px] text-primary ${className}`}
      {...props}
    >
      {children}
    </p>
  )
}
