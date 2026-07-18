import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — Jaydip Sikdar',
  description:
    '20 years inside IBM, Adobe, Cisco, and MoEngage. Now building free marketing tools and advising AI startups as CMO.',
}

export default function AboutPage() {
  return (
    <main className="px-6 py-20 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-10">About</h1>

      <div className="space-y-5 text-brand-text text-lg leading-relaxed">
        <p>
          Here&apos;s what 20 years inside IBM, Adobe, Cisco, and MoEngage taught me: the gap
          between how large companies do marketing and how everyone else does it isn&apos;t about
          talent or budget. It&apos;s about infrastructure.
        </p>
        <p>
          Enterprise marketing teams have decision frameworks for every recurring problem. Vendor
          evaluation models. Launch playbooks. Positioning diagnostics they run quarterly. None of
          this is revolutionary — it&apos;s just accumulated operational knowledge. And almost none
          of it is accessible to the people outside those walls.
        </p>
        <p>
          I know because I&apos;ve sat on both sides. I ran portfolio marketing and consulting
          growth programs at IBM across five countries. At Adobe, I spent over six years leading
          growth marketing for their consulting business across Americas, EMEA, and APAC, then moved
          into customer success leadership for the region. At MoEngage, I led customer success for
          India. At Cisco, I was among the first to market their mobile data services platform to
          leading telecom operators globally. Across these roles — especially customer success — I
          worked directly with 200+ CMOs, and the pattern became impossible to ignore: the most
          common problems weren&apos;t unique. The same positioning mistakes, the same vendor traps,
          the same launch blind spots showed up whether the company had 10 people or 10,000. The
          difference was that larger companies had systems to catch them earlier.
        </p>
        <p>That&apos;s the problem I keep working on.</p>
        <p>
          <strong>The tools</strong> — I&apos;m building a set of free, interactive tools at
          jaydipsikdar.com that package the frameworks I&apos;ve used and seen work. The Vendor
          Contract Checker scores your agency contract clause-by-clause and flags what to
          renegotiate. The Marketing Decision Advisor gives you a structured diagnosis and action
          plan grounded in lessons from those 200+ CMO conversations. Each tool solves one specific
          problem in minutes. More are in progress.
        </p>
        <p>
          <strong>The consulting</strong> — I work as a fractional CMO for AI and B2B SaaS
          startups, typically $1M–$10M ARR. I build the full marketing function — positioning, GTM,
          demand gen, ops, tech stack — and hire the team to run it after I leave. Two current
          clients, both AI companies in India.
        </p>
        <p>
          <strong>The podcast</strong> — The Marketing Couch is 21 conversations with B2B
          marketing, product, sales, and CS leaders about how they actually make decisions. Season 1
          is complete. Available on Spotify, Apple Podcasts, and YouTube.
        </p>
        <p>
          I also guest-lecture on marketing strategy at Christ University, PES University, Amity
          University, and FORE School of Management.
        </p>
        <p className="text-sm text-gray-500">
          Education: PGDM in Marketing, IMT Ghaziabad. BA in Media &amp; Communication, Manipal.
          Advanced certification in Internet Marketing Strategies, Harvard Extension School.
        </p>
        <p>
          <a
            href="/resources"
            className="text-brand-accent underline hover:opacity-80 transition-opacity"
          >
            Explore the tools →
          </a>
        </p>
      </div>
    </main>
  )
}
