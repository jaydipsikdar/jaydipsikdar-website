'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import TextInput from '@/components/ui/TextInput'
import {
  getRememberedEmail,
  rememberEmail,
  rememberNewsletterOptIn,
  hasOptedIntoNewsletter,
} from '@/lib/subscriberMemory'

// The inline newsletter opt-in. Dropped mid-article (via <NewsletterPromo /> in
// MDX) and reusable elsewhere. Posts to /api/subscribe with newsletterOptIn so
// the person lands on the combined newsletter + new-post-alert list. Returning
// visitors who've already opted in see a quiet "you're on the list" state
// instead of the form.

type Props = {
  heading?: string
  subcopy?: string
  source?: string
}

export default function NewsletterPromo({
  heading = 'Get the next one in your inbox',
  subcopy = 'Occasional writing on GTM strategy, marketing, and building AI tools that solve real problems. No fluff, unsubscribe anytime.',
  source = 'writing-inline',
}: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [alreadyMember, setAlreadyMember] = useState(false)

  // Recognise a returning subscriber on mount (client-only).
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
        body: JSON.stringify({ email, source, newsletterOptIn: true }),
      })
      if (!res.ok) throw new Error('Subscription failed')
      rememberEmail(email)
      rememberNewsletterOptIn()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <aside className="my-12 rounded-lg border border-hairline bg-surface-soft p-6 sm:p-8 not-prose">
      {alreadyMember || status === 'success' ? (
        <div>
          <p className="text-lg font-light text-ink-900 mb-1">
            {status === 'success' ? "You're in. Thank you." : "You're on the list."}
          </p>
          <p className="text-sm text-ink-700 leading-[1.5]">
            {status === 'success'
              ? 'Watch your inbox for the next piece. In the meantime, the archive is all here.'
              : 'The next piece will land in your inbox. Thanks for reading.'}
          </p>
        </div>
      ) : (
        <div>
          <p className="text-lg font-light text-ink-900 mb-1">{heading}</p>
          <p className="text-sm text-ink-700 leading-[1.5] mb-4">{subcopy}</p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
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
          </form>
          {status === 'error' && (
            <p className="text-accent-rose text-xs mt-2">Something went wrong. Please try again.</p>
          )}
        </div>
      )}
    </aside>
  )
}
