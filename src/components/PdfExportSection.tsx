'use client'

import { useState } from 'react'
import { generateVendorCheckPDF } from '@/lib/generateVendorCheckPDF'
import type { VendorCheckResult } from './ResultsReport'

export default function PdfExportSection({
  result,
  processStage,
  emailAlreadyCaptured,
}: {
  result: VendorCheckResult
  processStage?: string
  emailAlreadyCaptured?: boolean
}) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, group: 'vendor-check' }),
      })
    } catch {
      // Non-blocking — the PDF is generated client-side and shouldn't be
      // held hostage by a MailerLite hiccup.
    }

    generateVendorCheckPDF(result, processStage)
    setStatus('success')
  }

  function handleDirectDownload() {
    generateVendorCheckPDF(result, processStage)
  }

  if (status === 'success') {
    return (
      <div className="text-center py-4">
        <p className="text-brand-text text-sm font-medium">
          PDF downloaded! Check your downloads folder.
        </p>
      </div>
    )
  }

  if (emailAlreadyCaptured) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Get your report as PDF</h3>
        <button
          type="button"
          onClick={handleDirectDownload}
          className="px-6 py-3 bg-brand-accent text-white rounded hover:opacity-90 transition-opacity"
        >
          Download PDF
        </button>
      </div>
    )
  }

  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold mb-2">Get your report as PDF</h3>
      <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
        Enter your email and we&apos;ll send you marketing insights. Your PDF downloads instantly.
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
          {status === 'loading' ? 'Preparing…' : 'Download PDF'}
        </button>
      </form>
    </div>
  )
}
