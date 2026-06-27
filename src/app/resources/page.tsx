import type { Metadata } from 'next'
import MailerLiteForm from '@/components/MailerLiteForm'

export const metadata: Metadata = {
  title: 'Resources — Jaydip Sikdar',
  description:
    'Marketing tools and frameworks built for anyone who needs to think like a CMO. Free to download.',
}

export default function ResourcesPage() {
  return (
    <main className="px-6 py-20 max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold text-center mb-4">Resources</h1>
      <p className="text-center text-brand-text mb-12">
        Most marketing tools are built for marketers. These are built for anyone who needs to
        think like one.
      </p>

      {/* Card grid — built to scale to 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 justify-items-center mb-8">
        <div className="border border-gray-200 rounded-lg p-6 w-full max-w-sm">
          <h2 className="text-base font-semibold mb-3">CMO Boardroom Kit</h2>
          <p className="text-brand-text text-sm leading-relaxed mb-6">
            A practical kit for founders who need to evaluate marketing strategy, challenge
            assumptions, and make better decisions — without a full-time CMO on payroll.
          </p>
          <div className="text-center">
            <p className="text-sm text-brand-text mb-4">
              Enter your email to get instant access:
            </p>
          </div>
          <MailerLiteForm />
        </div>
      </div>

      <p className="text-center text-sm text-brand-text italic">
        New tools dropping in July 2026 — get on the list above to hear first.
      </p>

    </main>
  )
}
