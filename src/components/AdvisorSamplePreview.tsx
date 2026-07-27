'use client'

import { useState } from 'react'
import { IconSearch, IconTarget, IconChecklist, IconQuestion } from './AdvisorIcons'

// Static example content — a real, previously-generated Marketing Decision
// Advisor report (Brand Strategy category), shown on the landing page so
// visitors know what the real output looks like before they answer questions.
// Not a live AI call. Mirrors the pattern in SampleReportPreview.tsx
// (Vendor Contract Check).

const SAMPLE = {
  category: 'Brand strategy',
  context: 'Marketing professional · Just launched (0-6 months)',
  diagnosis:
    'You are posting promotional content about your practice into a feed that owes you nothing, and there is no reason for a stranger to stop scrolling for it. This is not a distribution volume problem, it is a positioning and content quality problem: nobody knows what specific pain you own, so nobody has a reason to remember you, engage, or refer you when that pain shows up.',
  firstThingToFix:
    'Fix your positioning before you touch your posting schedule again. Right now you are likely speaking to "marketing consulting" broadly, which is a category, not a problem. You need to niche down to one ideal customer and one specific problem you own, because that is what cuts through noise and gives people a reason to think of you at the right moment.',
  moves: [
    {
      order: 1,
      action:
        'Write down the one specific customer and one specific problem you want to be known for solving, then rewrite your LinkedIn bio and last 5 post ideas around that single problem only.',
      timeframe: 'This week',
      lessonTag: 'Own a problem, not a category',
    },
    {
      order: 2,
      action:
        'Audit your last 10 posts. If they are promoting your practice or services directly, replace that ratio so most posts are point-of-view content on your one problem area, not pitches.',
      timeframe: 'This week',
      lessonTag: 'Post with a real point of view',
    },
  ],
  oneQuestion:
    "If someone described your last 5 LinkedIn posts to a stranger, would that stranger know exactly what problem you solve and for whom, or would they just know you're \"in marketing\"?",
}

export default function AdvisorSamplePreview() {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-hairline rounded-lg p-6 bg-white">
      <p className="text-[10px] font-normal text-ink-500 uppercase tracking-[0.1px] mb-3 text-center">
        Example output
      </p>

      <div className="text-center mb-6">
        <span className="inline-flex items-center rounded-pill bg-primary px-4 py-1.5 text-xs font-normal text-white mb-2">
          {SAMPLE.category}
        </span>
        <p className="text-xs text-ink-500">{SAMPLE.context}</p>
      </div>

      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex-shrink-0 w-6 h-6 rounded-pill bg-surface-soft text-ink-700 flex items-center justify-center">
            <IconSearch className="w-3.5 h-3.5" />
          </span>
          <h4 className="text-sm font-light text-ink-900">Diagnosis</h4>
        </div>
        <p className="text-ink-700 text-xs leading-[1.4]">{SAMPLE.diagnosis}</p>
      </div>

      <div className="mb-5 border-l-4 border-primary bg-primary-subtle/20 rounded-r-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex-shrink-0 w-6 h-6 rounded-pill bg-primary text-white flex items-center justify-center">
            <IconTarget className="w-3.5 h-3.5" />
          </span>
          <h4 className="text-sm font-light text-ink-900">The first thing to fix</h4>
        </div>
        <p className="text-ink-700 text-xs leading-[1.4]">{SAMPLE.firstThingToFix}</p>
      </div>

      {expanded && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-pill bg-primary text-white flex items-center justify-center">
              <IconChecklist className="w-3.5 h-3.5" />
            </span>
            <h4 className="text-sm font-light text-ink-900">Your moves</h4>
          </div>
          <div className="flex flex-col gap-3">
            {SAMPLE.moves.map((move) => (
              <div key={move.order} className="border border-hairline rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-pill bg-primary text-white text-xs font-normal flex items-center justify-center">
                    {move.order}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <p className="text-xs font-normal text-ink-900">{move.action}</p>
                      <span className="flex-shrink-0 px-2 py-0.5 bg-surface-soft text-ink-700 text-[10px] rounded-pill">
                        {move.timeframe}
                      </span>
                    </div>
                    <span className="inline-block px-2 py-0.5 bg-primary-subtle text-primary-press text-[10px] font-normal rounded-pill">
                      {move.lessonTag}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-500 mt-3 italic">
            The full report includes 3 to 5 moves, a &quot;what would break this&quot; risk check, and
            a closing question.
          </p>
        </div>
      )}

      {expanded && (
        <div className="text-center px-2 mb-2">
          <IconQuestion className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-sm font-light italic text-ink-900 leading-[1.4]">
            {SAMPLE.oneQuestion}
          </p>
        </div>
      )}

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-sm text-primary hover:text-primary-hover transition-colors"
        >
          {expanded ? 'Show less' : 'See full example'}
        </button>
      </div>
    </div>
  )
}
