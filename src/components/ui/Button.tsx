import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'on-dark'
type Size = 'md' | 'sm'

const base =
  'inline-flex items-center justify-center gap-2 rounded-pill font-sans font-normal text-center whitespace-nowrap transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/28 disabled:opacity-60 disabled:pointer-events-none'

const sizes: Record<Size, string> = {
  md: 'h-10 px-4 text-[16px]',
  sm: 'h-[34px] px-3.5 text-sm',
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-press',
  secondary:
    'bg-white text-primary border border-primary hover:bg-primary-subtle/40 active:bg-primary-subtle/60',
  'on-dark': 'bg-surface-dark text-white hover:bg-[#243050] active:bg-[#0f1526]',
}

type CommonProps = {
  variant?: Variant
  size?: Size
  children: ReactNode
  className?: string
}

type ButtonAsLink = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
  }

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined
  }

type ButtonProps = ButtonAsLink | ButtonAsButton

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const classes = `${base} ${sizes[size]} ${variants[variant]} ${className}`

  if ('href' in props && props.href) {
    const { href, ...rest } = props as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  )
}
