import type { Metadata } from 'next'
import KitSignupForm from '@/components/KitSignupForm'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

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

      <h1 className="text-[32px] font-light tracking-[-0.64px] leading-[1.1] text-ink-900 text-center mb-4">
        Resources
      </h1>
      <p className="text-center text-ink-700 mb-12 max-w-lg mx-auto">
        Free tools and frameworks from 20 years of solving marketing problems at IBM, Adobe,
        MoEngage, and two AI startups.
      </p>

      {/* Row 1 — Marketing Maturity Score + Marketing Decision Advisor + Vendor Contract Check */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 items-stretch">

        {/* Marketing Maturity Score */}
        <Card className="flex flex-col">
          <div className="grid grid-cols-1 gap-6 flex-1">
            <div>
              <h2 className="text-lg font-light text-ink-900 mb-3">Marketing Maturity Score</h2>
              <p className="text-ink-700 text-sm leading-[1.4] mb-4">
                Answer 25 questions across 6 dimensions and see exactly where your marketing
                function is strong, and where it is running on instinct instead of a system.
              </p>
              <p className="text-ink-700 text-sm leading-[1.4]">
                Get a maturity score, a radar chart, and your top priority gaps immediately. The
                full report adds tailored recommendations, stage benchmarks, and your next 90
                days. Free.
              </p>
            </div>
            <div className="flex flex-col justify-end">
              <Button href="/resources/marketing-maturity-score" className="w-full">
                Get your score
              </Button>
            </div>
          </div>
        </Card>

        {/* Marketing Decision Advisor */}
        <Card className="flex flex-col">
          <div className="grid grid-cols-1 gap-6 flex-1">
            <div>
              <h2 className="text-lg font-light text-ink-900 mb-3">Marketing Decision Advisor</h2>
              <p className="text-ink-700 text-sm leading-[1.4] mb-4">
                Pick a marketing challenge (positioning, brand, growth, AI strategy, or launch),
                answer a few questions about your situation, and get a tailored advisory report in
                2 minutes.
              </p>
              <p className="text-ink-700 text-sm leading-[1.4]">
                Every recommendation is grounded in 213 operator-level lessons from 21 senior
                marketing leaders interviewed on The Marketing Couch podcast. Specific to your
                situation, not generic advice. Free.
              </p>
            </div>
            <div className="flex flex-col justify-end">
              <Button href="/resources/marketing-advisor" className="w-full">
                Get your advice
              </Button>
            </div>
          </div>
        </Card>

        {/* Vendor Contract Check */}
        <Card className="flex flex-col">
          <div className="grid grid-cols-1 gap-6 flex-1">
            <div>
              <h2 className="text-lg font-light text-ink-900 mb-3">Vendor Contract Check</h2>
              <p className="text-ink-700 text-sm leading-[1.4] mb-3">
                Most vendor contracts are written to protect the vendor. This tool reads yours and
                tells you where.
              </p>
              <p className="text-ink-700 text-sm leading-[1.4] mb-3">
                Paste or upload your contract. The AI scores it across scope, targets, data
                rights, exit terms, and payment structure, flags the clauses that put you at risk,
                and gives you specific renegotiation language. Takes 2 minutes. Free.
              </p>
              <p className="text-xs text-ink-500 italic">
                Based on a real engagement where a three-month retainer delivered nothing, and
                the contract was designed to make that acceptable.
              </p>
            </div>
            <div className="flex flex-col justify-end">
              <Button href="/resources/vendor-check" className="w-full">
                Check your contract
              </Button>
            </div>
          </div>
        </Card>

      </div>

      {/* Row 2 — Jaydip's Content Office, full width */}
      <div className="grid grid-cols-1 gap-8 mb-8">
        <Card className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="flex-1">
            <h2 className="text-lg font-light text-ink-900 mb-3">Jaydip&apos;s Content Office</h2>
            <p className="text-ink-700 text-sm leading-[1.4] mb-3">
              Answer 5 questions about your business, audience, and pillars, and get a content
              matrix: your topics crossed with 10 proven content themes, each idea assigned a
              structure and mapped to your channels with specific format guidance.
            </p>
            <p className="text-ink-700 text-sm leading-[1.4] mb-3">
              30 content ideas from a 2-minute input, plus a starter sequence, a gap analysis, and
              a content rhythm plan in the full report. Free.
            </p>
          </div>
          <div className="w-full md:w-auto flex-shrink-0">
            <Button href="/resources/content-office" className="w-full">
              Build your system
            </Button>
          </div>
        </Card>
      </div>

      {/* Row 3 — CMO Boardroom Kit, full width */}
      <div className="grid grid-cols-1 gap-8">
        <Card tone="cream" className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="flex-1">
            <h2 className="text-lg font-light text-ink-900 mb-3">CMO Boardroom Kit</h2>
            <p className="text-ink-700 text-sm leading-[1.4] mb-3">
              Making a big marketing call and want a second opinion? This kit gives you 213
              distilled lessons from 21 senior marketing leaders, plus eight AI-powered advisor
              prompts you can run in ChatGPT, Claude, or Gemini to pressure-test your thinking.
            </p>
            <p className="text-ink-700 text-sm leading-[1.4] mb-3">
              Includes the full boardroom prompt (bring a decision, they debate it), individual
              advisor prompts for quick opinions, and the complete lessons playbook in plain
              language.
            </p>
            <p className="text-ink-700 text-sm font-normal">
              Free PDF. Works in any AI chat tool.
            </p>
          </div>
          <div className="w-full md:w-72 flex-shrink-0">
            <KitSignupForm />
          </div>
        </Card>
      </div>

    </main>
  )
}
