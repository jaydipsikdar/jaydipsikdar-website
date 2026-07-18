import MailerLiteForm from '@/components/MailerLiteForm'
import RazorpayBookButton from '@/components/RazorpayBookButton'

export default function HomePage() {
  return (
    <main>

      {/* ============================================================
          HERO
          ============================================================ */}
      <section id="hero" className="px-6 py-20 max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold leading-tight mb-6">
          Bad marketing doesn&apos;t just waste money. It hands your market to someone else.
        </h1>
        <p className="text-lg text-brand-text mb-8">
          I&apos;ve spent 20 years in marketing — at IBM, Adobe, MoEngage, and now as CMO for two
          AI startups. I&apos;m taking what I&apos;ve learned and making it accessible: free tools,
          decision frameworks, and practical resources for marketers, solopreneurs, and consultants
          who don&apos;t have a marketing team behind them.
        </p>

        <p className="mb-8">
          <a
            href="/resources"
            className="inline-block px-6 py-3 bg-brand-accent text-white rounded hover:opacity-90 transition-opacity"
          >
            Explore the tools →
          </a>
        </p>

        <MailerLiteForm />
      </section>

      {/* ============================================================
          WHAT YOU'LL FIND HERE — two columns
          ============================================================ */}
      <section id="how-i-work" className="px-6 py-16 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-12">What You&apos;ll Find Here</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

            {/* Left — Tools & frameworks */}
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-left mb-4">
                Tools and frameworks from 20 years of CMO work
              </h3>
              <p className="text-brand-text leading-relaxed mb-8">
                Every resource on this site comes from a real marketing problem I&apos;ve faced —
                and solved — across IBM, Adobe, MoEngage, and two AI startups. Vendor contract
                risk-scoring, decision frameworks for marketing leaders, budget allocation models,
                and more on the way. Free, practical, and built to be used this week.
              </p>
              <div className="text-left mt-auto">
                <a
                  href="/resources"
                  className="inline-block px-6 py-3 bg-brand-accent text-white rounded hover:opacity-90 transition-opacity"
                >
                  Browse resources →
                </a>
              </div>
            </div>

            {/* Right — Consulting CMO */}
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-left mb-4">
                Consulting CMO for early-stage startups
              </h3>
              <p className="text-brand-text leading-relaxed mb-8">
                I also work hands-on with founders and CEOs who need strategic marketing leadership
                without a full-time hire. Retainers, sprints, and advisory — structured around where
                your company actually is.
              </p>
              <div className="text-left mt-auto">
                <RazorpayBookButton className="inline-block px-6 py-3 bg-brand-accent text-white rounded hover:opacity-90 transition-opacity">
                  Book a session →
                </RazorpayBookButton>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================
          RESOURCES — hub teaser
          Grid scales to 3 columns automatically as more resources are added.
          ============================================================ */}
      <section id="resources" className="px-6 py-16 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-10">
            Free Tools & Frameworks — From Two Decades in the CMO Seat
          </h2>

          <div className="flex flex-wrap justify-center gap-6">
            <div className="border border-gray-200 rounded-lg p-6 flex flex-col w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
              <h3 className="text-base font-semibold mb-3">Marketing Decision Advisor</h3>
              <p className="text-brand-text text-sm leading-relaxed mb-6 flex-1">
                Pick a marketing challenge — positioning, brand, growth, AI strategy, or launch —
                answer a few questions, and get a tailored advisory report grounded in 213 lessons
                from senior marketing operators. Takes 2 minutes. Free.
              </p>
              <div className="text-center">
                <a
                  href="/resources/marketing-advisor"
                  className="inline-block px-5 py-2.5 bg-brand-accent text-white text-sm rounded hover:opacity-90 transition-opacity"
                >
                  Get your advice →
                </a>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 flex flex-col w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
              <h3 className="text-base font-semibold mb-3">Vendor Contract Check</h3>
              <p className="text-brand-text text-sm leading-relaxed mb-6 flex-1">
                Paste your vendor contract. Get a clause-by-clause risk score with renegotiation
                language you can use before you sign.
              </p>
              <div className="text-center">
                <a
                  href="/resources/vendor-check"
                  className="inline-block px-5 py-2.5 bg-brand-accent text-white text-sm rounded hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  Check your contract →
                </a>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 flex flex-col w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
              <h3 className="text-base font-semibold mb-3">CMO Boardroom Kit</h3>
              <p className="text-brand-text text-sm leading-relaxed mb-6 flex-1">
                Making a big marketing call and want a second opinion? This kit gives you 213
                distilled lessons from 21 senior marketing leaders — plus eight AI-powered advisor
                prompts you can run in ChatGPT, Claude, or Gemini to pressure-test your thinking.
                Free PDF.
              </p>
              <div className="text-center">
                <a
                  href="/resources"
                  className="inline-block px-5 py-2.5 bg-brand-accent text-white text-sm rounded hover:opacity-90 transition-opacity"
                >
                  Get the Kit →
                </a>
              </div>
            </div>
          </div>

          <p className="text-center mt-10">
            <a
              href="/resources"
              className="text-sm text-brand-accent underline hover:opacity-80 transition-opacity"
            >
              See all resources →
            </a>
          </p>
        </div>
      </section>

      {/* ============================================================
          THE MARKETING COUCH — podcast
          No embedded player — links only
          ============================================================ */}
      <section id="podcast" className="px-6 py-16 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-6">The Marketing Couch Podcast</h2>

          <div className="flex justify-center mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/marketing-couch-cover.jpg"
              alt="The Marketing Couch Podcast"
              width={320}
              height={180}
              className="rounded-lg"
            />
          </div>

          <p className="text-brand-text leading-relaxed mb-8 text-center">
            21 episodes on marketing strategy, leadership, and what actually works — from someone
            who&apos;s been in the room for two decades. Season 1 is complete.
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
