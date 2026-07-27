import RazorpayBookButton from '@/components/RazorpayBookButton'
import KitSignupForm from '@/components/KitSignupForm'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Eyebrow from '@/components/ui/Eyebrow'
import ColorField from '@/components/ui/ColorField'

const MATURITY_DIMENSIONS = [
  { label: 'Positioning', value: 72, color: 'var(--dim-positioning)' },
  { label: 'Demand gen', value: 54, color: 'var(--dim-demand)' },
  { label: 'Content', value: 61, color: 'var(--dim-content)' },
  { label: 'Ops', value: 45, color: 'var(--dim-ops)' },
  { label: 'Measurement', value: 38, color: 'var(--dim-measurement)' },
  { label: 'Team', value: 58, color: 'var(--dim-team)' },
]

const CONTENT_THEMES = [
  { label: 'Education', color: '#27874a' },
  { label: 'Analysis', color: '#b57738' },
  { label: 'Point of view', color: '#df4770' },
  { label: 'Story', color: '#34465d' },
]

const CONTENT_PILLARS = ['Pricing strategy', 'Team culture', 'Product launches']

export default function HomePage() {
  return (
    <main>

      {/* ============================================================
          HERO
          ============================================================ */}
      <section id="hero" className="relative overflow-hidden">
        <ColorField className="h-[420px]" />
        <div className="relative px-6 pt-28 pb-20 max-w-[1200px] mx-auto text-center">
          <h1 className="text-[40px] md:text-[56px] font-light tracking-[-1.4px] leading-[1.05] text-ink-900 mb-6 max-w-3xl mx-auto">
            Bad marketing doesn&apos;t just waste money. It hands your market to someone else.
          </h1>
          <p className="text-base md:text-lg font-light leading-[1.4] text-ink-700 mb-8 max-w-2xl mx-auto">
            I&apos;ve spent 20 years in marketing at IBM, Adobe, MoEngage, and now as CMO for two
            AI startups. I&apos;m taking what I&apos;ve learned and making it accessible: free tools,
            decision frameworks, and practical resources for marketers, solopreneurs, and consultants
            who don&apos;t have a marketing team behind them.
          </p>
          <Button href="/resources">Explore the tools</Button>
        </div>
      </section>

      {/* ============================================================
          FEATURED TOOL — Marketing Decision Advisor
          Prime slot below the hero. Ungated — links straight to the tool.
          ============================================================ */}
      <section id="featured-advisor" className="px-6 py-16 md:py-24 bg-surface-soft">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <h2 className="text-[26px] font-light tracking-[-0.26px] leading-[1.12] text-ink-900 mb-4">
              Try the Marketing Decision Advisor
            </h2>
            <p className="text-ink-700 leading-[1.4] mb-8">
              Bring any marketing decision, positioning, launch timing, budget allocation,
              campaign strategy. Pick your category, describe the situation, and get a structured
              recommendation with reasoning you can act on or push back against. No signup needed.
            </p>
            <Button href="/resources/marketing-advisor">Get a second opinion</Button>
            <p className="text-xs text-ink-500 mt-4">
              Grounded in 213 lessons from 21 senior marketing leaders. Free, no signup required.
            </p>
          </Card>
        </div>
      </section>

      {/* ============================================================
          CROSS-TOOL NARRATIVE — frames the three tools below as a system
          ============================================================ */}
      <section id="tools-intro" className="px-6 pt-16 md:pt-24">
        <div className="max-w-2xl mx-auto text-center">
          <Eyebrow className="mb-4 justify-center flex">FREE TOOLS</Eyebrow>
          <h2 className="text-[32px] font-light tracking-[-0.64px] leading-[1.1] text-ink-900 mb-4">
            Diagnose, build, equip
          </h2>
          <p className="text-ink-700 leading-[1.4]">
            Start with a marketing maturity diagnosis. Build your content system from the
            results. Grab the frameworks and templates CMOs use in the boardroom.
          </p>
        </div>
      </section>

      {/* ============================================================
          TOOL 1 — Marketing Maturity Score (the diagnostic)
          ============================================================ */}
      <section id="maturity-score" className="px-6 py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <Eyebrow className="mb-4">MARKETING DIAGNOSTIC</Eyebrow>
            <h3 className="text-[26px] md:text-[32px] font-light tracking-[-0.26px] leading-[1.12] text-ink-900 mb-4">
              Most marketing runs on instinct. Find out where yours needs a system.
            </h3>
            <p className="text-ink-700 leading-[1.4] mb-6">
              Answer 25 questions across positioning, demand generation, content, ops,
              measurement, and team. Get a maturity score, a radar chart, and your top 3
              priority gaps in about 8 minutes.
            </p>
            <div className="flex flex-wrap gap-4 mb-6">
              <Button href="/resources/marketing-maturity-score">Get my score</Button>
              <Button href="/resources/marketing-maturity-score#sample" variant="secondary">
                See a sample report
              </Button>
            </div>
            <p className="text-sm text-ink-500 leading-[1.4]">
              25 questions. 6 dimensions. A benchmark against your growth stage, not a generic
              average. The full report adds tailored recommendations, stage benchmarks, and your
              next 90 days.
            </p>
          </div>
          <MaturityScoreMockup />
        </div>
      </section>

      {/* ============================================================
          TOOL 2 — Content Office (the builder)
          ============================================================ */}
      <section id="content-office" className="px-6 py-16 md:py-20 bg-surface-soft">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <ContentOfficeMockup />
          </div>
          <div className="order-1 md:order-2">
            <Eyebrow className="mb-4">CONTENT STRATEGY</Eyebrow>
            <h3 className="text-[26px] md:text-[32px] font-light tracking-[-0.26px] leading-[1.12] text-ink-900 mb-4">
              You know your expertise. You just don&apos;t know what to post.
            </h3>
            <p className="text-ink-700 leading-[1.4] mb-6">
              Answer five questions about your business, audience, and goals. Get a complete
              content system: 30 ideas mapped to themes, structures, and channels. No more
              blank-page paralysis.
            </p>
            <div className="flex flex-wrap gap-4 mb-6">
              <Button href="/resources/content-office">Build my content system</Button>
              <Button href="/resources/content-office#sample" variant="secondary">
                See a sample report
              </Button>
            </div>
            <p className="text-sm text-ink-500 leading-[1.4]">
              Five inputs. Ten content themes. Your topics crossed with structures that actually
              vary what you publish. The report includes a starter sequence, gap analysis, and
              channel-fit recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          TOOL 3 — CMO Boardroom Kit (secondary card, the equip step)
          ============================================================ */}
      <section id="cmo-kit" className="px-6 py-16 md:py-20">
        <div className="max-w-2xl mx-auto">
          <Card tone="cream" className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-1">
              <h3 className="text-lg font-light text-ink-900 mb-3">Get the CMO Boardroom Kit, free</h3>
              <p className="text-ink-700 text-sm leading-[1.4]">
                213 lessons from 21 senior marketing leaders, eight AI advisor prompts for
                ChatGPT, Claude, or Gemini, and a boardroom prompt that debates your next big
                decision. Free PDF, works in any AI chat tool.
              </p>
            </div>
            <div className="w-full md:w-72 flex-shrink-0">
              <KitSignupForm />
            </div>
          </Card>
        </div>
      </section>

      {/* ============================================================
          WHAT YOU'LL FIND HERE — two columns
          ============================================================ */}
      <section id="how-i-work" className="px-6 py-16 md:py-24 bg-surface-soft">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-[26px] font-light tracking-[-0.26px] text-center text-ink-900 mb-12">
            What you&apos;ll find here
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

            {/* Left — Tools & frameworks */}
            <div className="flex flex-col">
              <h3 className="text-lg font-light text-ink-900 mb-4">
                Tools and frameworks from 20 years of CMO work
              </h3>
              <p className="text-ink-700 leading-[1.4] mb-4">
                Every resource on this site comes from a real marketing problem I&apos;ve faced,
                and solved, across IBM, Adobe, MoEngage, and two AI startups. Diagnostic scoring,
                content systems, decision frameworks for marketing leaders, and more on the way.
                Free, practical, and built to be used this week.
              </p>
              <p className="text-ink-700 leading-[1.4] mb-8">
                Not sure where your marketing stands? Start with the Maturity Score. Staring at a
                blank content calendar? Bring it to the Content Office and get a full system in
                minutes. More tools are in progress, each one solves a specific problem in
                minutes.
              </p>
              <div className="mt-auto">
                <Button href="/resources" variant="secondary">Browse resources</Button>
              </div>
            </div>

            {/* Right — Consulting CMO */}
            <div className="flex flex-col">
              <h3 className="text-lg font-light text-ink-900 mb-4">
                CMO for early-stage startups
              </h3>
              <div className="mb-8">
                <p className="text-ink-700 leading-[1.4] mb-4">
                  I build the marketing function for AI and B2B SaaS startups, positioning, GTM,
                  demand gen, ops, hiring, typically at the $1M to $10M ARR stage. I&apos;ve
                  helped several early-stage tech startups get their marketing right, backed by
                  20 years at IBM, Adobe, MoEngage, and Cisco.
                </p>
                <p className="text-ink-700 leading-[1.4] mb-4">
                  Most founders either hire too junior too early or delay marketing until growth
                  stalls. Working with a CMO who has done this before gets you senior-level
                  strategy and execution without a full-time cost.
                </p>
                <p className="text-ink-700 leading-[1.4]">
                  Book a 60-minute consultation. Walk me through your current marketing setup,
                  you&apos;ll leave with a clear picture of what&apos;s working, what&apos;s not,
                  and what to prioritize.
                </p>
              </div>
              <div className="mt-auto">
                <RazorpayBookButton className="inline-flex items-center justify-center gap-2 rounded-pill bg-primary px-4 py-2.5 text-sm font-normal text-white transition-colors hover:bg-primary-hover">
                  Book a consultation, ₹999
                </RazorpayBookButton>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================
          THE MARKETING COUCH — podcast
          No embedded player — links only
          ============================================================ */}
      <section id="podcast" className="px-6 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-[26px] font-light tracking-[-0.26px] mb-6 text-ink-900">
            The Marketing Couch podcast
          </h2>

          <div className="flex justify-center mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/marketing-couch-cover.jpg"
              alt="The Marketing Couch Podcast"
              width={320}
              height={180}
              className="rounded-xl"
            />
          </div>

          <p className="text-ink-700 leading-[1.4] mb-8">
            21 episodes on marketing strategy, leadership, and what actually works, from someone
            who&apos;s been in the room for two decades. Season 1 is complete.
          </p>
          <div className="flex justify-center gap-8 text-sm">
            <a
              href="https://open.spotify.com/show/0BNFOPu4roOCLSdM1sjWUN?si=60dfc28201554a8e"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-700 hover:text-primary transition-colors"
            >
              Spotify
            </a>
            <a
              href="https://podcasts.apple.com/us/podcast/the-marketing-couch/id1809552287"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-700 hover:text-primary transition-colors"
            >
              Apple Podcasts
            </a>
            <a
              href="https://www.youtube.com/watch?v=YWkJzI8xfVc&list=PLDRiPzpWfnc4u3YA9vBK41tOYIwAm0Csl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-700 hover:text-primary transition-colors"
            >
              YouTube
            </a>
          </div>
        </div>
      </section>

    </main>
  )
}

/**
 * Product-mockup style preview for the Marketing Maturity Score section.
 * A miniature version of the tool's dimension bars, in a 16px-radius
 * white container per DESIGN.md imagery rules.
 */
function MaturityScoreMockup() {
  return (
    <div className="rounded-xl border border-hairline bg-white p-6 shadow-2">
      <p className="text-[10px] font-normal uppercase tracking-[0.1px] text-ink-500 mb-5">
        Maturity by dimension
      </p>
      <div className="flex flex-col gap-4">
        {MATURITY_DIMENSIONS.map((dim) => (
          <div key={dim.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm text-ink-700">{dim.label}</span>
              <span className="text-sm text-ink-900 tabular-nums">{dim.value}</span>
            </div>
            <div className="h-1.5 w-full rounded-pill bg-surface-soft overflow-hidden">
              <div
                className="h-full rounded-pill"
                style={{ width: `${dim.value}%`, backgroundColor: dim.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Product-mockup style preview for the Content Office section: pillars as
 * rows, themes as columns, sample cell content visible, per the build spec.
 */
function ContentOfficeMockup() {
  return (
    <div className="rounded-xl border border-hairline bg-white p-6 shadow-2 overflow-x-auto">
      <p className="text-[10px] font-normal uppercase tracking-[0.1px] text-ink-500 mb-5">
        Your content matrix
      </p>
      <table className="w-full border-collapse min-w-[420px]">
        <thead>
          <tr>
            <th className="text-left text-xs font-normal text-ink-500 pb-3 pr-3"> </th>
            {CONTENT_THEMES.map((theme) => (
              <th key={theme.label} className="text-left text-xs font-normal text-ink-500 pb-3 pr-3">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: theme.color }}
                  />
                  {theme.label}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CONTENT_PILLARS.map((pillar) => (
            <tr key={pillar} className="border-t border-hairline">
              <td className="py-3 pr-3 text-sm text-ink-900 whitespace-nowrap">{pillar}</td>
              {CONTENT_THEMES.map((theme) => (
                <td key={theme.label} className="py-3 pr-3">
                  <div className="h-8 w-full rounded-md bg-surface-soft" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
