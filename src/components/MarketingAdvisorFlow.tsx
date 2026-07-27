'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import CategorySelect, { type MarketingCategory } from './CategorySelect'
import AdvisorQuestions, { type AdvisorAnswers } from './AdvisorQuestions'
import AdvisorResults, { type MarketingAdvisorResult } from './AdvisorResults'
import AdvisorSamplePreview from './AdvisorSamplePreview'
import ReviewDisplay from './ReviewDisplay'
import ReviewSubmissionForm from './ReviewSubmissionForm'
import Button from './ui/Button'

type Step = 'landing' | 'questions' | 'processing' | 'results' | 'error'

export default function MarketingAdvisorFlow() {
  const [step, setStep] = useState<Step>('landing')
  const [category, setCategory] = useState<MarketingCategory | null>(null)
  const [result, setResult] = useState<MarketingAdvisorResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const reviewFormRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchParams.get('review') === 'true') setShowReviewForm(true)
  }, [searchParams])

  useEffect(() => {
    if (showReviewForm) reviewFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [showReviewForm])

  function handleCategorySelect(selected: MarketingCategory) {
    setCategory(selected)
    setStep('questions')
  }

  async function handleQuestionsSubmit(answers: AdvisorAnswers) {
    if (!category) return
    setStep('processing')
    setErrorMessage(null)

    try {
      const res = await fetch('/api/marketing-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          userRole: answers.userRole,
          businessStage: answers.businessStage,
          primaryChallenge: answers.primaryChallenge,
          secondaryAnswer: answers.secondaryAnswer,
          description: answers.description,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || 'Advisory generation failed')
      }

      const data: MarketingAdvisorResult = await res.json()
      setResult(data)
      setStep('results')
    } catch (err) {
      console.error('[MarketingAdvisorFlow] advisory error:', err)
      setErrorMessage(
        err instanceof Error ? err.message : 'Something went wrong while building your advisory report.'
      )
      setStep('error')
    }
  }

  if (step === 'landing') {
    return (
      <div>
        <h1 className="text-[32px] font-light tracking-[-0.64px] leading-[1.1] text-ink-900 text-center mb-4">
          What marketing problem are you facing?
        </h1>
        <p className="text-center text-ink-700 leading-[1.4] mb-10 max-w-xl mx-auto">
          Pick the challenge closest to yours, answer a few questions about your situation, and get
          a tailored advisory report grounded in 213 operator-level lessons. Free.
        </p>

        <div className="mb-10">
          <AdvisorSamplePreview />
        </div>

        <ReviewDisplay productSlug="marketing-advisor" />

        <CategorySelect onSelect={handleCategorySelect} />

        {showReviewForm ? (
          <div
            ref={reviewFormRef}
            id="review-form"
            className="review-pulse mt-12 pt-8 border-t border-hairline"
          >
            <ReviewSubmissionForm
              productSlug="marketing-advisor"
              productName="Marketing Decision Advisor"
            />
          </div>
        ) : (
          <p className="text-center text-sm text-ink-500 mt-10">
            Already used this tool?{' '}
            <a
              href="?review=true"
              onClick={(e) => {
                e.preventDefault()
                setShowReviewForm(true)
                window.history.replaceState(null, '', '?review=true')
              }}
              className="text-primary hover:text-primary-hover transition-colors"
            >
              Rate your experience
            </a>
          </p>
        )}
      </div>
    )
  }

  if (step === 'questions' && category) {
    return (
      <div>
        <h2 className="text-[26px] font-light tracking-[-0.26px] leading-[1.12] text-ink-900 text-center mb-8">
          A few quick questions.
        </h2>
        <AdvisorQuestions category={category} onSubmit={handleQuestionsSubmit} />
      </div>
    )
  }

  if (step === 'processing') {
    return (
      <div className="text-center py-20">
        <p className="text-ink-900 text-lg">Building your advisory report...</p>
        <p className="text-sm text-ink-500 mt-2">This usually takes about 20 to 30 seconds.</p>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="text-center py-20">
        <p className="text-accent-rose text-base font-normal mb-2">Something went wrong.</p>
        <p className="text-sm text-ink-500 mb-6">{errorMessage}</p>
        <Button onClick={() => setStep('questions')}>Try again</Button>
      </div>
    )
  }

  if (step === 'results' && result) {
    return <AdvisorResults result={result} />
  }

  return null
}
