export const PRODUCT_SLUGS = ['marketing-advisor', 'vendor-check', 'cmo-boardroom-kit'] as const

export type ProductSlug = (typeof PRODUCT_SLUGS)[number]

export function isProductSlug(value: unknown): value is ProductSlug {
  return typeof value === 'string' && (PRODUCT_SLUGS as readonly string[]).includes(value)
}

export interface ApprovedReview {
  id: string
  rating: number
  review_text: string | null
  reviewer_name: string
  reviewer_title: string | null
  reviewer_company: string | null
  created_at: string
}

export function relativeTime(dateString: string): string {
  const then = new Date(dateString).getTime()
  const diffSeconds = Math.max(0, Math.floor((Date.now() - then) / 1000))

  const units: [string, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]

  for (const [label, seconds] of units) {
    const value = Math.floor(diffSeconds / seconds)
    if (value >= 1) return `${value} ${label}${value === 1 ? '' : 's'} ago`
  }
  return 'just now'
}
