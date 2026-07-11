'use client'

import { useState } from 'react'

export default function VendorCheckDeliveryForm() {
  const [expanded, setExpanded] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, group: 'vendor-check' }),
      })

      if (!res.ok) throw new Error('Subscription failed')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-4">
        <p className="text-brand-text text-sm font-medium">Check your inbox.</p>
      </div>
    )
  }

  if (!expanded) {
    return (
      <div className="text-center">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="px-6 py-3 bg-brand-accent text-white rounded hover:opacity-90 transition-opacity"
        >
          Want to save this? →
        </button>
        <p className="text-xs text-gray-500 mt-3 max-w-sm mx-auto">
          Drop your email — we&apos;ll send you a link to re-run your check anytime, plus tips on
          contract negotiation.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto flex flex-col gap-3">
      <p className="text-xs text-gray-500 text-center">
        Drop your email — we&apos;ll send you a link to re-run your check anytime, plus tips on
        contract negotiation.
      </p>
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
        {status === 'loading' ? 'Sending…' : 'Save my results →'}
      </button>
      {status === 'error' && (
        <p className="text-red-600 text-xs text-center">Something went wrong. Please try again.</p>
      )}
    </form>
  )
}
