'use client'

import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import {
  ROLE_OPTIONS,
  STAGE_OPTIONS,
  FUNDING_OPTIONS,
  COMPLETION_FRAMING,
  DIMENSIONS,
  QUESTIONS,
  questionsForDimension,
  type RoleId,
  type StageId,
  type FundingId,
  type Qualifiers,
} from '@/lib/maturityScoreData'
import { answeredCount, type Answers } from '@/lib/maturityScoring'

type QualifierPhase = 'role' | 'stage' | 'funding' | 'framing'

interface MaturityScoreQuestionsProps {
  onComplete: (qualifiers: Qualifiers, answers: Answers) => void
}

const TOTAL_QUESTIONS = QUESTIONS.length

function ProgressBar({ fraction, label }: { fraction: number; label: string }) {
  return (
    <div className="mb-8">
      <p className="text-[11px] font-normal uppercase tracking-[0.1px] text-[color:var(--text-muted)] mb-2 font-sans">
        {label}
      </p>
      <div className="h-1 w-full rounded-[var(--radius-pill)] bg-[color:var(--border-hairline)] overflow-hidden">
        <div
          className="h-full rounded-[var(--radius-pill)] bg-[color:var(--color-primary)] transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, fraction * 100))}%` }}
        />
      </div>
    </div>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-[15px] font-light font-sans text-[color:var(--text-secondary)] hover:text-[color:var(--text-body)] transition-colors mb-6"
    >
      <ChevronLeft size={18} strokeWidth={1.5} />
      Back
    </button>
  )
}

function QualifierScreen({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string
  options: readonly { id: string; label: string }[]
  selected: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <h2 className="text-[26px] font-light font-sans tracking-[-0.26px] leading-[1.12] text-[color:var(--text-body)] mb-8">
        {title}
      </h2>
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={`text-left px-4 py-3 rounded-[var(--radius-md)] border text-[15px] font-light font-sans transition-colors ${
              selected === opt.id
                ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary-subtle)] text-[color:var(--text-body)]'
                : 'border-[color:var(--border-hairline)] bg-white text-[color:var(--text-body)] hover:border-[color:var(--color-primary)]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function MaturityScoreQuestions({ onComplete }: MaturityScoreQuestionsProps) {
  const [phase, setPhase] = useState<QualifierPhase | 'questions'>('role')
  const [role, setRole] = useState<RoleId | null>(null)
  const [stage, setStage] = useState<StageId | null>(null)
  const [funding, setFunding] = useState<FundingId | null>(null)
  const [dimensionIndex, setDimensionIndex] = useState(0)
  const [mobileQuestionIndex, setMobileQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})

  const dimension = DIMENSIONS[dimensionIndex]
  const dimensionQuestions = questionsForDimension(dimension.id)
  const globalIndexOfDimensionStart = QUESTIONS.findIndex((q) => q.dimensionId === dimension.id)

  function finishQualifiers() {
    setPhase('questions')
  }

  function selectAnswer(questionId: string, score: number, isLastInDimensionMobile: boolean) {
    const next = { ...answers, [questionId]: score }
    setAnswers(next)

    if (isLastInDimensionMobile) {
      advanceDimensionOrFinish(next)
    } else {
      setMobileQuestionIndex((i) => i + 1)
    }
  }

  function advanceDimensionOrFinish(latestAnswers: Answers) {
    if (dimensionIndex < DIMENSIONS.length - 1) {
      setDimensionIndex((i) => i + 1)
      setMobileQuestionIndex(0)
    } else {
      onComplete({ role: role!, stage: stage!, funding: funding! }, latestAnswers)
    }
  }

  function handleDesktopContinue() {
    advanceDimensionOrFinish(answers)
  }

  function handleBackMobile() {
    if (mobileQuestionIndex > 0) {
      setMobileQuestionIndex((i) => i - 1)
      return
    }
    if (dimensionIndex > 0) {
      const prevDimension = DIMENSIONS[dimensionIndex - 1]
      setDimensionIndex((i) => i - 1)
      setMobileQuestionIndex(questionsForDimension(prevDimension.id).length - 1)
      return
    }
    setPhase('framing')
  }

  function handleBackDesktop() {
    if (dimensionIndex > 0) {
      setDimensionIndex((i) => i - 1)
      return
    }
    setPhase('framing')
  }

  const dimensionAllAnswered = dimensionQuestions.every((q) => typeof answers[q.id] === 'number')

  // ── Qualifier phases ──

  if (phase === 'role') {
    return (
      <div>
        <ProgressBar fraction={0.05} label="Step 1 of 4" />
        <QualifierScreen
          title="What best describes your role?"
          options={ROLE_OPTIONS}
          selected={role}
          onSelect={(id) => {
            setRole(id as RoleId)
            setPhase('stage')
          }}
        />
      </div>
    )
  }

  if (phase === 'stage') {
    return (
      <div>
        <BackButton onClick={() => setPhase('role')} />
        <ProgressBar fraction={0.1} label="Step 2 of 4" />
        <QualifierScreen
          title="What stage is the company at?"
          options={STAGE_OPTIONS}
          selected={stage}
          onSelect={(id) => {
            setStage(id as StageId)
            setPhase('funding')
          }}
        />
      </div>
    )
  }

  if (phase === 'funding') {
    return (
      <div>
        <BackButton onClick={() => setPhase('stage')} />
        <ProgressBar fraction={0.15} label="Step 3 of 4" />
        <QualifierScreen
          title="How is the company funded?"
          options={FUNDING_OPTIONS}
          selected={funding}
          onSelect={(id) => {
            setFunding(id as FundingId)
            setPhase('framing')
          }}
        />
      </div>
    )
  }

  if (phase === 'framing') {
    return (
      <div>
        <BackButton onClick={() => setPhase('funding')} />
        <ProgressBar fraction={0.2} label="Step 4 of 4" />
        <h2 className="text-[26px] font-light font-sans tracking-[-0.26px] leading-[1.12] text-[color:var(--text-body)] mb-6">
          Before you start
        </h2>
        <div className="flex flex-col gap-4 mb-10">
          {COMPLETION_FRAMING.map((line) => (
            <p
              key={line}
              className="text-[15px] font-light font-sans leading-[1.4] text-[color:var(--text-secondary)] bg-[color:var(--surface-soft)] rounded-[var(--radius-lg)] border border-[color:var(--border-hairline)] p-6"
            >
              {line}
            </p>
          ))}
        </div>
        <button
          type="button"
          onClick={finishQualifiers}
          className="px-4 py-2 rounded-[var(--radius-pill)] bg-[color:var(--color-primary)] text-white text-[16px] font-normal font-sans hover:bg-[color:var(--color-primary-hover)] transition-colors"
        >
          Begin assessment
        </button>
      </div>
    )
  }

  // ── Questions phase ──

  const overallAnswered = answeredCount(answers)
  const progressFraction = 0.2 + 0.8 * (overallAnswered / TOTAL_QUESTIONS)

  return (
    <div>
      {/* Mobile back — steps one question at a time */}
      <div className="md:hidden">
        <BackButton onClick={handleBackMobile} />
      </div>
      {/* Desktop back — steps one dimension at a time */}
      <div className="hidden md:block">
        <BackButton onClick={handleBackDesktop} />
      </div>

      <ProgressBar
        fraction={progressFraction}
        label={`Question ${Math.min(TOTAL_QUESTIONS, globalIndexOfDimensionStart + mobileQuestionIndex + 1)} of ${TOTAL_QUESTIONS} — ${dimension.name}`}
      />

      {/* Mobile: one question at a time */}
      <div className="md:hidden">
        {(() => {
          const q = dimensionQuestions[mobileQuestionIndex]
          const isLast = mobileQuestionIndex === dimensionQuestions.length - 1
          return (
            <div>
              <p
                className="text-[10px] font-normal uppercase tracking-[0.1px] font-sans mb-3"
                style={{ color: dimension.color }}
              >
                {dimension.name}
              </p>
              <h2 className="text-[20px] font-light font-sans tracking-[-0.2px] leading-[1.4] text-[color:var(--text-body)] mb-6">
                {q.question}
              </h2>
              <div className="flex flex-col gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt.text}
                    type="button"
                    onClick={() => selectAnswer(q.id, opt.score, isLast)}
                    className={`text-left px-4 py-3 rounded-[var(--radius-md)] border text-[15px] font-light font-sans leading-[1.4] transition-colors ${
                      answers[q.id] === opt.score
                        ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary-subtle)] text-[color:var(--text-body)]'
                        : 'border-[color:var(--border-hairline)] bg-white text-[color:var(--text-body)] hover:border-[color:var(--color-primary)]'
                    }`}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          )
        })()}
      </div>

      {/* Desktop: all questions in the dimension, stacked */}
      <div className="hidden md:block">
        <p
          className="text-[10px] font-normal uppercase tracking-[0.1px] font-sans mb-2"
          style={{ color: dimension.color }}
        >
          {dimension.name}
        </p>
        <h2 className="text-[26px] font-light font-sans tracking-[-0.26px] leading-[1.12] text-[color:var(--text-body)] mb-8">
          Now let&apos;s look at your {dimension.shortName.toLowerCase()}
        </h2>
        <div className="flex flex-col gap-10">
          {dimensionQuestions.map((q) => (
            <div key={q.id}>
              <h3 className="text-[18px] font-light font-sans leading-[1.4] text-[color:var(--text-body)] mb-4">
                {q.question}
              </h3>
              <div className="flex flex-col gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt.text}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.score }))}
                    className={`text-left px-4 py-3 rounded-[var(--radius-md)] border text-[15px] font-light font-sans leading-[1.4] transition-colors ${
                      answers[q.id] === opt.score
                        ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary-subtle)] text-[color:var(--text-body)]'
                        : 'border-[color:var(--border-hairline)] bg-white text-[color:var(--text-body)] hover:border-[color:var(--color-primary)]'
                    }`}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <button
            type="button"
            disabled={!dimensionAllAnswered}
            onClick={handleDesktopContinue}
            className="px-4 py-2 rounded-[var(--radius-pill)] bg-[color:var(--color-primary)] text-white text-[16px] font-normal font-sans hover:bg-[color:var(--color-primary-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {dimensionIndex < DIMENSIONS.length - 1 ? 'Continue' : 'See your results'}
          </button>
        </div>
      </div>
    </div>
  )
}
