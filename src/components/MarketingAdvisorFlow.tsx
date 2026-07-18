'use client'

import { useState } from 'react'
import CategorySelect, { type MarketingCategory } from './CategorySelect'
import AdvisorQuestions, { type AdvisorAnswers } from './AdvisorQuestions'
import AdvisorResults, { type MarketingAdvisorResult } from './AdvisorResults'
import AdvisorSamplePreview from './AdvisorSamplePreview'

type Step = 'landing' | 'questions' | 'processing' | 'results' | 'error'

export default function MarketingAdvisorFlow() {
  const [step, setStep] = useState<Step>('landing')
  const [category, setCategory] = useState<MarketingCategory | null>(null)
  const [result, setResult] = useState<MarketingAdvisorResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
        <h1 className="text-3xl font-bold text-center mb-4">
          What marketing problem are you facing?
        </h1>
        <p className="text-center text-brand-text mb-10 max-w-xl mx-auto">
          Pick the challenge closest to yours, answer a few questions about your situation, and get
          a tailored advisory report grounded in 213 operator-level lessons — free.
        </p>

        <div className="mb-10">
          <AdvisorSamplePreview />
        </div>

        <CategorySelect onSelect={handleCategorySelect} />
      </div>
    )
  }

  if (step === 'questions' && category) {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-center mb-8">A few quick questions.</h2>
        <AdvisorQuestions category={category} onSubmit={handleQuestionsSubmit} />
      </div>
    )
  }

  if (step === 'processing') {
    return (
      <div className="text-center py-20">
        <p className="text-brand-text text-lg">Building your advisory report…</p>
        <p className="text-sm text-gray-500 mt-2">This usually takes about 20-30 seconds.</p>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 text-base font-medium mb-2">Something went wrong.</p>
        <p className="text-sm text-gray-500 mb-6">{errorMessage}</p>
        <button
          type="button"
          onClick={() => setStep('questions')}
          className="px-6 py-3 bg-brand-accent text-white rounded hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    )
  }

  if (step === 'results' && result) {
    return <AdvisorResults result={result} />
  }

  return null
}
