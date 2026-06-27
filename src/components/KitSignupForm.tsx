'use client'

import { useState } from 'react'

export default function KitSignupForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) throw new Error('Subscription failed')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <p className="text-brand-text text-sm font-medium">
        Check your inbox. The Kit is on its way.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
        {status === 'loading' ? 'Sending…' : 'Send me the Kit →'}
      </button>
      {status === 'error' && (
        <p className="text-red-600 text-xs">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  )
}
