import type { Metadata } from 'next'
import { Suspense } from 'react'
import VendorCheckFlow from '@/components/VendorCheckFlow'

export const metadata: Metadata = {
  title: 'Vendor Contract Check — Jaydip Sikdar',
  description:
    'Paste your lead generation agency contract and get a scored, clause-by-clause fairness assessment before you sign.',
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
