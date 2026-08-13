'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ContractIntake from './ContractIntake'
import ContextQuestions, { ContextAnswers } from './ContextQuestions'
import ResultsReport, { VendorCheckResult } from './ResultsReport'
import SampleReportPreview from './SampleReportPreview'
import ReviewDisplay from './ReviewDisplay'
import ReviewSubmissionForm from './ReviewSubmissionForm'
import Button from './ui/Button'

type Step = 'landing' | 'context' | 'processing' | 'results' | 'error'

export default function VendorCheckFlow() {
  const [step, setStep] = useState<Step>('landing')
  const [contractText, setContractText] = useState('')
  const [result, setResult] = useState<VendorCheckResult | null>(null)
  const [processStage, setProcessStage] = useState<string | undefined>(undefined)
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

  function handleIntakeContinue(text: string) {
    setContractText(text)
    setStep('context')
  }

  async function handleContextSubmit(answers: ContextAnswers) {
    setStep('processing')
    setErrorMessage(null)
    setProcessStage(answers.processStage)

    try {
      const res = await fetch('/api/vendor-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractText,
          vendorType: answers.vendorType,
          whatsAtStake: answers.whatsAtStake,
          processStage: answers.processStage,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || 'Evaluation failed')
      }

      const data: VendorCheckResult = await res.json()
      setResult(data)
      setStep('results')
    } catch (err) {
      console.error('[VendorCheckFlow] evaluation error:', err)
      setErrorMessage(
        err instanceof Error ? err.message : 'Something went wrong while scoring your contract.'
      )
      setStep('error')
    }
  }

  if (step === 'landing') {
    return (
      <div>
        <h1 className="text-[32px] font-light tracking-[-0.64px] leading-[1.1] text-ink-900 text-center mb-4">
          Is your vendor contract protecting you?
        </h1>
        <p className="text-center text-ink-700 leading-[1.4] mb-10 max-w-xl mx-auto">
          Paste your lead generation agency contract below. We&apos;ll score it across five
          parameters that determine whether you get what you&apos;re paying for, and tell you
          exactly what to push back on before you sign.
        </p>

        <div className="mb-10">
          <SampleReportPreview />
        </div>

        <ReviewDisplay productSlug="vendor-check" />

        <ContractIntake onContinue={handleIntakeContinue} />

        {showReviewForm ? (
          <div
            ref={reviewFormRef}
            id="review-form"
            className="review-pulse mt-12 pt-8 border-t border-hairline"
          >
            <ReviewSubmissionForm productSlug="vendor-check" productName="Vendor Contract Assessment" />
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

  if (step === 'context') {
    return (
      <div>
        <h2 className="text-[26px] font-light tracking-[-0.26px] leading-[1.12] text-ink-900 text-center mb-8">
          A few quick questions.
        </h2>
        <ContextQuestions onSubmit={handleContextSubmit} />
      </div>
    )
  }

  if (step === 'processing') {
    return (
      <div className="text-center py-20">
        <p className="text-ink-900 text-lg">Scoring your contract...</p>
        <p className="text-sm text-ink-500 mt-2">This usually takes about 20 to 30 seconds.</p>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="text-center py-20">
        <p className="text-accent-rose text-base font-normal mb-2">Something went wrong.</p>
        <p className="text-sm text-ink-500 mb-6">{errorMessage}</p>
        <Button onClick={() => setStep('context')}>Try again</Button>
      </div>
    )
  }

  if (step === 'results' && result) {
    return (
      <ResultsReport result={result} processStage={processStage} />
    )
  }

  return null
}
