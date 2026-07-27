'use client'

import { useState } from 'react'
import { StarRatingInput } from './StarRating'
import type { ProductSlug } from '@/lib/reviews'
import Button from './ui/Button'
import TextInput from './ui/TextInput'

const REVIEW_TEXT_MAX = 500

// Canonical page for each product — used for the LinkedIn share link so it
// always points at the tool's own page, not whatever URL the form happens
// to be rendered on (e.g. with a stray ?review=true left in it).
const TOOL_PATHS: Record<ProductSlug, string> = {
  'marketing-advisor': '/resources/marketing-advisor',
  'vendor-check': '/resources/vendor-check',
  'cmo-boardroom-kit': '/resources',
  'marketing-maturity-score': '/resources/marketing-maturity-score',
}

function LinkedInShareButton({
  productSlug,
  productName,
}: {
  productSlug: ProductSlug
  productName: string
}) {
  function handleShare() {
    const toolUrl = `https://jaydipsikdar.com${TOOL_PATHS[productSlug]}`
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(toolUrl)}`
    window.open(shareUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={`Share that you used the ${productName} on LinkedIn`}
      className="inline-flex items-center gap-2 rounded-pill border border-hairline-input px-5 py-2.5 text-sm font-normal text-ink-700 transition-colors hover:border-primary hover:text-primary"
    >
      Share on LinkedIn
    </button>
  )
}

export default function ReviewSubmissionForm({
  productSlug,
  productName,
}: {
  productSlug: ProductSlug
  productName: string
}) {
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewerName, setReviewerName] = useState('')
  const [reviewerTitle, setReviewerTitle] = useState('')
  const [reviewerCompany, setReviewerCompany] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const canSubmit = rating > 0 && reviewerName.trim().length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setStatus('submitting')
    setErrorMessage('')

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_slug: productSlug,
          rating,
          review_text: reviewText.trim() || undefined,
          reviewer_name: reviewerName.trim(),
          reviewer_title: reviewerTitle.trim() || undefined,
          reviewer_company: reviewerCompany.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Something went wrong. Please try again.')
      }

      setStatus('success')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-4">
        <p className="text-ink-900 font-normal mb-4">
          Thank you! Your review will appear shortly.
        </p>
        <LinkedInShareButton productSlug={productSlug} productName={productName} />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <h3 className="text-lg font-light text-ink-900 text-center mb-6">Was this helpful?</h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-2">
          <StarRatingInput value={rating} onChange={setRating} />
        </div>

        <div>
          <label htmlFor="review-text" className="block text-sm font-normal text-ink-900 mb-1.5">
            Tell us more (optional)
          </label>
          <textarea
            id="review-text"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value.slice(0, REVIEW_TEXT_MAX))}
            rows={3}
            className="w-full rounded-sm border border-hairline-input bg-white px-4 py-2.5 text-sm text-ink-900 placeholder-ink-500 transition-colors focus:border-primary focus:outline-none resize-none"
            placeholder="What did you find useful?"
          />
          <p className="text-xs text-ink-500 text-right mt-1 tabular-nums">
            {reviewText.length}/{REVIEW_TEXT_MAX}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label htmlFor="reviewer-name" className="block text-sm font-normal text-ink-900 mb-1.5">
              Your name
            </label>
            <TextInput
              id="reviewer-name"
              type="text"
              required
              maxLength={100}
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="Priya Sharma"
            />
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="reviewer-title" className="block text-sm font-normal text-ink-900 mb-1.5">
              Your role (optional)
            </label>
            <TextInput
              id="reviewer-title"
              type="text"
              maxLength={100}
              value={reviewerTitle}
              onChange={(e) => setReviewerTitle(e.target.value)}
              placeholder="Head of marketing"
            />
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="reviewer-company" className="block text-sm font-normal text-ink-900 mb-1.5">
              Company (optional)
            </label>
            <TextInput
              id="reviewer-company"
              type="text"
              maxLength={100}
              value={reviewerCompany}
              onChange={(e) => setReviewerCompany(e.target.value)}
              placeholder="Acme AI"
            />
          </div>
        </div>

        {status === 'error' && (
          <p className="text-accent-rose text-xs text-center">{errorMessage}</p>
        )}

        <div className="text-center">
          <Button type="submit" disabled={!canSubmit || status === 'submitting'}>
            {status === 'submitting' ? 'Submitting...' : 'Submit review'}
          </Button>
        </div>
      </form>
    </div>
  )
}
