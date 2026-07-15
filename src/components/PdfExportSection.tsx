'use client'

import { useState } from 'react'
import type { VendorCheckResult } from './ResultsReport'

export default function PdfExportSection({
  result,
  processStage,
  emailAlreadyCaptured,
  capturedEmail,
}: {
  result: VendorCheckResult
  processStage?: string
  emailAlreadyCaptured?: boolean
  capturedEmail?: string
}) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function sendReport(targetEmail: string) {
    setStatus('loading')
    try {
      const res = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result, email: targetEmail, processStage }),
      })
      if (!res.ok) throw new Error('export failed')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    sendReport(email)
  }

  // emailAlreadyCaptured is a plain boolean flag from the parent flow; the
  // actual address only travels through capturedEmail. If one is missing,
  // fall back to asking for the email rather than calling the API with ''.
  const hasCapturedEmail = Boolean(emailAlreadyCaptured && capturedEmail)

  if (status === 'success') {
    return (
      <div className="text-center py-4">
        <p className="text-brand-text text-sm font-medium">Report sent! Check your inbox.</p>
      </div>
    )
  }

  if (hasCapturedEmail) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Get your report as PDF</h3>
        <button
          type="button"
          onClick={() => sendReport(capturedEmail as string)}
          disabled={status === 'loading'}
          className="px-6 py-3 bg-brand-accent text-white rounded hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {status === 'loading' ? 'Sending…' : 'Get my report'}
        </button>
        {status === 'error' && (
          <p className="text-red-600 text-xs mt-3">Something went wrong. Please try again.</p>
        )}
      </div>
    )
  }

  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold mb-2">Get your report as PDF</h3>
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
          {status === 'loading' ? 'Sending…' : 'Get my report'}
        </button>
        {status === 'error' && (
          <p className="text-red-600 text-xs text-center">Something went wrong. Please try again.</p>
        )}
      </form>
    </div>
  )
}
