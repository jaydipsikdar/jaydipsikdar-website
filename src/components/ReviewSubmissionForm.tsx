'use client'

import { useState } from 'react'
import { StarRatingInput } from './StarRating'
import type { ProductSlug } from '@/lib/reviews'

const REVIEW_TEXT_MAX = 500

function LinkedInShareButton({ productName }: { productName: string }) {
  function handleShare() {
    const toolURL = window.location.href
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(toolURL)}`
    window.open(shareUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={`Share that you used the ${productName} on LinkedIn`}
      className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-brand-text text-sm font-medium rounded hover:border-brand-accent transition-colors"
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
        <p className="text-brand-text font-medium mb-4">
          Thank you! Your review will appear shortly.
        </p>
        <LinkedInShareButton productName={productName} />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <h3 className="text-lg font-semibold text-center mb-6">Was this helpful?</h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col items-center gap-2">
          <StarRatingInput value={rating} onChange={setRating} />
        </div>

        <div>
          <label htmlFor="review-text" className="block text-sm font-medium text-brand-text mb-1.5">
            Tell us more (optional)
          </label>
          <textarea
            id="review-text"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value.slice(0, REVIEW_TEXT_MAX))}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 rounded text-sm text-brand-text bg-white placeholder-gray-400 focus:outline-none focus:border-brand-accent transition-colors resize-none"
            placeholder="What did you find useful?"
          />
          <p className="text-xs text-gray-400 text-right mt-1">
            {reviewText.length}/{REVIEW_TEXT_MAX}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label htmlFor="reviewer-name" className="block text-sm font-medium text-brand-text mb-1.5">
              Your name
            </label>
            <input
              id="reviewer-name"
              type="text"
              required
              maxLength={100}
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded text-sm text-brand-text bg-white placeholder-gray-400 focus:outline-none focus:border-brand-accent transition-colors"
              placeholder="Priya Sharma"
            />
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="reviewer-title" className="block text-sm font-medium text-brand-text mb-1.5">
              Your role (optional)
            </label>
            <input
              id="reviewer-title"
              type="text"
              maxLength={100}
              value={reviewerTitle}
              onChange={(e) => setReviewerTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded text-sm text-brand-text bg-white placeholder-gray-400 focus:outline-none focus:border-brand-accent transition-colors"
              placeholder="Head of Marketing"
            />
          </div>
          <div className="sm:col-span-1">
            <label htmlFor="reviewer-company" className="block text-sm font-medium text-brand-text mb-1.5">
              Company (optional)
            </label>
            <input
              id="reviewer-company"
              type="text"
              maxLength={100}
              value={reviewerCompany}
              onChange={(e) => setReviewerCompany(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded text-sm text-brand-text bg-white placeholder-gray-400 focus:outline-none focus:border-brand-accent transition-colors"
              placeholder="Acme AI"
            />
          </div>
        </div>

        {status === 'error' && (
          <p className="text-red-600 text-xs text-center">{errorMessage}</p>
        )}

        <div className="text-center">
          <button
            type="submit"
            disabled={!canSubmit || status === 'submitting'}
            className="px-6 py-3 bg-brand-accent text-white rounded hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? 'Submitting…' : 'Submit review'}
          </button>
        </div>
      </form>
    </div>
  )
}
