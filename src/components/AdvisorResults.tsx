'use client'

import { useState } from 'react'
import { CATEGORIES, type MarketingCategory } from './CategorySelect'
import { IconSearch, IconTarget, IconChecklist, IconAlertTriangle, IconQuestion } from './AdvisorIcons'

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
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-4">
        <p className="text-brand-text text-sm font-medium">Report sent! Check your inbox.</p>
      </div>
    )
  }

  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold mb-2">Get your advisory report as PDF</h3>
      <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
        Enter your email and we&apos;ll send your PDF report straight to your inbox, plus marketing
        insights.
      </p>
      <form onSubmit={handleSubmit} className="max-w-sm mx-auto flex flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="w-full px-4 py-2.5 border border-gray-300 rounded text-sm text-brand-text bg-white placeholder-gray-400 focus:outline-none focus:border-brand-accent transition-colors"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full px-4 py-2.5 bg-brand-accent text-white text-sm font-medium rounded hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {status === 'loading' ? 'Sending…' : 'Get your advisory report →'}
        </button>
        {status === 'error' && (
          <p className="text-red-600 text-xs text-center">Something went wrong. Please try again.</p>
        )}
      </form>
    </div>
  )
}

export default function AdvisorResults({ result }: { result: MarketingAdvisorResult }) {
  return (
    <div>
      <div className="text-center mb-8">
        <span className="inline-block px-4 py-1.5 bg-brand-accent text-white text-xs font-semibold rounded-full mb-3">
          {categoryLabel(result.category)}
        </span>
        <p className="text-sm text-gray-500">
          {result.userRole} · {result.businessStage}
        </p>
      </div>

      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
            <IconSearch className="w-4 h-4" />
          </span>
          <h2 className="text-lg font-semibold">Diagnosis</h2>
        </div>
        <p className="text-brand-text leading-relaxed">{result.diagnosis}</p>
      </div>

      <div className="mb-10 border-l-4 border-brand-accent bg-brand-accent/5 rounded-r-lg p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-accent text-white flex items-center justify-center">
            <IconTarget className="w-4 h-4" />
          </span>
          <h2 className="text-lg font-semibold">The First Thing to Fix</h2>
        </div>
        <p className="text-brand-text leading-relaxed">{result.firstThingToFix}</p>
      </div>

      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-accent text-white flex items-center justify-center">
            <IconChecklist className="w-4 h-4" />
          </span>
          <h2 className="text-lg font-semibold">Your Moves</h2>
        </div>
        <div className="flex flex-col gap-4">
          {result.moves.map((move) => (
            <div key={move.order} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-accent text-white text-sm font-semibold flex items-center justify-center">
                  {move.order}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="font-semibold text-brand-text">{move.action}</p>
                    <span className="flex-shrink-0 px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {move.timeframe}
                    </span>
                  </div>
                  <span className="inline-block px-2.5 py-0.5 bg-brand-accent/10 text-brand-accent text-xs font-medium rounded-full mb-2">
                    {move.lessonTag}
                  </span>
                  <p className="text-sm text-brand-text leading-relaxed">
                    <span className="font-medium">Why: </span>
                    {move.why}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-10 bg-amber-50 border border-amber-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-400 text-white flex items-center justify-center">
            <IconAlertTriangle className="w-4 h-4" />
          </span>
          <h2 className="text-lg font-semibold">What Would Break This</h2>
        </div>
        <p className="text-brand-text leading-relaxed">{result.whatWouldBreak}</p>
      </div>

      <div className="mb-10 text-center px-4">
        <IconQuestion className="w-6 h-6 text-brand-accent mx-auto mb-3" />
        <p className="text-xl font-semibold italic text-brand-text leading-relaxed max-w-xl mx-auto">
          {result.oneQuestion}
        </p>
      </div>

      <div className="border-t border-gray-200 pt-8 mb-10">
        <AdvisorPdfExportSection result={result} />
      </div>

      <div className="text-center">
        <a
          href="/contact"
          className="inline-block px-6 py-3 bg-brand-accent text-white rounded hover:opacity-90 transition-opacity"
        >
          Want to discuss this with me? Book a session →
        </a>
      </div>
    </div>
  )
}
