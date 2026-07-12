'use client'

import { useState } from 'react'

// Static example content, drawn from 01-content/vendor-contract-check-sample-report.md.
// This is a fixed illustrative sample — not a live AI call — shown on the landing page
// so visitors know what the real output looks like before they paste their own contract.

const SAMPLE_PARAMETERS = [
  {
    name: 'Deliverable Clarity',
    score: 7,
    whatItSays:
      'The SOW references "qualified leads" as the primary deliverable and commits to a range of 18-24 leads per quarter. There is no definition of what constitutes a qualified lead. No sign-off authority or acceptance process is named.',
    whyItMatters:
      'Without a precise, mutually agreed definition of a qualified lead, you have no contractual basis to dispute delivery. A range instead of a fixed number gives the vendor a built-in cushion to underdeliver by up to 25% while remaining technically compliant.',
    whatToPropose:
      'Add a Qualified Lead Definition clause specifying ICP fit, a relevant use case, and demonstrated purchase intent. Name your designated Sales Lead as the sign-off authority. Replace the range with a fixed quarterly target.',
  },
  {
    name: 'Performance Accountability',
    score: 6,
    whatItSays:
      'The contract includes a quarterly target range but no holdback mechanism. Full monthly retainer is payable regardless of delivery progress. The only remedy for underperformance is 15 additional days of service at no extra cost.',
    whyItMatters:
      'Fifteen days of additional service is not a meaningful consequence — you keep paying full retainer with no leverage tied to actual delivery.',
    whatToPropose:
      'Hold the final month’s payment until the quarterly target is achieved. Introduce a 30-day remediation period (15+15) at no additional cost, with pro-rata release if the target remains unmet.',
  },
  {
    name: 'Data Ownership',
    score: 8,
    whatItSays:
      'The contract states "campaign deliverables" belong to the client but doesn’t enumerate what this includes. No mention of contact databases, engagement history, or CRM-exportable data.',
    whyItMatters:
      'If the engagement ends, you risk losing every contact researched and every response logged — all of which you paid for.',
    whatToPropose:
      'Add an explicit Campaign Data Ownership clause listing everything the client retains, in CRM-ready export format, plus an Exit Deliverables clause with a defined handover timeline.',
  },
  {
    name: 'Exit Terms',
    score: 9,
    whatItSays:
      'Either party may terminate with 30 days’ notice. A "target universe exhausted" clause allows the vendor to determine, at their sole discretion, that the market is fully contacted — ending the engagement with no refund.',
    whyItMatters:
      'The "sole discretion" clause gives the vendor an unchecked exit option — they can walk away without consequence while you’ve paid for a full quarter with partial delivery.',
    whatToPropose:
      'Replace "sole discretion" with "mutual agreement" supported by data. Add a performance-linked exit option with pro-rata refund if targets are missed by more than 30%.',
    // This is the highest-scoring parameter in the sample (still below the real
    // 16+ threshold for a green flag), included here only to demonstrate the
    // green-flag pattern on the landing page preview.
    greenFlags: ['30-day notice period — standard and fair'],
  },
  {
    name: 'Payment vs. Delivery Alignment',
    score: 8,
    whatItSays:
      'Monthly retainer payable in advance, with no portion tied to delivery milestones. Auto-renewal triggers unless 45-day written notice is provided.',
    whyItMatters:
      'You’re fully paid up before the vendor has delivered anything each month — there’s no financial incentive for them to perform.',
    whatToPropose:
      'Restructure payment as 70% in advance / 30% held back until quarterly verification. Reduce auto-renewal notice to 30 days, or shift to opt-in renewal.',
  },
]

export default function SampleReportPreview() {
  const [expanded, setExpanded] = useState(false)
  const visibleParams = expanded ? SAMPLE_PARAMETERS : SAMPLE_PARAMETERS.slice(0, 1)

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 text-center">
        Example output
      </p>

      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-brand-accent">38 / 100</div>
        <div className="text-sm font-medium text-brand-text mt-1">High Risk</div>
        <p className="text-brand-text text-sm mt-2 max-w-md mx-auto">
          This contract materially favours the vendor. Multiple critical protections are either
          missing or too weak to enforce.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {visibleParams.map((param) => (
          <div key={param.name} className="border-t border-gray-200 pt-5 first:border-t-0 first:pt-0">
            <div className="flex items-baseline justify-between mb-2">
              <h4 className="text-sm font-semibold">{param.name}</h4>
              <span className="text-sm font-medium text-brand-accent">{param.score} / 20</span>
            </div>

            {'greenFlags' in param && param.greenFlags && param.greenFlags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {param.greenFlags.map((flag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full"
                  >
                    {flag}
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-2 text-xs text-brand-text leading-relaxed">
              <p><span className="font-medium">What it says: </span>{param.whatItSays}</p>
              <p><span className="font-medium">Why it matters: </span>{param.whyItMatters}</p>
              <p><span className="font-medium">What to propose: </span>{param.whatToPropose}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-6">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-sm text-brand-accent underline hover:opacity-80 transition-opacity"
        >
          {expanded ? 'Show less' : 'See full example →'}
        </button>
      </div>
    </div>
  )
}
