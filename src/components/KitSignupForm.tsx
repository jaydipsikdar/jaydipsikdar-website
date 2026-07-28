'use client'

import { useState } from 'react'
import Button from './ui/Button'
import TextInput from './ui/TextInput'

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
        body: JSON.stringify({ email, group: 'kit' }),
      })

      if (!res.ok) throw new Error('Subscription failed')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div>
        <p className="text-ink-900 text-sm font-normal mb-3">
          Check your inbox. The kit is on its way, or download it now below.
        </p>
        <Button href="/downloads/cmo-boardroom-kit.pdf" target="_blank" rel="noopener noreferrer" className="w-full">
          Download the kit
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <TextInput
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
      />
      <Button type="submit" disabled={status === 'loading'} className="w-full">
        {status === 'loading' ? 'Sending...' : 'Send me the kit'}
      </Button>
      {status === 'error' && (
        <p className="text-accent-rose text-xs">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  )
}
