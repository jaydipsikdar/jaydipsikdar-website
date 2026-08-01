'use client'

import { useState } from 'react'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'
export const CALENDLY_URL = 'https://calendly.com/jaydipsikdar/book-a-consulting-session'

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT_SRC
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function RazorpayBookButton({
  children,
  className,
  bookingUrl = CALENDLY_URL,
}: {
  children: React.ReactNode
  className?: string
  /** Override the Calendly URL opened after payment, e.g. to attach UTM params for a specific placement. */
  bookingUrl?: string
}) {
  const [loading, setLoading] = useState(false)
  const [paid, setPaid] = useState(false)

  async function handleClick() {
    setLoading(true)
    const loaded = await loadRazorpayScript()
    setLoading(false)

    if (!loaded) {
      alert('Unable to load the payment gateway. Please check your connection and try again.')
      return
    }

    const razorpay = new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: 99900,
      currency: 'INR',
      name: 'Jaydeepp Sikdar',
      description: '1:1 Consulting Session (60 mins)',
      handler: function () {
        window.open(bookingUrl, '_blank', 'noopener,noreferrer')
        setPaid(true)
      },
    })
    razorpay.open()
  }

  if (paid) {
    return (
      <p className="text-sm text-ink-700">
        Payment received! Your booking page opened in a new tab,{' '}
        <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-hover transition-colors">
          click here
        </a>{' '}
        if it didn&apos;t.
      </p>
    )
  }

  return (
    <button type="button" onClick={handleClick} disabled={loading} className={className}>
      {loading ? 'Loading…' : children}
    </button>
  )
}
