import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'About — Jaydip Sikdar',
  description:
    'Fractional CMO and B2B marketing leader with 20+ years at IBM, Adobe, and MoEngage. Creator of The Marketing Couch podcast.',
}

export default function AboutPage() {
  return (
    <main className="px-6 py-20 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-10">About</h1>

      <Image
        src="/images/jaydip-sikdar.png"
        alt="Jaydip Sikdar"
        width={200}
        height={200}
        className="rounded-lg mb-10"
        priority
      />

      {/* Long bio — FINAL, locked 2026-06-19, Variation A ~155 words */}
      <div className="prose prose-gray max-w-none space-y-5 text-brand-text text-lg leading-relaxed">
        <p>
          Jaydip Sikdar is a Fractional CMO and B2B marketing leader with over 20 years of experience at companies including IBM and Adobe, and five years in Customer Success at Adobe and MoEngage, where he worked closely with 200+ CMOs to solve their growth, engagement, and retention problems.
        </p>
        <p>
          He helps early-stage startup founders build and run their marketing function from the ground up — from brand positioning and go-to-market strategy to demand generation, marketing operations, and the technology infrastructure that makes it all work. He also hires and grooms marketing talent, giving founders a scalable team alongside a scalable strategy.
        </p>
        <p>
          He is the creator and host of The Marketing Couch podcast and a frequent guest lecturer at leading business schools in India.
        </p>
        <p>
          His focus areas include B2B marketing, SaaS growth, positioning, messaging, and AI-enabled marketing. Outside of work, he reads, plays squash, practices yoga, and rides motorcycles.
        </p>
      </div>

      {/* ============================================================
          SPEAKING / MEDIA / PUBLICATIONS
          TODO: Add once asset checklist is complete
          ============================================================ */}
      <div className="mt-12 border-t border-gray-100 pt-10 text-gray-400 text-sm text-center">
        [ Speaking, media, and publications — placeholder ]
      </div>
    </main>
  )
}
