'use client'

import { useEffect, useState } from 'react'
import { StarRatingDisplay } from './StarRating'
import { relativeTime, type ApprovedReview, type ProductSlug } from '@/lib/reviews'

function ReviewCard({ review }: { review: ApprovedReview }) {
  return (
    <div className="border border-gray-200 rounded-lg bg-white p-5 flex flex-col">
      <StarRatingDisplay rating={review.rating} size={16} />
      {review.review_text && (
        <p className="text-sm text-brand-text leading-relaxed mt-3 flex-1">
          &ldquo;{review.review_text}&rdquo;
        </p>
      )}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-sm font-medium text-brand-text">{review.reviewer_name}</p>
        {(review.reviewer_title || review.reviewer_company) && (
          <p className="text-xs text-gray-500">
            {[review.reviewer_title, review.reviewer_company].filter(Boolean).join(', ')}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1">{relativeTime(review.created_at)}</p>
      </div>
    </div>
  )
}

export default function ReviewDisplay({ productSlug }: { productSlug: ProductSlug }) {
  const [reviews, setReviews] = useState<ApprovedReview[] | null>(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    let cancelled = false

    fetch(`/api/reviews?product=${encodeURIComponent(productSlug)}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: ApprovedReview[]) => {
        if (!cancelled) setReviews(Array.isArray(data) ? data : [])
      })
      .catch(() => {
        if (!cancelled) setReviews([])
      })

    return () => {
      cancelled = true
    }
  }, [productSlug])

  if (!reviews || reviews.length === 0) return null

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  const visibleReviews = showAll ? reviews : reviews.slice(0, 3)

  return (
    <div className="mb-10">
      <h2 className="text-2xl font-semibold text-center mb-2">What others are saying</h2>
      <p className="text-center text-sm text-gray-500 mb-8">
        ★ {average.toFixed(1)} from {reviews.length} review{reviews.length === 1 ? '' : 's'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {visibleReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {reviews.length > 3 && (
        <div className="text-center mt-8">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="text-sm text-brand-accent underline hover:opacity-80 transition-opacity"
          >
            {showAll ? 'Show fewer reviews' : 'See all reviews →'}
          </button>
        </div>
      )}
    </div>
  )
}
