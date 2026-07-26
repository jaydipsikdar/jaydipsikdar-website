'use client'

import { useState } from 'react'
import MaturityScoreLiveRadar from './MaturityScoreLiveRadar'
import { dimensionById, tierForScore, type DimensionId } from '@/lib/maturityScoreData'
import { hexToRgba } from '@/lib/colorUtils'

// Static example — a plausible, previously-computed result shown on the
// landing page so visitors know what the real output looks like before they
// answer 25 questions. Not a live submission. Mirrors AdvisorSamplePreview /
// SampleReportPreview.

const SAMPLE_SCORES: { dimensionId: DimensionId; score: number }[] = [
  { dimensionId: 'positioning', score: 2.3 },
  { dimensionId: 'demand-gen', score: 2.0 },
  { dimensionId: 'content', score: 1.5 },
  { dimensionId: 'ops', score: 3.0 },
  { dimensionId: 'measurement', score: 2.3 },
  { dimensionId: 'team', score: 2.7 },
]

const SAMPLE_OVERALL = 2.3
const SAMPLE_GAPS: { dimensionId: DimensionId; sentence: string }[] = [
  {
    dimensionId: 'content',
    sentence: 'Content is sporadic and untracked, so it builds little authority and even less pipeline.',
  },
  {
    dimensionId: 'demand-gen',
    sentence: "Leads come from one or two channels, and you don't know which ones actually convert.",
  },
  {
    dimensionId: 'positioning',
    sentence: 'No documented ICP means every campaign is guessing at who it should be talking to.',
  },
]

export default function MaturityScoreSamplePreview() {
  const [expanded, setExpanded] = useState(false)
  const tier = tierForScore(SAMPLE_OVERALL)

  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border-hairline)] bg-white p-6">
      <p className="text-[10px] font-normal uppercase tracking-[0.1px] font-sans text-[color:var(--text-muted)] mb-4 text-center">
        Example output
      </p>

      <div className="flex justify-center mb-4">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)]"
          style={{ background: hexToRgba(tier.color, 0.08), color: tier.color }}
        >
          <span className="[font-feature-settings:'tnum'_1] text-[22px] font-light font-sans tracking-[-0.22px] leading-none">
            {SAMPLE_OVERALL.toFixed(1)}
          </span>
          <span className="text-[13px] font-light font-sans">{tier.label}</span>
        </div>
      </div>

      <div className="mb-4 flex justify-center">
        <MaturityScoreLiveRadar dimensionScores={SAMPLE_SCORES} size={240} />
      </div>

      {expanded && (
        <div className="mb-2">
          <h4 className="text-[15px] font-normal font-sans text-[color:var(--text-body)] mb-3">
            Top 3 priority gaps
          </h4>
          <div className="flex flex-col gap-2">
            {SAMPLE_GAPS.map((gap) => {
              const dimension = dimensionById(gap.dimensionId)
              return (
                <div
                  key={gap.dimensionId}
                  className="rounded-[var(--radius-md)] border border-[color:var(--border-hairline)] p-4"
                  style={{ borderLeft: `4px solid ${dimension.color}` }}
                >
                  <p className="text-[13px] font-normal font-sans text-[color:var(--text-body)] mb-1">
                    {dimension.name}
                  </p>
                  <p className="text-[13px] font-light font-sans leading-[1.4] text-[color:var(--text-secondary)]">
                    {gap.sentence}
                  </p>
                </div>
              )
            })}
          </div>
          <p className="text-[13px] font-light font-sans text-[color:var(--text-muted)] mt-3 italic">
            The full report adds a breakdown for all 6 dimensions, benchmarks for your stage, and
            your next 90 days.
          </p>
        </div>
      )}

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-[15px] font-light font-sans text-[color:var(--color-primary)] hover:text-[color:var(--color-primary-hover)] transition-colors"
        >
          {expanded ? 'Show less' : 'See full example →'}
        </button>
      </div>
    </div>
  )
}
