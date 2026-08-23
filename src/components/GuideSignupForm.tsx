'use client'

import { useState } from 'react'
import Button from './ui/Button'
import TextInput from './ui/TextInput'
import type { Guide } from '@/lib/guides'

type Props = {
  group: string
  pdfHref: string
  copy: Guide['form']
}

export default function GuideSignupForm({ group, pdfHref, copy }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [isNewSubscriber, setIsNewSubscriber] = useState(true)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, group }),
      })

      if (!res.ok) throw new Error('Subscription failed')
      const data = await res.json()
      setIsNewSubscriber(data.isNewSubscriber ?? true)
      setStatus('success')
      triggerDownload(pdfHref)
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
          {isNewSubscriber ? copy.successNew : copy.successReturning}
        </p>
        <Button href={pdfHref} target="_blank" rel="noopener noreferrer" className="w-full">
          {copy.downloadLabel}
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
        aria-label="Your email address"
      />
      <Button type="submit" disabled={status === 'loading'} className="w-full">
        {status === 'loading' ? copy.buttonLoading : copy.buttonIdle}
      </Button>
      {status === 'error' && (
        <p className="text-accent-rose text-xs">Something went wrong. Please try again.</p>
      )}
    </form>
  )
}
