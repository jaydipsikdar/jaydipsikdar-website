import type { Metadata } from 'next'
import { Suspense } from 'react'
import MaturityScoreFlow from '@/components/MaturityScoreFlow'

export const metadata: Metadata = {
  title: 'Marketing Maturity Score - Jaydip Sikdar',
  description:
    'A free diagnostic that scores your marketing maturity across 6 dimensions: positioning, demand generation, content, ops, measurement, and team. Get a radar chart, your top priority gaps, and a full report.',
}

export default function MarketingMaturityScorePage() {
  return (
    <main className="px-6 py-20 max-w-2xl mx-auto bg-white">
      <Suspense fallback={null}>
        <MaturityScoreFlow />
      </Suspense>
    </main>
  )
}
