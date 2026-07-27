'use client'

import PdfExportSection from './PdfExportSection'
import ReviewSubmissionForm from './ReviewSubmissionForm'
import Button from './ui/Button'

export interface VendorCheckParameter {
  name: string
  score: number
  whatItSays: string
  whyItMatters: string
  whatToPropose: string
  redFlags: string[]
  greenFlags?: string[]
}

export interface VendorCheckResult {
  overallScore: number
  riskLevel: string
  verdict: string
  vendorTypeDisclaimer: string | null
  parameters: VendorCheckParameter[]
  topPriorities: string[]
}

function scoreColorClass(overallScore: number): string {
  if (overallScore >= 80) return 'text-green-700'
  if (overallScore >= 60) return 'text-amber-600'
  if (overallScore >= 40) return 'text-orange-600'
  return 'text-red-600'
}

function priorityHeading(processStage?: string): string {
  if (processStage === 'Already signed, checking what I agreed to') {
    return 'Your top 3 priorities for renegotiation'
  }
  if (processStage === 'Renewing or renegotiating') {
    return 'Your top 3 priorities for this renewal'
  }
  return 'Your top 3 priorities before signing'
}

export default function ResultsReport({
  result,
  processStage,
}: {
  result: VendorCheckResult
  processStage?: string
}) {
  const colorClass = scoreColorClass(result.overallScore)

  return (
    <div>
      <h2 className="text-[26px] font-light tracking-[-0.26px] leading-[1.12] text-ink-900 text-center mb-2">
        Your contract, parameter by parameter.
      </h2>

      <div className="text-center my-8">
        <div className={`text-4xl font-light tabular-nums ${colorClass}`}>{result.overallScore} / 100</div>
        <div className={`text-sm font-normal mt-1 ${colorClass}`}>{result.riskLevel}</div>
        <p className="text-ink-700 leading-[1.4] mt-3 max-w-lg mx-auto">{result.verdict}</p>
      </div>

      {result.vendorTypeDisclaimer && (
        <p className="text-xs text-ink-500 text-center mb-8 max-w-lg mx-auto italic">
          {result.vendorTypeDisclaimer}
        </p>
      )}

      <div className="flex flex-col gap-8 mb-10">
        {result.parameters.map((param) => (
          <div key={param.name} className="border border-hairline rounded-lg p-6">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-base font-light text-ink-900">{param.name}</h3>
              <span className="text-sm font-normal text-primary tabular-nums">{param.score} / 20</span>
            </div>

            {(param.redFlags?.filter((flag) => flag.trim()).length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {param.redFlags.filter((flag) => flag.trim()).map((flag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded-full"
                  >
                    {flag}
                  </span>
                ))}
              </div>
            )}

            {(param.greenFlags?.filter((flag) => flag.trim()).length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 mb-4">
                {(param.greenFlags ?? []).filter((flag) => flag.trim()).map((flag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full"
                  >
                    {flag}
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div>
                <p className="font-normal text-ink-900 mb-1">What your contract currently says:</p>
                <p className="text-ink-700 leading-[1.4]">{param.whatItSays}</p>
              </div>
              <div>
                <p className="font-normal text-ink-900 mb-1">Why this matters:</p>
                <p className="text-ink-700 leading-[1.4]">{param.whyItMatters}</p>
              </div>
              <div>
                <p className="font-normal text-ink-900 mb-1">What to propose instead:</p>
                <p className="text-ink-700 leading-[1.4]">{param.whatToPropose}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-hairline pt-8 mb-10">
        <h3 className="text-lg font-light text-ink-900 mb-4 text-center">{priorityHeading(processStage)}</h3>
        <ol className="max-w-xl mx-auto space-y-3 list-decimal list-inside text-sm text-ink-700">
          {result.topPriorities.map((priority, i) => (
            <li key={i} className="leading-[1.4]">{priority}</li>
          ))}
        </ol>
      </div>

      <div className="border-t border-hairline pt-8 mb-10">
        <PdfExportSection result={result} processStage={processStage} />
      </div>

      <div className="text-center mb-10">
        <Button href="https://www.jaydipsikdar.com/contact">
          Want to discuss the risks with me? Book a session
        </Button>
      </div>

      <div className="border-t border-hairline pt-8">
        <ReviewSubmissionForm productSlug="vendor-check" productName="Vendor Contract Check" />
      </div>
    </div>
  )
}
