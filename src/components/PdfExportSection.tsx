'use client'

import { useState } from 'react'
import type { VendorCheckResult } from './ResultsReport'
import Button from './ui/Button'
import TextInput from './ui/TextInput'

export default function PdfExportSection({
  result,
  processStage,
}: {
  result: VendorCheckResult
  processStage?: string
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

  if (status === 'success') {
    return (
      <div className="text-center py-4">
        <p className="text-ink-900 text-sm font-normal">Report sent! Check your inbox.</p>
      </div>
    )
  }

  return (
    <div className="text-center">
      <h3 className="text-lg font-light text-ink-900 mb-2">Get your report as PDF</h3>
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
          {status === 'loading' ? 'Sending...' : 'Get my report'}
        </Button>
        {status === 'error' && (
          <p className="text-accent-rose text-xs text-center">Something went wrong. Please try again.</p>
        )}
      </form>
    </div>
  )
}
