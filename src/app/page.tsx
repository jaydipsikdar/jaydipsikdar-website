import RazorpayBookButton from '@/components/RazorpayBookButton'
import KitSignupForm from '@/components/KitSignupForm'

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
          I&apos;ve spent 20 years in marketing at IBM, Adobe, MoEngage, and now as CMO for two
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
      </section>

      {/* ============================================================
          FEATURED TOOL — Marketing Decision Advisor
          Prime slot below the hero. Ungated — links straight to the tool.
          ============================================================ */}
      <section id="featured-advisor" className="px-6 py-16 border-t border-gray-200">
        <div className="max-w-2xl mx-auto">
          <div className="border border-gray-200 rounded-xl bg-white p-8 md:p-10 text-center shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Try the Marketing Decision Advisor</h2>
            <p className="text-brand-text leading-relaxed mb-8">
              Bring any marketing decision — positioning, launch timing, budget allocation,
              campaign strategy. Pick your category, describe the situation, and get a structured
              recommendation with reasoning you can act on or push back against. No signup needed.
            </p>
            <a
              href="/resources/marketing-advisor"
              className="inline-block px-6 py-3 bg-brand-accent text-white rounded hover:opacity-90 transition-opacity"
            >
              Get a second opinion →
            </a>
            <p className="text-xs text-gray-500 mt-4">
              Grounded in 213 lessons from 21 senior marketing leaders. Free, no signup required.
            </p>
          </div>
        </div>
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
              <p className="text-brand-text leading-relaxed mb-4">
                Every resource on this site comes from a real marketing problem I&apos;ve faced —
                and solved — across IBM, Adobe, MoEngage, and two AI startups. Vendor contract
                risk-scoring, decision frameworks for marketing leaders, budget allocation models,
                and more on the way. Free, practical, and built to be used this week.
              </p>
              <p className="text-brand-text leading-relaxed mb-8">
                About to sign an agency contract? Run it through the Vendor Contract Check before
                you commit. Stuck on a positioning or launch decision? Bring it to the Marketing
                Decision Advisor and get a structured second opinion. More tools are in progress —
                each one solves a specific problem in minutes.
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
                Fractional CMO for early-stage startups
              </h3>
              <div className="mb-8">
                <p className="text-brand-text leading-relaxed mb-4">
                  I build the marketing function for AI and B2B SaaS startups — positioning, GTM,
                  demand gen, ops, hiring — typically at the $1M–$10M ARR stage. I&apos;ve helped
                  several early-stage tech startups get their marketing right, backed by 20 years
                  at IBM, Adobe, MoEngage, and Cisco.
                </p>
                <p className="text-brand-text leading-relaxed mb-4">
                  Most founders either hire too junior too early or delay marketing until growth
                  stalls. A fractional CMO gets you senior-level strategy and execution without a
                  full-time cost.
                </p>
                <p className="text-brand-text leading-relaxed">
                  Book a 60-minute consultation. Walk me through your current marketing setup —
                  you&apos;ll leave with a clear picture of what&apos;s working, what&apos;s not,
                  and what to prioritize.
                </p>
              </div>
              <div className="text-left mt-auto">
                <RazorpayBookButton className="inline-block px-6 py-3 bg-brand-accent text-white rounded hover:opacity-90 transition-opacity">
                  Book a consultation — ₹999 →
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="border border-gray-200 rounded-lg p-6 flex flex-col">
              <h3 className="text-base font-semibold mb-3">Vendor Contract Check</h3>
              <div className="flex-1">
                <p className="text-brand-text text-sm leading-relaxed mb-3">
                  Most vendor contracts are written to protect the vendor. This tool reads yours
                  and tells you where.
                </p>
                <p className="text-brand-text text-sm leading-relaxed mb-3">
                  Paste or upload your contract — it scores every clause across scope, targets,
                  data rights, exit terms, and payment structure. You get a risk score, flagged
                  clauses, and specific renegotiation language you can use before you sign. Takes
                  2 minutes. Free.
                </p>
                <p className="text-brand-text text-sm leading-relaxed mb-6">
                  Built after a real engagement where a three-month retainer delivered nothing —
                  and the contract was designed to make that acceptable.
                </p>
              </div>
              <div className="text-left">
                <a
                  href="/resources/vendor-check"
                  className="inline-block px-5 py-2.5 bg-brand-accent text-white text-sm rounded hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  Check your contract →
                </a>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 flex flex-col">
              <h3 className="text-base font-semibold mb-3">Get the CMO Boardroom Kit — Free</h3>
              <div className="flex-1">
                <p className="text-brand-text text-sm leading-relaxed mb-3">
                  Making a big marketing call and want a second opinion? This kit gives you 213
                  distilled lessons from 21 senior marketing leaders — plus eight AI-powered
                  advisor prompts you can run in ChatGPT, Claude, or Gemini to pressure-test your
                  thinking.
                </p>
                <p className="text-brand-text text-sm leading-relaxed mb-3">
                  Includes the full boardroom prompt (bring a decision, they debate it),
                  individual advisor prompts for quick opinions, and the complete lessons
                  playbook in plain language.
                </p>
                <p className="text-brand-text text-sm font-medium mb-6">
                  Free PDF. Works in any AI chat tool.
                </p>
              </div>
              <KitSignupForm />
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
