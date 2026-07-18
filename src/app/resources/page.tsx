import type { Metadata } from 'next'
import KitSignupForm from '@/components/KitSignupForm'

export const metadata: Metadata = {
  title: 'Free Marketing Tools & Frameworks | Jaydip Sikdar',
  description:
    'Free AI-powered marketing tools — get tailored advice on positioning, brand, growth, AI strategy, and launches. Plus a vendor contract risk scorer and the CMO Boardroom Kit. Built from 20 years of marketing experience.',
  openGraph: {
    title: 'Free Marketing Tools & Frameworks | Jaydip Sikdar',
    description:
      'Free AI-powered marketing tools — get tailored advice on positioning, brand, growth, AI strategy, and launches. Plus a vendor contract risk scorer and the CMO Boardroom Kit. Built from 20 years of marketing experience.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Marketing Tools & Frameworks | Jaydip Sikdar',
    description:
      'Free AI-powered marketing tools — get tailored advice on positioning, brand, growth, AI strategy, and launches. Plus a vendor contract risk scorer and the CMO Boardroom Kit. Built from 20 years of marketing experience.',
  },
}

export default function ResourcesPage() {
  return (
    <main className="px-6 py-20 max-w-5xl mx-auto">

      <h1 className="text-3xl font-bold text-center mb-4">Resources</h1>
      <p className="text-center text-brand-text mb-12 max-w-lg mx-auto">
        Free tools and frameworks from 20 years of solving marketing problems at IBM, Adobe,
        MoEngage, and two AI startups.
      </p>

      {/* Row 1 — Marketing Decision Advisor + Vendor Contract Check */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 items-stretch">

        {/* Marketing Decision Advisor */}
        <div className="border border-gray-200 rounded-lg p-8 flex flex-col">
          <div className="grid grid-cols-1 gap-6 flex-1">
            <div>
              <h2 className="text-lg font-semibold mb-3">Marketing Decision Advisor</h2>
              <p className="text-brand-text text-sm leading-relaxed mb-4">
                Pick a marketing challenge — positioning, brand, growth, AI strategy, or launch —
                answer a few questions about your situation, and get a tailored advisory report in
                2 minutes.
              </p>
              <p className="text-brand-text text-sm leading-relaxed">
                Every recommendation is grounded in 213 operator-level lessons from 21 senior
                marketing leaders interviewed on The Marketing Couch podcast. Specific to your
                situation, not generic advice. Free.
              </p>
            </div>
            <div className="flex flex-col justify-end">
              <a
                href="/resources/marketing-advisor"
                className="w-full text-center px-4 py-2.5 bg-brand-accent text-white text-sm font-medium rounded hover:opacity-90 transition-opacity"
              >
                Get your advice →
              </a>
            </div>
          </div>
        </div>

        {/* Vendor Contract Check */}
        <div className="border border-gray-200 rounded-lg p-8 flex flex-col">
          <div className="grid grid-cols-1 gap-6 flex-1">
            <div>
              <h2 className="text-lg font-semibold mb-3">Vendor Contract Check</h2>
              <p className="text-brand-text text-sm leading-relaxed mb-3">
                Most vendor contracts are written to protect the vendor. This tool reads yours and
                tells you where.
              </p>
              <p className="text-brand-text text-sm leading-relaxed mb-3">
                Paste or upload your contract — the AI scores it across scope, targets, data
                rights, exit terms, and payment structure, flags the clauses that put you at risk,
                and gives you specific renegotiation language. Takes 2 minutes. Free.
              </p>
              <p className="text-xs text-gray-500 italic">
                Based on a real engagement where a three-month retainer delivered nothing — and
                the contract was designed to make that acceptable.
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

      {/* Row 2 — CMO Boardroom Kit, full width */}
      <div className="grid grid-cols-1 gap-8">
        <div className="border border-gray-200 rounded-lg p-8 flex flex-col md:flex-row md:items-center gap-8">
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-3">CMO Boardroom Kit</h2>
            <p className="text-brand-text text-sm leading-relaxed mb-3">
              Eight AI-powered marketing advisors you can run in ChatGPT, Claude, or Gemini — each
              with a distinct perspective on positioning, demand gen, brand, customer growth,
              revenue, org design, and AI strategy. Built from 21 long-form interviews with senior
              marketing operators.
            </p>
            <p className="text-brand-text text-sm leading-relaxed mb-3">
              Includes the full boardroom prompt (bring a decision, they debate it), eight
              single-advisor prompts for quick opinions, and the complete lessons playbook — 213
              distilled principles in plain language.
            </p>
            <p className="text-brand-text text-sm font-medium">
              Free PDF. Works in any AI chat tool.
            </p>
          </div>
          <div className="w-full md:w-72 flex-shrink-0">
            <KitSignupForm />
          </div>
        </div>
      </div>

    </main>
  )
}
