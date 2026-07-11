import type { Metadata } from 'next'
import KitSignupForm from '@/components/KitSignupForm'

export const metadata: Metadata = {
  title: 'Resources — Jaydip Sikdar',
  description:
    'Marketing tools and frameworks built for anyone who needs to think like a CMO. Free to download.',
}

export default function ResourcesPage() {
  return (
    <main className="px-6 py-20 max-w-5xl mx-auto">

      <h1 className="text-3xl font-bold text-center mb-4">Resources</h1>
      <p className="text-center text-brand-text mb-12 max-w-lg mx-auto">
        Most marketing tools are built for marketers. These are built for anyone who needs to
        think like one.
      </p>

      {/* Card grid — two columns, proportional sizing, same visual treatment as before. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 items-stretch">

        {/* CMO Boardroom Kit */}
        <div className="border border-gray-200 rounded-lg p-8 flex flex-col">
          <div className="grid grid-cols-1 gap-6 flex-1">
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
            <div className="flex flex-col justify-end">
              <KitSignupForm />
            </div>
          </div>
        </div>

        {/* Vendor Contract Check */}
        <div className="border border-gray-200 rounded-lg p-8 flex flex-col">
          <div className="grid grid-cols-1 gap-6 flex-1">
            <div>
              <h2 className="text-lg font-semibold mb-3">Vendor Contract Check</h2>
              <p className="text-brand-text text-sm leading-relaxed mb-4">
                I paid three months of retainer to a lead gen agency that delivered nothing —
                because I didn&apos;t catch what their contract let them get away with. This tool
                reads your vendor contract the way I wish I&apos;d read mine.
              </p>
            </div>
            <div className="flex flex-col justify-end">
              <a
                href="/resources/vendor-check"
                className="w-full text-center px-4 py-2.5 bg-brand-accent text-white text-sm font-medium rounded hover:opacity-90 transition-opacity"
              >
                Check your contract →
              </a>
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
