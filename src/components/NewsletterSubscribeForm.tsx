'use client'

import { useEffect, useState } from 'react'
import Button from './ui/Button'
import TextInput from './ui/TextInput'
import {
  getRememberedEmail,
  rememberEmail,
  rememberNewsletterOptIn,
  hasOptedIntoNewsletter,
} from '@/lib/subscriberMemory'

// The live "The Workbench" signup. Posts to /api/subscribe with
// newsletterOptIn so the person joins the combined newsletter + new-post-alert
// list and gets the welcome email. Returning subscribers see a quiet
// confirmation instead of the form. Rendered in two spots on /newsletter, so
// it takes an id for the in-page anchor.

export default function NewsletterSubscribeForm({ id }: { id: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [alreadyMember, setAlreadyMember] = useState(false)

  useEffect(() => {
    if (hasOptedIntoNewsletter()) {
      setAlreadyMember(true)
      return
    }
    const remembered = getRememberedEmail()
    if (remembered) setEmail(remembered)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'newsletter', newsletterOptIn: true }),
      })
      if (!res.ok) throw new Error('Subscription failed')
      rememberEmail(email)
      rememberNewsletterOptIn()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div
        id={id}
        className="mx-auto max-w-md rounded-xl border border-primary/30 bg-primary-subtle/25 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
          <span className="text-sm font-normal text-ink-900">
            You&apos;re in. The first issue lands in your inbox soon.
          </span>
        </div>
        <p className="mt-2 text-sm font-light leading-relaxed text-ink-500">
          I just sent you a welcome email. If it is not there in a minute, check your
          Promotions tab and spam folder. Hit reply with your question or ask. I read every
          email from my subscribers.
        </p>
      </div>
    )
  }

  if (alreadyMember) {
    return (
      <div
        id={id}
        className="mx-auto inline-flex items-center gap-2.5 rounded-pill border border-primary/30 bg-primary-subtle/25 px-5 py-3"
      >
        <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
        <span className="text-sm font-normal text-ink-900">You&apos;re on the list.</span>
      </div>
    )
  }

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row"
    >
      <TextInput
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        aria-label="Your email address"
        className="flex-1"
      />
      <Button type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
      </Button>
      {status === 'error' && (
        <p className="w-full text-center text-xs text-accent-rose sm:text-left">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  )
}
