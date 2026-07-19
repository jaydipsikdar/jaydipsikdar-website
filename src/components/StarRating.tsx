'use client'

import { useState } from 'react'

function StarIcon({ filled, size, className }: { filled: boolean; size: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      style={{ width: size, height: size }}
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
    >
      <path d="M10 1.5l2.6 5.53 6.02.62-4.5 4.13 1.24 5.97L10 14.9l-5.36 2.85 1.24-5.97-4.5-4.13 6.02-.62L10 1.5z" />
    </svg>
  )
}

// Display-only star row, e.g. for showing an existing rating.
export function StarRatingDisplay({ rating, size = 18 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon
          key={n}
          filled={n <= Math.round(rating)}
          size={size}
          className={n <= Math.round(rating) ? 'text-brand-accent' : 'text-gray-300'}
        />
      ))}
    </div>
  )
}

// Interactive star picker for the submission form.
export function StarRatingInput({
  value,
  onChange,
  size = 28,
}: {
  value: number
  onChange: (rating: number) => void
  size?: number
}) {
  const [hover, setHover] = useState(0)
  const active = hover || value

  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5"
        >
          <StarIcon
            filled={n <= active}
            size={size}
            className={n <= active ? 'text-brand-accent' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  )
}
