'use client'

import MaturityScoreLiveRadar from './MaturityScoreLiveRadar'
import { dimensionById, DIMENSION_GAP_SUMMARY, AI_READINESS_IMPLICATION } from '@/lib/maturityScoreData'
import { hexToRgba } from '@/lib/colorUtils'
import type { MaturityResult } from '@/lib/maturityScoring'

export default function MaturityScoreResults({ result }: { result: MaturityResult }) {
  const topGaps = result.weakest

  return (
    <div>
      <p className="text-[10px] font-normal uppercase tracking-[0.1px] font-sans text-[color:var(--color-primary)] mb-4 text-center">
        Marketing maturity diagnostic
      </p>

      <h1 className="text-[32px] font-light font-sans tracking-[-0.64px] leading-[1.1] text-[color:var(--text-body)] text-center mb-3">
        Your marketing maturity score
      </h1>

      <h2 className="text-[16px] font-light font-sans leading-[1.4] text-[color:var(--text-secondary)] text-center mb-6 max-w-lg mx-auto">
        {result.tier.headline}
      </h2>

      <div className="flex justify-center mb-8">
        <div
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-[var(--radius-md)]"
          style={{ background: hexToRgba(result.tier.color, 0.08), color: result.tier.color }}
        >
          <span className="[font-feature-settings:'tnum'_1] text-[36px] font-light font-sans tracking-[-0.9px] leading-none">
            {result.overallScore.toFixed(1)}
          </span>
          <span className="text-left leading-[1.3]">
            <span className="block text-[15px] font-light font-sans">{result.tier.label}</span>
            <span className="block [font-feature-settings:'tnum'_1] text-[11px] font-light font-sans opacity-65">
              Score range: {result.tier.min.toFixed(1)} – {result.tier.max.toFixed(1)}
            </span>
          </span>
        </div>
      </div>

      <div className="mb-6 flex justify-center">
        <MaturityScoreLiveRadar dimensionScores={result.dimensionScores} size={280} />
      </div>

      <div className="text-center mb-10">
        <p className="text-[15px] font-normal font-sans text-[color:var(--text-body)] mb-1.5">
          Your AI readiness:{' '}
          <span style={{ color: 'var(--accent-pink)' }}>{result.aiReadinessStage.label}</span>
        </p>
        <p className="text-[13px] font-light font-sans leading-[1.4] text-[color:var(--text-secondary)] max-w-md mx-auto">
          {AI_READINESS_IMPLICATION[result.aiReadinessStage.id]}
        </p>
      </div>

      <h3 className="text-[18px] font-light font-sans leading-[1.4] text-[color:var(--text-body)] mb-4">
        Your top 3 priority gaps
      </h3>
      <div className="flex flex-col gap-3">
        {topGaps.map((gap) => {
          const dimension = dimensionById(gap.dimensionId)
          return (
            <div
              key={gap.dimensionId}
              className="rounded-[var(--radius-lg)] border border-[color:var(--border-hairline)] bg-white p-6"
              style={{ borderLeft: `4px solid ${dimension.color}` }}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-[15px] font-normal font-sans text-[color:var(--text-body)]">
                  {dimension.name}
                </p>
                <p className="[font-feature-settings:'tnum'_1] text-[13px] font-light font-sans text-[color:var(--text-muted)]">
                  {gap.score.toFixed(1)} / 5.0
                </p>
              </div>
              <p className="text-[15px] font-light font-sans leading-[1.4] text-[color:var(--text-secondary)]">
                {DIMENSION_GAP_SUMMARY[gap.dimensionId]}
              </p>
            </div>
          )
        })}
      </div>

      <p className="text-center text-[13px] font-light font-sans text-[color:var(--text-muted)] mt-10">
        Build your content system next.{' '}
        <a
          href="/resources/content-office"
          className="text-[color:var(--color-primary)] hover:text-[color:var(--color-primary-hover)] transition-colors"
        >
          Try Jaydip&apos;s Content Office
        </a>
        .
      </p>
    </div>
  )
}
