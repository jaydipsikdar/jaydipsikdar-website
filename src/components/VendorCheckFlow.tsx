'use client'

import { useState } from 'react'
import ContractIntake from './ContractIntake'
import ContextQuestions, { ContextAnswers } from './ContextQuestions'
import ResultsReport, { VendorCheckResult } from './ResultsReport'
import SampleReportPreview from './SampleReportPreview'

type Step = 'landing' | 'context' | 'processing' | 'results' | 'error'

export default function VendorCheckFlow() {
  const [step, setStep] = useState<Step>('landing')
  const [contractText, setContractText] = useState('')
  const [result, setResult] = useState<VendorCheckResult | null>(null)
  const [processStage, setProcessStage] = useState<string | undefined>(undefined)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
        <h1 className="text-3xl font-bold text-center mb-4">
          Is your vendor contract protecting you — or them?
        </h1>
        <p className="text-center text-brand-text mb-10 max-w-xl mx-auto">
          Paste your lead generation agency contract below. We&apos;ll score it across five
          parameters that determine whether you get what you&apos;re paying for, and tell you
          exactly what to push back on before you sign.
        </p>

        <div className="mb-10">
          <SampleReportPreview />
        </div>

        <ContractIntake onContinue={handleIntakeContinue} />
      </div>
    )
  }

  if (step === 'context') {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-center mb-8">A few quick questions.</h2>
        <ContextQuestions onSubmit={handleContextSubmit} />
      </div>
    )
  }

  if (step === 'processing') {
    return (
      <div className="text-center py-20">
        <p className="text-brand-text text-lg">Scoring your contract…</p>
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
          onClick={() => setStep('context')}
          className="px-6 py-3 bg-brand-accent text-white rounded hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    )
  }

  if (step === 'results' && result) {
    return <ResultsReport result={result} processStage={processStage} />
  }

  return null
}
