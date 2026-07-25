'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import MaturityScoreQuestions from './MaturityScoreQuestions'
import MaturityScoreResults from './MaturityScoreResults'
import MaturityScoreEmailGate from './MaturityScoreEmailGate'
import MaturityScoreSamplePreview from './MaturityScoreSamplePreview'
import ReviewDisplay from './ReviewDisplay'
import ReviewSubmissionForm from './ReviewSubmissionForm'
import type { Qualifiers } from '@/lib/maturityScoreData'
import { computeResult, type Answers, type MaturityResult } from '@/lib/maturityScoring'

type Step = 'landing' | 'questions' | 'results'

export default function MaturityScoreFlow() {
  const [step, setStep] = useState<Step>('landing')
  const [qualifiers, setQualifiers] = useState<Qualifiers | null>(null)
  const [result, setResult] = useState<MaturityResult | null>(null)
  const [submissionId, setSubmissionId] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const reviewFormRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchParams.get('review') === 'true') setShowReviewForm(true)
  }, [searchParams])

  useEffect(() => {
    if (showReviewForm) reviewFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [showReviewForm])

  async function handleQuestionsComplete(finalQualifiers: Qualifiers, answers: Answers) {
    const computed = computeResult(answers)
    setQualifiers(finalQualifiers)
    setResult(computed)
    setStep('results')

    try {
      const res = await fetch('/api/maturity-score-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qualifiers: finalQualifiers, answers, result: computed }),
      })
      if (res.ok) {
        const data = await res.json()
        setSubmissionId(data.id)
      }
    } catch (err) {
      console.error('[MaturityScoreFlow] submit failed:', err)
    }
  }

  async function handleEmailSubmit(email: string): Promise<{ ok: boolean; url?: string }> {
    if (!submissionId || !qualifiers || !result) return { ok: false }
    try {
      const res = await fetch('/api/maturity-score-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, email, qualifiers, result }),
      })
      if (!res.ok) return { ok: false }
      const data = await res.json()
      return { ok: true, url: data.url }
    } catch (err) {
      console.error('[MaturityScoreFlow] report request failed:', err)
      return { ok: false }
    }
  }

  if (step === 'landing') {
    return (
      <div>
        <p className="text-[10px] font-normal uppercase tracking-[0.1px] font-sans text-[color:var(--color-primary)] mb-4 text-center">
          Marketing maturity diagnostic
        </p>
        <h1 className="text-[32px] font-light font-sans tracking-[-0.64px] leading-[1.1] text-[color:var(--text-body)] text-center mb-4">
          Your marketing might be running on instinct instead of a system.
        </h1>
        <p className="text-[16px] font-light font-sans leading-[1.4] text-[color:var(--text-secondary)] text-center mb-10 max-w-lg mx-auto">
          Answer 25 questions across 6 dimensions, positioning, demand generation, content, ops,
          measurement, and team, and see exactly where the gaps are. Takes about 8 minutes, and the
          preview is free.
        </p>

        <div className="mb-10">
          <MaturityScoreSamplePreview />
        </div>

        <ReviewDisplay productSlug="marketing-maturity-score" />

        <div className="text-center mt-10 mb-10">
          <button
            type="button"
            onClick={() => setStep('questions')}
            className="px-4 py-2 rounded-[var(--radius-pill)] bg-[color:var(--color-primary)] text-white text-[16px] font-normal font-sans hover:bg-[color:var(--color-primary-hover)] transition-colors"
          >
            Start the assessment
          </button>
        </div>

        {showReviewForm ? (
          <div ref={reviewFormRef} id="review-form" className="review-pulse mt-12 pt-8 border-t border-[color:var(--border-hairline)]">
            <ReviewSubmissionForm productSlug="marketing-maturity-score" productName="Marketing Maturity Score" />
          </div>
        ) : (
          <p className="text-center text-[13px] font-normal font-sans text-[color:var(--text-muted)] mt-10">
            Already used this tool?{' '}
            <a
              href="?review=true"
              onClick={(e) => {
                e.preventDefault()
                setShowReviewForm(true)
                window.history.replaceState(null, '', '?review=true')
              }}
              className="text-[color:var(--color-primary)] hover:text-[color:var(--color-primary-hover)] transition-colors"
            >
              Rate your experience
            </a>
          </p>
        )}
      </div>
    )
  }

  if (step === 'questions') {
    return <MaturityScoreQuestions onComplete={handleQuestionsComplete} />
  }

  if (step === 'results' && result) {
    return (
      <div>
        <MaturityScoreResults result={result} />

        <div className="mt-10">
          <MaturityScoreEmailGate onSubmit={handleEmailSubmit} />
        </div>

        <div className="mt-12 pt-8 border-t border-[color:var(--border-hairline)]">
          <ReviewSubmissionForm productSlug="marketing-maturity-score" productName="Marketing Maturity Score" />
        </div>
      </div>
    )
  }

  return null
}
