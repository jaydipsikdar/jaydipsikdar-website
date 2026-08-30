'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import TextInput from '@/components/ui/TextInput'
import NewsletterConfirmation from '@/components/NewsletterConfirmation'
import {
  getRememberedEmail,
  rememberEmail,
  rememberNewsletterOptIn,
  hasOptedIntoNewsletter,
} from '@/lib/subscriberMemory'

// The newsletter opt-in used across the Writing section. Posts to
// /api/subscribe with newsletterOptIn so the person lands on the combined
// newsletter + new-post-alert list. Returning visitors who've already opted in
// see the quiet "you're on the list" state instead of the form.
//
// - variant "inline"  (default): the padded card dropped mid-article via MDX
//   and used as a full-width block on the writing index.
// - variant "compact": a slim, CTA-tinted card sized for the article sidebar
//   (stacked field + button, tighter spacing).

type Props = {
  heading?: string
  subcopy?: string
  source?: string
  variant?: 'inline' | 'compact'
}

export default function NewsletterPromo({
  heading = 'Get the next one in your inbox',
  subcopy = 'Occasional writing on GTM strategy, marketing, and building AI tools that solve real problems. No fluff, unsubscribe anytime.',
  source = 'writing-inline',
  variant = 'inline',
}: Props) {
  const isCompact = variant === 'compact'
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

  if (alreadyMember || status === 'success') {
    return (
      <NewsletterConfirmation
        state={status === 'success' ? 'success' : 'returning'}
        compact={isCompact}
        className={isCompact ? 'not-prose' : 'my-12 not-prose'}
      />
    )
  }

  return (
    <aside
      className={
        isCompact
          ? 'rounded-lg border border-primary/30 bg-primary-subtle/25 p-5 not-prose'
          : 'my-12 rounded-lg border border-hairline bg-surface-soft p-6 sm:p-8 not-prose'
      }
    >
      <p className={isCompact ? 'mb-1 text-base font-normal text-ink-900' : 'mb-1 text-lg font-light text-ink-900'}>
        {heading}
      </p>
      <p className={`text-sm text-ink-700 leading-[1.5] ${isCompact ? 'mb-3' : 'mb-4'}`}>{subcopy}</p>
      <form onSubmit={handleSubmit} className={isCompact ? 'flex flex-col gap-2' : 'flex flex-col sm:flex-row gap-3'}>
        <TextInput
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          aria-label="Your email address"
          className="flex-1"
        />
        <Button type="submit" disabled={status === 'loading'} className={isCompact ? 'w-full' : undefined}>
          {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
        </Button>
      </form>
      {status === 'error' && (
        <p className="text-accent-rose text-xs mt-2">Something went wrong. Please try again.</p>
      )}
    </aside>
  )
}
