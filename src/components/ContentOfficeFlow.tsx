'use client'

import { useState } from 'react'
import ContentOfficeForm from './ContentOfficeForm'
import ContentOfficeResults from './ContentOfficeResults'
import ContentOfficeEmailGate from './ContentOfficeEmailGate'
import ContentOfficeFullResults from './ContentOfficeFullResults'
import ContentOfficeSamplePreview from './ContentOfficeSamplePreview'
import type { ContentOfficeInputs, ContentOfficeResult } from '@/lib/contentOfficeData'

type Step = 'landing' | 'form' | 'processing' | 'results' | 'error'

export default function ContentOfficeFlow() {
  const [step, setStep] = useState<Step>('landing')
  const [result, setResult] = useState<ContentOfficeResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [emailCaptured, setEmailCaptured] = useState(false)
  const [submissionId, setSubmissionId] = useState<string | null>(null)

  async function handleFormSubmit(inputs: ContentOfficeInputs) {
    setStep('processing')
    setErrorMessage(null)

    try {
      const res = await fetch('/api/content-office', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || 'Matrix generation failed')
      }
      const data: ContentOfficeResult = await res.json()
      setResult(data)
      setStep('results')

      try {
        const submitRes = await fetch('/api/content-office-submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ inputs, result: data }),
        })
        if (submitRes.ok) {
          const submitData = await submitRes.json()
          setSubmissionId(submitData.id)
        }
      } catch (err) {
        console.error('[ContentOfficeFlow] submit failed:', err)
      }
    } catch (err) {
      console.error('[ContentOfficeFlow] generation error:', err)
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong while building your matrix.')
      setStep('error')
    }
  }

  async function handleEmailSubmit(email: string): Promise<{ ok: boolean; url?: string }> {
    if (!result || !submissionId) return { ok: false }
    try {
      const res = await fetch('/api/content-office-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, email, result }),
      })
      if (!res.ok) return { ok: false }
      const data = await res.json()
      setEmailCaptured(true)
      return { ok: true, url: data.url }
    } catch (err) {
      console.error('[ContentOfficeFlow] report request failed:', err)
      return { ok: false }
    }
  }

  if (step === 'landing') {
    return (
      <div>
        <p className="text-[10px] font-normal uppercase tracking-[0.1px] font-sans text-[color:var(--color-primary)] mb-4 text-center">
          Content strategy
        </p>
        <h1 className="text-[32px] font-light font-sans tracking-[-0.64px] leading-[1.1] text-[color:var(--text-body)] text-center mb-4">
          Your content system, built from five questions
        </h1>
        <p className="text-[16px] font-light font-sans leading-[1.4] text-[color:var(--text-secondary)] text-center mb-10 max-w-lg mx-auto">
          Stop guessing what to post. Get a personalized content matrix: topics mapped to themes, structures, and channels.
        </p>

        <div className="mb-10">
          <ContentOfficeSamplePreview />
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setStep('form')}
            className="px-4 py-2 rounded-[var(--radius-pill)] bg-[color:var(--color-primary)] text-white text-[16px] font-normal font-sans hover:bg-[color:var(--color-primary-hover)] transition-colors"
          >
            Get started
          </button>
        </div>
      </div>
    )
  }

  if (step === 'form') {
    return (
      <div>
        <h2 className="text-[26px] font-light font-sans tracking-[-0.26px] leading-[1.12] text-[color:var(--text-body)] text-center mb-8">
          Five questions, then your matrix
        </h2>
        <ContentOfficeForm onSubmit={handleFormSubmit} />
      </div>
    )
  }

  if (step === 'processing') {
    return (
      <div className="text-center py-20">
        <p className="text-[16px] font-light font-sans text-[color:var(--text-body)]">Building your content matrix...</p>
        <p className="text-[13px] font-light font-sans text-[color:var(--text-muted)] mt-2">This usually takes about 15 to 25 seconds.</p>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="text-center py-20">
        <p className="text-[15px] font-normal font-sans text-[color:var(--accent-rose)] mb-2">Something went wrong.</p>
        <p className="text-[13px] font-light font-sans text-[color:var(--text-muted)] mb-6">{errorMessage}</p>
        <button
          type="button"
          onClick={() => setStep('form')}
          className="px-4 py-2 rounded-[var(--radius-pill)] bg-[color:var(--color-primary)] text-white text-[16px] font-normal font-sans hover:bg-[color:var(--color-primary-hover)] transition-colors"
        >
          Try again
        </button>
      </div>
    )
  }

  if (step === 'results' && result) {
    return (
      <div>
        <ContentOfficeResults result={result} />

        <div className="mt-10">
          <ContentOfficeEmailGate onSubmit={handleEmailSubmit} totalIdeas={result.pillars.length * 10} />
        </div>

        {emailCaptured && (
          <div className="mt-14 pt-14 border-t border-[color:var(--border-hairline)]">
            <ContentOfficeFullResults result={result} />
          </div>
        )}
      </div>
    )
  }

  return null
}
