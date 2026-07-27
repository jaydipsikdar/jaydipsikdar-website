import type { InputHTMLAttributes } from 'react'

export default function TextInput({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-sm border border-hairline-input bg-white px-4 py-2.5 text-sm text-ink-900 placeholder-ink-500 transition-colors focus:border-primary focus:outline-none ${className}`}
      {...props}
    />
  )
}
