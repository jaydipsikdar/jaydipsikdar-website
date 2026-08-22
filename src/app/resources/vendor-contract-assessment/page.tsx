import type { Metadata } from 'next'
import { Suspense } from 'react'
import VendorCheckFlow from '@/components/VendorCheckFlow'

export const metadata: Metadata = {
  title: 'Vendor Contract Assessment - Jaydeepp Sikdar',
  description:
    'Paste your lead generation agency contract and get a scored, clause-by-clause fairness assessment before you sign.',
  alternates: {
    canonical: '/resources/vendor-contract-assessment',
  },
}

export default function VendorCheckPage() {
  return (
    <main className="px-6 py-20 max-w-2xl mx-auto">
      <Suspense fallback={null}>
        <VendorCheckFlow />
      </Suspense>
    </main>
  )
}
