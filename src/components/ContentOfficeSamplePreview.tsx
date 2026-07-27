'use client'

import { useState } from 'react'
import ContentMatrixCell from './ContentMatrixCell'
import type { MatrixCell } from '@/lib/contentOfficeData'

// Static example — a plausible, previously-computed result shown on the
// landing page so visitors know what the real output looks like before they
// fill in the form. Not a live submission. Mirrors MaturityScoreSamplePreview.

const SAMPLE_PILLAR = 'B2B pricing strategy'

const SAMPLE_CELLS: MatrixCell[] = [
  {
    theme: 'pov',
    contentIdea: 'Most B2B companies underprice by 40 percent. Here is why that is rational, not reckless.',
    structure: 'contrarian',
    channelMapping: [
      { channel: 'linkedin', guidance: '1,200-char post, open with the contrarian claim, close with your reasoning.' },
      { channel: 'newsletter', guidance: '600-word personal take, reference a client example.' },
    ],
  },
  {
    theme: 'education',
    contentIdea: 'How to run a pricing audit in 5 steps before your next renewal cycle.',
    structure: 'tutorial',
    channelMapping: [
      { channel: 'linkedin', guidance: '1,200-char post, numbered steps with white space between each.' },
      { channel: 'newsletter', guidance: '700-word walkthrough with a downloadable checklist link.' },
    ],
  },
  {
    theme: 'behind-the-scenes',
    contentIdea: 'How I helped a client raise prices 30 percent without losing a single account.',
    structure: 'case-breakdown',
    channelMapping: [
      { channel: 'linkedin', guidance: '1,400-char post, story arc: the problem, the move, the result.' },
      { channel: 'newsletter', guidance: '650-word case study with the exact email they sent customers.' },
    ],
  },
]

export default function ContentOfficeSamplePreview() {
  const [expanded, setExpanded] = useState(false)
  const visibleCells = expanded ? SAMPLE_CELLS : SAMPLE_CELLS.slice(0, 1)

  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border-hairline)] bg-white p-6">
      <p className="text-[10px] font-normal uppercase tracking-[0.1px] font-sans text-[color:var(--text-muted)] mb-4 text-center">
        Example output
      </p>

      <p className="text-[13px] font-light font-sans text-[color:var(--text-secondary)] text-center mb-5 max-w-md mx-auto">
        A B2B fintech founder, building authority with SaaS buyers, pillar: <span className="font-normal text-[color:var(--text-body)]">{SAMPLE_PILLAR}</span>
      </p>

      <div className="flex flex-col gap-4">
        {visibleCells.map((cell) => (
          <ContentMatrixCell key={cell.theme} cell={cell} />
        ))}
      </div>

      {expanded && (
        <p className="text-[13px] font-light font-sans text-[color:var(--text-muted)] mt-4 italic">
          The full matrix adds 7 more themes for this pillar, plus your other pillars, a starter sequence, and a gap analysis.
        </p>
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
