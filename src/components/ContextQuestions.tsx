'use client'

import { useState } from 'react'
import Button from './ui/Button'

export interface ContextAnswers {
  vendorType: string
  whatsAtStake: string
  processStage: string
}

interface ContextQuestionsProps {
  onSubmit: (answers: ContextAnswers) => void
}

const VENDOR_TYPES = [
  'Lead generation / demand generation agency',
  'Performance marketing agency',
  'PR or content agency',
  'Other',
]

const STAKES = [
  'Getting real, qualified pipeline',
  'Protecting budget / cash flow',
  "Being able to exit cleanly if it doesn't work",
]

const STAGES = [
  'Reviewing before signing',
  'Already signed, checking what I agreed to',
  'Renewing or renegotiating',
]

function QuestionBlock({
  question,
  options,
  selected,
  onSelect,
}: {
  question: string
  options: string[]
  selected: string | null
  onSelect: (value: string) => void
}) {
  return (
    <div className="mb-8">
      <h3 className="text-base font-light text-ink-900 mb-3">{question}</h3>
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`text-left px-4 py-3 rounded-md border text-sm transition-colors ${
              selected === option
                ? 'border-primary bg-primary-subtle/30 text-ink-900 font-normal'
                : 'border-hairline-input bg-white text-ink-700 hover:border-primary'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ContextQuestions({ onSubmit }: ContextQuestionsProps) {
  const [vendorType, setVendorType] = useState<string | null>(null)
  const [whatsAtStake, setWhatsAtStake] = useState<string | null>(null)
  const [processStage, setProcessStage] = useState<string | null>(null)

  const canSubmit = vendorType && whatsAtStake && processStage

  return (
    <div>
      <QuestionBlock
        question="What kind of vendor is this contract with?"
        options={VENDOR_TYPES}
        selected={vendorType}
        onSelect={setVendorType}
      />
      <QuestionBlock
        question="What's most at stake for you in this engagement?"
        options={STAKES}
        selected={whatsAtStake}
        onSelect={setWhatsAtStake}
      />
      <QuestionBlock
        question="Where are you in the process?"
        options={STAGES}
        selected={processStage}
        onSelect={setProcessStage}
      />

      {vendorType && vendorType !== 'Lead generation / demand generation agency' && (
        <p className="text-xs text-ink-500 mb-6 -mt-4">
          This version is tuned for lead generation contracts. Your results will be directionally
          useful, but built specifically for lead gen engagements.
        </p>
      )}

      <div className="text-center">
        <Button
          type="button"
          disabled={!canSubmit}
          onClick={() =>
            canSubmit &&
            onSubmit({
              vendorType: vendorType!,
              whatsAtStake: whatsAtStake!,
              processStage: processStage!,
            })
          }
        >
          Score my contract
        </Button>
      </div>
    </div>
  )
}
