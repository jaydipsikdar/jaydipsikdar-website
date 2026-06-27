import type { Metadata } from 'next'
import KitSignupForm from '@/components/KitSignupForm'

export const metadata: Metadata = {
  title: 'Resources — Jaydip Sikdar',
  description:
    'Marketing tools and frameworks built for anyone who needs to think like a CMO. Free to download.',
}

export default function ResourcesPage() {
  return (
    <main className="px-6 py-20 max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold text-center mb-4">Resources</h1>
      <p className="text-center text-brand-text mb-12 max-w-lg mx-auto">
        Most marketing tools are built for marketers. These are built for anyone who needs to
        think like one.
      </p>

      {/* Card grid — built to scale to 3 columns. Single card for v1. */}
      <div className="flex justify-center mb-8">
        <div className="border border-gray-200 rounded-lg p-8 w-full max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

            {/* Left — title, description, value prop */}
            <div>
              <h2 className="text-lg font-semibold mb-3">CMO Boardroom Kit</h2>
              <p className="text-brand-text text-sm leading-relaxed mb-4">
                A practical kit for founders who need to evaluate marketing strategy, challenge
                assumptions, and make better decisions — without a full-time CMO on payroll.
              </p>
              <p className="text-brand-text text-sm font-medium">
                21 CMO conversations distilled into one decision framework. Free.
              </p>
            </div>

            {/* Right — custom signup form */}
            <div className="flex flex-col justify-center">
              <KitSignupForm />
            </div>

          </div>
        </div>
      </div>

      <p className="text-center text-sm text-brand-text italic">
        New tools dropping in July 2026 — get on the list above to hear first.
      </p>

    </main>
  )
}
