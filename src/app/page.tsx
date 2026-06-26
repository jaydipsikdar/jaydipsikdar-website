export default function HomePage() {
  return (
    <main>
      {/* ============================================================
          HERO SECTION
          Copy: FINAL — locked 2026-06-19
          MailerLite form to be wired in here (email capture + PDF delivery)
          ============================================================ */}
      <section id="hero" className="px-6 py-20 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold leading-tight mb-6">
          Bad marketing doesn&apos;t just waste money. It hands your market to someone else.
        </h1>
        <p className="text-xl text-gray-700 mb-6">
          Every month without a working marketing engine is a month of runway you&apos;re not getting back — and a month your competitor is using to pull ahead.
        </p>
        <p className="text-lg text-gray-600 mb-8">
          I help early-stage startup founders build that engine — from positioning and go-to-market to demand generation and customer advocacy. I&apos;ve worked closely with 200+ CMOs to solve exactly these problems. I know what breaks and I know what works.
        </p>

        {/* TODO: Replace this placeholder with the MailerLite embed form.
            Form must: capture email, tag subscriber, trigger PDF auto-delivery of CMO Boardroom Kit.
            MailerLite embed code goes here. */}
        <div className="border-2 border-dashed border-gray-300 rounded p-6 mb-4 text-center text-gray-400">
          [ MailerLite email capture form — CMO Boardroom Kit ]
          <br />
          <span className="text-sm">Primary CTA: &ldquo;Start with the CMO Boardroom Kit — free →&rdquo;</span>
        </div>

        {/* Secondary CTA */}
        <p className="text-sm text-gray-500 text-center">
          Just want the insight in your inbox?{' '}
          {/* TODO: Wire to MailerLite newsletter list signup */}
          <a href="#" className="underline hover:text-gray-700">
            Join the list →
          </a>
        </p>
      </section>

      {/* ============================================================
          CREDIBILITY STRIP
          TODO: Add client logos (once cleared for use) + key stats
          e.g. "20+ years · 200+ CMOs advised · IBM · Adobe · MoEngage"
          ============================================================ */}
      <section id="credibility" className="border-t border-b border-gray-100 py-8 px-6">
        <div className="max-w-3xl mx-auto text-center text-gray-400 text-sm">
          [ Credibility strip — logos + stats — placeholder ]
        </div>
      </section>

      {/* ============================================================
          BRIDGE SECTION — Variation B (audience-split)
          Copy: FINAL — locked 2026-06-19
          ============================================================ */}
      <section id="bridge" className="px-6 py-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Ready to go deeper?</h2>
        <div className="space-y-4 text-gray-700">
          <p>
            <strong>Founders</strong> — if the Kit raised more questions than it answered, that&apos;s the point. Book 30 minutes and we&apos;ll work through your specific situation.
          </p>
          <p>
            <strong>Everyone else</strong> — keep learning. More tools and breakdowns are coming.
          </p>
        </div>
        <a
          href="https://calendar.app.google/8YgUfWjgYcJu9af99"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-8 px-6 py-3 bg-gray-900 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Book 30 minutes — ₹999 →
        </a>
      </section>

      {/* ============================================================
          CASE STUDIES
          TODO: Draft copy for both mini-blocks:
            1. Prescience Decision Solutions (positioning/GTM → acquisition)
            2. RFID/IoT startup ($25M revenue milestone)
          ============================================================ */}
      <section id="case-studies" className="bg-gray-50 px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-8">Work that moved the needle</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="border border-dashed border-gray-300 rounded p-6 text-gray-400 text-sm text-center">
              [ Case study 1 — Prescience Decision Solutions ]
            </div>
            <div className="border border-dashed border-gray-300 rounded p-6 text-gray-400 text-sm text-center">
              [ Case study 2 — RFID/IoT startup ]
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
