'use client'

import { useEffect, useState } from 'react'
import Button from './ui/Button'
import TextInput from './ui/TextInput'
import { getRememberedEmail, rememberEmail } from '@/lib/subscriberMemory'

const KIT_PDF = '/downloads/cmo-boardroom-kit.pdf'

export default function KitSignupForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [isNewSubscriber, setIsNewSubscriber] = useState(true)

  // Prefill a returning visitor's email so they can grab it again in one click.
  useEffect(() => {
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
        body: JSON.stringify({ email, source: 'kit' }),
      })

      if (!res.ok) throw new Error('Subscription failed')
      const data = await res.json()
      rememberEmail(email)
      setIsNewSubscriber(data.isNewSubscriber ?? true)
      setStatus('success')
      triggerDownload(KIT_PDF)
    } catch {
      setStatus('error')
    }
  }

  function triggerDownload(href: string) {
    const link = document.createElement('a')
    link.href = href
    link.setAttribute('download', '')
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  if (status === 'success') {
    return (
      <div>
        <p className="text-ink-900 text-sm font-normal mb-3">
          {isNewSubscriber
            ? 'Your kit is downloading. If it does not start, use the button below.'
            : 'Welcome back. Your kit is downloading, or use the button below.'}
        </p>
        <Button href={KIT_PDF} target="_blank" rel="noopener noreferrer" className="w-full">
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
        {status === 'loading' ? 'Preparing your kit…' : 'Download the kit'}
      </Button>
      {status === 'error' && (
        <p className="text-accent-rose text-xs">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  )
}
