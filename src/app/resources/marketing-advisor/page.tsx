import type { Metadata } from 'next'
import { Suspense } from 'react'
import MarketingAdvisorFlow from '@/components/MarketingAdvisorFlow'

export const metadata: Metadata = {
  title: 'Marketing Decision Advisor - Free AI-powered marketing advice | Jaydeepp Sikdar',
  description:
    'Get specific, actionable marketing advice in 2 minutes. Pick your challenge (positioning, brand, growth, AI, or launch), answer a few questions, and get a tailored advisory report built from 213 operator-level lessons.',
  alternates: {
    canonical: '/resources/marketing-advisor',
  },
}

export default function MarketingAdvisorPage() {
  return (
    <main className="px-6 py-20 max-w-2xl mx-auto">
      <Suspense fallback={null}>
        <MarketingAdvisorFlow />
      </Suspense>
    </main>
  )
}
