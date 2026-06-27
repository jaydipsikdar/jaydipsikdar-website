import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact — Jaydip Sikdar',
  description: 'Book a 30-minute consulting session or get in touch.',
}

export default function ContactPage() {
  return (
    <main className="px-6 py-20 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Get in touch</h1>
      <p className="text-lg text-brand-text mb-10">
        If you&apos;re a founder with a specific marketing problem, the fastest path is a 30-minute session.
      </p>

      {/* Primary: paid 1:1 booking */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Book a 30-minute session — ₹999</h2>
        <p className="text-brand-text mb-4">
          One problem, one clear call. We&apos;ll diagnose and prioritise your most pressing marketing decision.
        </p>
        <a
          href="https://calendar.app.google/8YgUfWjgYcJu9af99"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 bg-brand-accent text-white rounded hover:opacity-90 transition-opacity"
        >
          Book now →
        </a>
      </div>

      {/* ============================================================
          CONTACT FORM (optional)
          TODO: Decide whether to add a simple contact form for non-booking
          enquiries. If yes, a serverless function (Vercel) or a third-party
          form service (e.g., Formspree) can handle the submission.
          ============================================================ */}
      <div className="border-t border-gray-100 pt-10 text-gray-400 text-sm text-center">
        [ Optional contact form — placeholder ]
      </div>
    </main>
  )
}
