import MailerLiteForm from '@/components/MailerLiteForm'

export default function HomePage() {
  return (
    <main>

      {/* ============================================================
          HERO — unchanged
          Copy: FINAL — locked 2026-06-19
          ============================================================ */}
      <section id="hero" className="px-6 py-20 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold leading-tight mb-6">
          Bad marketing doesn&apos;t just waste money. It hands your market to someone else.
        </h1>
        <p className="text-xl text-brand-text mb-6">
          Every month without a working marketing engine is a month of runway you&apos;re not getting back — and a month your competitor is using to pull ahead.
        </p>
        <p className="text-lg text-brand-text mb-8">
          I help early-stage startup founders build that engine — from positioning and go-to-market to demand generation and customer advocacy. I&apos;ve worked closely with 200+ CMOs to solve exactly these problems. I know what breaks and I know what works.
        </p>

        <MailerLiteForm />

        <p className="text-sm text-gray-500 text-center">
          Just want the insight in your inbox?{' '}
          <a href="#" className="underline hover:text-brand-accent">
            Join the list →
          </a>
        </p>
      </section>

      {/* ============================================================
          HOW I WORK — two columns
          Copy: FINAL — locked 2026-06-27
          ============================================================ */}
      <section id="how-i-work" className="px-6 py-16 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-12">How I Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

            {/* Left — Founders & CEOs */}
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-center mb-4">
                If you&apos;re a Founder or CEO
              </h3>
              <p className="text-brand-text leading-relaxed mb-8">
                Most early-stage startups don&apos;t have a marketing problem. They have a clarity
                problem — unclear positioning, premature campaigns, and a team executing in the wrong
                direction. I come in as a Fractional CMO to fix the foundation before scaling
                anything. Retainers, consulting sprints, and 1:1 sessions — structured around where
                you actually are.
              </p>
              <div className="text-center mt-auto">
                <a
                  href="/contact"
                  className="inline-block px-6 py-3 bg-brand-accent text-white rounded hover:opacity-90 transition-opacity"
                >
                  Book a session →
                </a>
              </div>
            </div>

            {/* Right — Marketers, Consultants & Students */}
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-center mb-4">
                If you&apos;re a Marketer, Consultant or Student
              </h3>
              <p className="text-brand-text leading-relaxed mb-8">
                Most marketing education teaches you what worked for someone else, somewhere else, at
                a different stage. I share what I&apos;ve learned from being inside the room — two
                decades of B2B, 200+ CMO conversations, and the pattern recognition that comes from
                seeing the same mistakes made at scale. It&apos;s practical, specific, and free to
                start.
              </p>
              <div className="text-center mt-auto">
                <a
                  href="/resources"
                  className="inline-block px-6 py-3 bg-brand-accent text-white rounded hover:opacity-90 transition-opacity"
                >
                  Explore Resources →
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================
          RESOURCES
          Copy: FINAL — locked 2026-06-27
          Card CTA anchors to #hero (MailerLite form, same page)
          ============================================================ */}
      <section id="resources" className="px-6 py-16 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-4">Resources</h2>
          <p className="text-center text-brand-text mb-10">
            Most marketing tools are built for marketers. These are built for anyone who needs to
            think like one.
          </p>

          {/* Card grid — built to scale to 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 justify-items-center">
            <div className="border border-gray-200 rounded-lg p-6 w-full max-w-sm">
              <h3 className="text-base font-semibold mb-3">CMO Boardroom Kit</h3>
              <p className="text-brand-text text-sm leading-relaxed mb-6">
                A practical kit for founders who need to evaluate marketing strategy, challenge
                assumptions, and make better decisions — without a full-time CMO on payroll.
              </p>
              <div className="text-center">
                <a
                  href="#hero"
                  className="inline-block px-5 py-2.5 bg-brand-accent text-white text-sm rounded hover:opacity-90 transition-opacity"
                >
                  Download free →
                </a>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-brand-text italic mt-8">
            New tools dropping in July 2026 —{' '}
            <a href="#hero" className="underline hover:text-brand-accent">
              get on the list
            </a>{' '}
            to hear first.
          </p>
        </div>
      </section>

      {/* ============================================================
          THE MARKETING COUCH — podcast
          Copy: FINAL — locked 2026-06-27
          No embedded player — links only
          ============================================================ */}
      <section id="podcast" className="px-6 py-16 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-6">The Marketing Couch</h2>
          <p className="text-brand-text leading-relaxed mb-8">
            A podcast about marketing strategy, leadership, and what actually works in B2B — hosted
            by someone who&apos;s been in the room for most of it. Season 1 is live: 21 episodes,
            real conversations, no filler.
          </p>
          <div className="flex justify-center gap-8 text-sm">
            <a
              href="https://open.spotify.com/show/0BNFOPu4roOCLSdM1sjWUN?si=60dfc28201554a8e"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-text underline hover:text-brand-accent transition-colors"
            >
              Spotify
            </a>
            <a
              href="https://podcasts.apple.com/us/podcast/the-marketing-couch/id1809552287"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-text underline hover:text-brand-accent transition-colors"
            >
              Apple Podcasts
            </a>
            <a
              href="https://www.youtube.com/watch?v=YWkJzI8xfVc&list=PLDRiPzpWfnc4u3YA9vBK41tOYIwAm0Csl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-text underline hover:text-brand-accent transition-colors"
            >
              YouTube
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}
