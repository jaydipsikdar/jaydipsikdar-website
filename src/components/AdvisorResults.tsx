'use client'

import { useState } from 'react'
import { CATEGORIES, type MarketingCategory } from './CategorySelect'
import { IconSearch, IconTarget, IconChecklist, IconAlertTriangle, IconQuestion } from './AdvisorIcons'
import ReviewSubmissionForm from './ReviewSubmissionForm'
import Button from './ui/Button'
import PillTag from './ui/PillTag'
import TextInput from './ui/TextInput'

export interface AdvisorMove {
  order: number
  action: string
  why: string
  timeframe: string
  lessonTag: string
}

export interface MarketingAdvisorResult {
  category: MarketingCategory
  userRole: string
  businessStage: string
  primaryChallenge: string
  description: string
  diagnosis: string
  firstThingToFix: string
  moves: AdvisorMove[]
  whatWouldBreak: string
  oneQuestion: string
}

function categoryLabel(category: MarketingCategory): string {
  return CATEGORIES.find((c) => c.id === category)?.label ?? category
}

function AdvisorPdfExportSection({ result }: { result: MarketingAdvisorResult }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isNewSubscriber, setIsNewSubscriber] = useState(true)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/export-advisor-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result, email }),
      })
      if (!res.ok) throw new Error('export failed')
      const data = await res.json()
      setPdfUrl(data.url ?? null)
      setIsNewSubscriber(data.isNewSubscriber ?? true)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-4">
        <p className="text-ink-900 text-sm font-normal mb-3">
          {isNewSubscriber
            ? 'Report sent! Check your inbox, or grab it straight away below.'
            : 'Welcome back. Download your report below.'}
        </p>
        {pdfUrl && (
          <Button href={pdfUrl} target="_blank" rel="noopener noreferrer">
            Download PDF
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="text-center">
      <h3 className="text-lg font-light text-ink-900 mb-2">Get your advisory report as PDF</h3>
      <p className="text-xs text-ink-500 mb-4 max-w-sm mx-auto">
        Enter your email and we&apos;ll send your PDF report straight to your inbox, plus marketing
        insights.
      </p>
      <form onSubmit={handleSubmit} className="max-w-sm mx-auto flex flex-col gap-3">
        <TextInput
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
        />
        <Button type="submit" disabled={status === 'loading'} className="w-full">
          {status === 'loading' ? 'Sending...' : 'Get your advisory report'}
        </Button>
        {status === 'error' && (
          <p className="text-accent-rose text-xs text-center">Something went wrong. Please try again.</p>
        )}
      </form>
    </div>
  )
}

export default function AdvisorResults({ result }: { result: MarketingAdvisorResult }) {
  return (
    <div>
      <div className="text-center mb-8">
        <span className="inline-flex items-center rounded-pill bg-primary px-4 py-1.5 text-xs font-normal text-white mb-3">
          {categoryLabel(result.category)}
        </span>
        <p className="text-sm text-ink-500">
          {result.userRole} &middot; {result.businessStage}
        </p>
      </div>

      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex-shrink-0 w-8 h-8 rounded-pill bg-surface-soft text-ink-700 flex items-center justify-center">
            <IconSearch className="w-4 h-4" />
          </span>
          <h2 className="text-lg font-light text-ink-900">Diagnosis</h2>
        </div>
        <p className="text-ink-700 leading-[1.4]">{result.diagnosis}</p>
      </div>

      <div className="mb-10 border-l-4 border-primary bg-primary-subtle/20 rounded-r-lg p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex-shrink-0 w-8 h-8 rounded-pill bg-primary text-white flex items-center justify-center">
            <IconTarget className="w-4 h-4" />
          </span>
          <h2 className="text-lg font-light text-ink-900">The first thing to fix</h2>
        </div>
        <p className="text-ink-700 leading-[1.4]">{result.firstThingToFix}</p>
      </div>

      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="flex-shrink-0 w-8 h-8 rounded-pill bg-primary text-white flex items-center justify-center">
            <IconChecklist className="w-4 h-4" />
          </span>
          <h2 className="text-lg font-light text-ink-900">Your moves</h2>
        </div>
        <div className="flex flex-col gap-4">
          {result.moves.map((move) => (
            <div key={move.order} className="border border-hairline rounded-lg p-6">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-7 h-7 rounded-pill bg-primary text-white text-sm font-normal flex items-center justify-center">
                  {move.order}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="font-normal text-ink-900">{move.action}</p>
                    <span className="flex-shrink-0 px-3 py-1 bg-surface-soft text-ink-700 text-xs rounded-pill">
                      {move.timeframe}
                    </span>
                  </div>
                  <PillTag className="mb-2">{move.lessonTag}</PillTag>
                  <p className="text-sm text-ink-700 leading-[1.4]">
                    <span className="font-normal text-ink-900">Why: </span>
                    {move.why}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-10 bg-surface-cream border border-hairline rounded-lg p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex-shrink-0 w-8 h-8 rounded-pill bg-accent-ochre text-white flex items-center justify-center">
            <IconAlertTriangle className="w-4 h-4" />
          </span>
          <h2 className="text-lg font-light text-ink-900">What would break this</h2>
        </div>
        <p className="text-ink-700 leading-[1.4]">{result.whatWouldBreak}</p>
      </div>

      <div className="mb-10 text-center px-4">
        <IconQuestion className="w-6 h-6 text-primary mx-auto mb-3" />
        <p className="text-xl font-light italic text-ink-900 leading-[1.4] max-w-xl mx-auto">
          {result.oneQuestion}
        </p>
      </div>

      <div className="border-t border-hairline pt-8 mb-10">
        <AdvisorPdfExportSection result={result} />
      </div>

      <div className="text-center mb-10">
        <Button href="/contact">Want to discuss this with me? Book a session</Button>
      </div>

      <div className="border-t border-hairline pt-8">
        <ReviewSubmissionForm productSlug="marketing-advisor" productName="Marketing Decision Advisor" />
      </div>
    </div>
  )
}
