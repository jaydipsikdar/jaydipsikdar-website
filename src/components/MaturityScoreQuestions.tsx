'use client'

import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import MaturityScoreLiveRadar from './MaturityScoreLiveRadar'
import {
  ROLE_OPTIONS,
  STAGE_OPTIONS,
  FUNDING_OPTIONS,
  COMPLETION_FRAMING,
  DIMENSIONS,
  QUESTIONS,
  AI_QUESTIONS,
  AI_TRANSITION_COPY,
  questionsForDimension,
  type RoleId,
  type StageId,
  type FundingId,
  type Qualifiers,
  type DimensionId,
} from '@/lib/maturityScoreData'
import {
  answeredCount,
  aiAnsweredCount,
  scoreAllDimensions,
  type Answers,
  type AIAnswers,
  type DimensionScore,
} from '@/lib/maturityScoring'

type Phase = 'role' | 'stage' | 'funding' | 'framing' | 'questions' | 'ai-transition' | 'ai-questions'

interface MaturityScoreQuestionsProps {
  onComplete: (qualifiers: Qualifiers, answers: Answers, aiAnswers: AIAnswers) => void
}

const TOTAL_QUESTIONS = QUESTIONS.length + AI_QUESTIONS.length

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

// Secondary text reference once the live radar takes over as the primary
// progress indicator (see LiveRadarBlock below).
function CaptionIndicator({ label }: { label: string }) {
  return (
    <p className="text-[13px] font-normal font-sans tracking-[-0.39px] text-[color:var(--text-muted)] mb-6">
      {label}
    </p>
  )
}

// Desktop: persistent chart in its own reserved column (see the md:flex
// wrapper in each phase's return below) so position: sticky pins it within
// that column's height instead of overlapping content that scrolls past it.
function DesktopRadarSidebar({
  dimensionScores,
  revealed,
}: {
  dimensionScores: DimensionScore[]
  revealed: DimensionId[]
}) {
  return (
    <div className="hidden md:block md:w-[160px] md:flex-shrink-0">
      <div className="md:sticky md:top-6">
        <MaturityScoreLiveRadar dimensionScores={dimensionScores} revealed={revealed} size={160} />
      </div>
    </div>
  )
}

// Mobile: collapsible mini chart, tap to expand. No sticky positioning
// needed since it's a small inline toggle at the top of the content column.
function MobileRadarToggle({
  dimensionScores,
  revealed,
  expanded,
  onToggleExpanded,
}: {
  dimensionScores: DimensionScore[]
  revealed: DimensionId[]
  expanded: boolean
  onToggleExpanded: () => void
}) {
  return (
    <div className="md:hidden flex justify-center mb-6">
      <button type="button" onClick={onToggleExpanded} className="flex flex-col items-center gap-1">
        <MaturityScoreLiveRadar
          dimensionScores={dimensionScores}
          revealed={revealed}
          size={expanded ? 176 : 64}
          className="transition-[width,height] duration-150 ease-out"
        />
        <span className="text-[13px] font-normal font-sans text-[color:var(--text-muted)]">
          {expanded ? 'Tap to collapse' : 'Tap to expand'}
        </span>
      </button>
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
  const [phase, setPhase] = useState<Phase>('role')
  const [role, setRole] = useState<RoleId | null>(null)
  const [stage, setStage] = useState<StageId | null>(null)
  const [funding, setFunding] = useState<FundingId | null>(null)
  const [dimensionIndex, setDimensionIndex] = useState(0)
  const [mobileQuestionIndex, setMobileQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [aiQuestionIndex, setAiQuestionIndex] = useState(0)
  const [aiAnswers, setAiAnswers] = useState<AIAnswers>({})
  const [radarExpanded, setRadarExpanded] = useState(false)

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
      setAnswers(latestAnswers)
      setPhase('ai-transition')
    }
  }

  function handleDesktopContinue() {
    advanceDimensionOrFinish(answers)
  }

  function selectAIAnswer(questionId: string, score: number, isLast: boolean) {
    const next = { ...aiAnswers, [questionId]: score }
    setAiAnswers(next)
    if (isLast) {
      onComplete({ role: role!, stage: stage!, funding: funding! }, answers, next)
    } else {
      setAiQuestionIndex((i) => i + 1)
    }
  }

  function handleAIDesktopContinue() {
    onComplete({ role: role!, stage: stage!, funding: funding! }, answers, aiAnswers)
  }

  function handleBackAIMobile() {
    if (aiQuestionIndex > 0) {
      setAiQuestionIndex((i) => i - 1)
      return
    }
    setPhase('ai-transition')
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

  // ── AI readiness transition ──

  if (phase === 'ai-transition') {
    const progressFraction = 0.2 + 0.8 * (QUESTIONS.length / TOTAL_QUESTIONS)
    return (
      <div>
        <BackButton onClick={() => setPhase('questions')} />
        <ProgressBar fraction={progressFraction} label={`Question ${QUESTIONS.length} of ${TOTAL_QUESTIONS}`} />
        <h2 className="text-[26px] font-light font-sans tracking-[-0.26px] leading-[1.12] text-[color:var(--text-body)] mb-8">
          {AI_TRANSITION_COPY}
        </h2>
        <button
          type="button"
          onClick={() => setPhase('ai-questions')}
          className="px-4 py-2 rounded-[var(--radius-pill)] bg-[color:var(--color-primary)] text-white text-[16px] font-normal font-sans hover:bg-[color:var(--color-primary-hover)] transition-colors"
        >
          Continue
        </button>
      </div>
    )
  }

  // ── AI readiness questions ──

  if (phase === 'ai-questions') {
    const overallAnsweredAI = answeredCount(answers) + aiAnsweredCount(aiAnswers)
    const progressFraction = 0.2 + 0.8 * (overallAnsweredAI / TOTAL_QUESTIONS)
    const aiAllAnswered = AI_QUESTIONS.every((q) => typeof aiAnswers[q.id] === 'number')
    const liveDimensionScores = scoreAllDimensions(answers)
    const allDimensionIds = DIMENSIONS.map((d) => d.id)

    return (
      <div className="md:flex md:gap-10 md:items-start">
      <div className="md:flex-1 md:min-w-0">
        <div className="md:hidden">
          <BackButton onClick={handleBackAIMobile} />
        </div>
        <div className="hidden md:block">
          <BackButton onClick={() => setPhase('ai-transition')} />
        </div>

        <MobileRadarToggle
          dimensionScores={liveDimensionScores}
          revealed={allDimensionIds}
          expanded={radarExpanded}
          onToggleExpanded={() => setRadarExpanded((v) => !v)}
        />

        <CaptionIndicator
          label={`Question ${QUESTIONS.length + 1} of ${TOTAL_QUESTIONS} · AI readiness · ${Math.round(progressFraction * 100)}% complete`}
        />

        {/* Mobile: one AI question at a time */}
        <div className="md:hidden">
          {(() => {
            const q = AI_QUESTIONS[aiQuestionIndex]
            const isLast = aiQuestionIndex === AI_QUESTIONS.length - 1
            return (
              <div>
                <p className="text-[10px] font-normal uppercase tracking-[0.1px] font-sans mb-3 text-[color:var(--accent-pink)]">
                  AI readiness
                </p>
                <h2 className="text-[20px] font-light font-sans tracking-[-0.2px] leading-[1.4] text-[color:var(--text-body)] mb-6">
                  <span className="[font-feature-settings:'tnum'_1] text-[color:var(--text-muted)]">
                    Q{QUESTIONS.length + aiQuestionIndex + 1}.{' '}
                  </span>
                  {q.question}
                </h2>
                <div className="flex flex-col gap-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt.text}
                      type="button"
                      onClick={() => selectAIAnswer(q.id, opt.score, isLast)}
                      className={`text-left px-4 py-3 rounded-[var(--radius-md)] border text-[15px] font-light font-sans leading-[1.4] transition-colors ${
                        aiAnswers[q.id] === opt.score
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

        {/* Desktop: all 5 AI questions stacked */}
        <div className="hidden md:block">
          <p className="text-[10px] font-normal uppercase tracking-[0.1px] font-sans mb-2 text-[color:var(--accent-pink)]">
            AI readiness
          </p>
          <h2 className="text-[26px] font-light font-sans tracking-[-0.26px] leading-[1.12] text-[color:var(--text-body)] mb-8">
            Now let&apos;s look at how AI fits into your workflows
          </h2>
          <div className="flex flex-col gap-10">
            {AI_QUESTIONS.map((q, qi) => (
              <div key={q.id}>
                <h3 className="text-[18px] font-light font-sans leading-[1.4] text-[color:var(--text-body)] mb-4">
                  <span className="[font-feature-settings:'tnum'_1] text-[color:var(--text-muted)]">
                    Q{QUESTIONS.length + qi + 1}.{' '}
                  </span>
                  {q.question}
                </h3>
                <div className="flex flex-col gap-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt.text}
                      type="button"
                      onClick={() => setAiAnswers((prev) => ({ ...prev, [q.id]: opt.score }))}
                      className={`text-left px-4 py-3 rounded-[var(--radius-md)] border text-[15px] font-light font-sans leading-[1.4] transition-colors ${
                        aiAnswers[q.id] === opt.score
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
              disabled={!aiAllAnswered}
              onClick={handleAIDesktopContinue}
              className="px-4 py-2 rounded-[var(--radius-pill)] bg-[color:var(--color-primary)] text-white text-[16px] font-normal font-sans hover:bg-[color:var(--color-primary-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              See your results
            </button>
          </div>
        </div>
      </div>
      <DesktopRadarSidebar dimensionScores={liveDimensionScores} revealed={allDimensionIds} />
      </div>
    )
  }

  // ── Questions phase ──

  const overallAnswered = answeredCount(answers)
  const progressFraction = 0.2 + 0.8 * (overallAnswered / TOTAL_QUESTIONS)
  const liveDimensionScores = scoreAllDimensions(answers)
  const revealedDimensionIds = DIMENSIONS.filter((d) =>
    questionsForDimension(d.id).every((q) => typeof answers[q.id] === 'number')
  ).map((d) => d.id)

  return (
    <div className="md:flex md:gap-10 md:items-start">
    <div className="md:flex-1 md:min-w-0">
      {/* Mobile back — steps one question at a time */}
      <div className="md:hidden">
        <BackButton onClick={handleBackMobile} />
      </div>
      {/* Desktop back — steps one dimension at a time */}
      <div className="hidden md:block">
        <BackButton onClick={handleBackDesktop} />
      </div>

      <MobileRadarToggle
        dimensionScores={liveDimensionScores}
        revealed={revealedDimensionIds}
        expanded={radarExpanded}
        onToggleExpanded={() => setRadarExpanded((v) => !v)}
      />

      <CaptionIndicator
        label={`Question ${Math.min(TOTAL_QUESTIONS, globalIndexOfDimensionStart + mobileQuestionIndex + 1)} of ${TOTAL_QUESTIONS} · ${dimension.name} · ${Math.round(progressFraction * 100)}% complete`}
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
                <span className="[font-feature-settings:'tnum'_1] text-[color:var(--text-muted)]">
                  Q{globalIndexOfDimensionStart + mobileQuestionIndex + 1}.{' '}
                </span>
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
                <span className="[font-feature-settings:'tnum'_1] text-[color:var(--text-muted)]">
                  Q{QUESTIONS.findIndex((qq) => qq.id === q.id) + 1}.{' '}
                </span>
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
            Continue
          </button>
        </div>
      </div>
    </div>
      <DesktopRadarSidebar dimensionScores={liveDimensionScores} revealed={revealedDimensionIds} />
    </div>
  )
}
