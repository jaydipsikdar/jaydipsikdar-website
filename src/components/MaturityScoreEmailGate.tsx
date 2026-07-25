'use client'

import { useState } from 'react'

interface MaturityScoreEmailGateProps {
  onSubmit: (email: string) => Promise<{ ok: boolean }>
}

export default function MaturityScoreEmailGate({ onSubmit }: MaturityScoreEmailGateProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    const result = await onSubmit(email)
    setStatus(result.ok ? 'success' : 'error')
  }

  if (status === 'success') {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--border-hairline)] bg-[color:var(--surface-cream)] p-8 text-center">
        <p className="text-[15px] font-normal font-sans text-[color:var(--text-body)]">
          Your full report is on its way. Check your inbox.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border-hairline)] bg-[color:var(--surface-soft)] p-8">
      <h3 className="text-[20px] font-light font-sans tracking-[-0.2px] leading-[1.4] text-[color:var(--text-body)] mb-2 text-center">
        Get your full diagnostic report
      </h3>
      <p className="text-[13px] font-normal font-sans text-[color:var(--text-muted)] mb-6 text-center max-w-sm mx-auto">
        Per-dimension breakdowns, tailored recommendations, stage benchmarks, and your next 90 days, delivered as a PDF.
      </p>
      <form onSubmit={handleSubmit} className="max-w-sm mx-auto flex flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[color:var(--border-input)] text-[15px] font-light font-sans text-[color:var(--text-body)] bg-white placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-[3px] focus:ring-[color:var(--color-primary-subtle)] transition-colors"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2 rounded-[var(--radius-pill)] bg-[color:var(--color-primary)] text-white text-[16px] font-normal font-sans hover:bg-[color:var(--color-primary-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Sending...' : 'Send my report'}
        </button>
        {status === 'error' && (
          <p className="text-[13px] font-normal font-sans text-[color:var(--accent-rose)] text-center">
            That didn&apos;t send. Check your connection and try again.
          </p>
        )}
      </form>
    </div>
  )
}
