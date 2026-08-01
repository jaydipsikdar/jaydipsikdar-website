import type { Metadata } from 'next'
import RazorpayBookButton from '@/components/RazorpayBookButton'

export const metadata: Metadata = {
  title: 'Contact - Jaydeepp Sikdar',
  description: 'Book a 60-minute consulting session or get in touch.',
}

export default function ContactPage() {
  return (
    <main className="px-6 py-20 max-w-2xl mx-auto">
      <h1 className="text-[32px] font-light tracking-[-0.64px] leading-[1.1] text-ink-900 mb-6">
        Get in touch
      </h1>
      <p className="text-lg text-ink-700 leading-[1.4] mb-10">
        If you&apos;re a founder with a specific marketing problem, the fastest path is a 60-minute session.
      </p>

      {/* Primary: paid 1:1 booking */}
      <div className="mb-10">
        <h2 className="text-xl font-light text-ink-900 mb-3">Book a 60-minute session, ₹999</h2>
        <p className="text-ink-700 leading-[1.4] mb-4">
          One problem, one clear call. We&apos;ll diagnose and prioritize your most pressing marketing decision.
        </p>
        <RazorpayBookButton className="inline-flex items-center justify-center gap-2 rounded-pill bg-primary px-4 py-2.5 text-[16px] font-normal text-white transition-colors hover:bg-primary-hover">
          Pay ₹999 and book now
        </RazorpayBookButton>
      </div>

    </main>
  )
}
