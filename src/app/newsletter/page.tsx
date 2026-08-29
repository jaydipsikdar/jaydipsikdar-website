import type { Metadata } from 'next'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Eyebrow from '@/components/ui/Eyebrow'
import NewsletterSubscribeForm from '@/components/NewsletterSubscribeForm'

export const metadata: Metadata = {
  title: 'The Workbench | Jaydeepp Sikdar',
  description:
    "Jaydeepp Sikdar's weekly newsletter. One build, one lesson, one insight, every week in your inbox.",
  openGraph: {
    title: 'The Workbench | Jaydeepp Sikdar',
    description:
      "Jaydeepp Sikdar's weekly newsletter. One build, one lesson, one insight, every week in your inbox.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Workbench | Jaydeepp Sikdar',
    description:
      "Jaydeepp Sikdar's weekly newsletter. One build, one lesson, one insight, every week in your inbox.",
  },
  alternates: {
    canonical: '/newsletter',
  },
}

// Future issues will follow this structure:
// const issues = [
//   {
//     number: 1,
//     date: '2026-08-05',
//     title: 'Issue title here',
//     description: 'One-line description of this issue',
//     slug: 'issue-1-slug' // for future individual issue pages
//   }
// ]
const issues: Array<{
  number: number
  date: string
  title: string
  description: string
  slug: string
}> = []

export default function NewsletterPage() {
  return (
    <main>
      {/* ============================================================
          HERO
          ============================================================ */}
      <section className="bg-surface-cream px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow className="mb-4 flex justify-center">THE WORKBENCH</Eyebrow>
          <h1 className="mb-6 text-[32px] font-light leading-[1.1] tracking-[-0.64px] text-ink-900">
            I build and test what works in marketing
            <br />
            <span className="text-ink-700">(so&nbsp;you don&apos;t have to)</span> and share
            everything I&nbsp;learn.
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-base font-light leading-[1.4] text-ink-700">
            One build, one lesson, one insight. Every week in your inbox.
          </p>
          <NewsletterSubscribeForm id="ml-newsletter-form" />
        </div>
      </section>

      {/* ============================================================
          WHAT YOU'LL GET
          ============================================================ */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="mb-12 text-center text-[26px] font-light leading-[1.12] tracking-[-0.26px] text-ink-900">
            What you&apos;ll get
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {VALUE_PROPS.map((prop) => (
              <Card key={prop.title}>
                <h3 className="mb-3 text-lg font-light leading-[1.4] text-ink-900">
                  {prop.title}
                </h3>
                <p className="text-[15px] font-light leading-[1.4] text-ink-700">
                  {prop.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          NEWSLETTER ARCHIVE
          ============================================================ */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-[1200px]">
          <Eyebrow className="mb-4 flex justify-center">PAST ISSUES</Eyebrow>
          <h2 className="mb-12 text-center text-[26px] font-light leading-[1.12] tracking-[-0.26px] text-ink-900">
            Everything shared so far
          </h2>

          {issues.length === 0 ? (
            <p className="mx-auto max-w-lg text-center text-base font-light leading-[1.4] text-ink-500">
              The first issue is coming soon. Subscribe above and it lands in your inbox the day it ships.
            </p>
          ) : (
            <div className="mx-auto max-w-2xl divide-y divide-hairline">
              {issues.map((issue) => (
                <div key={issue.slug} className="py-8 first:pt-0 last:pb-0">
                  <p className="mb-2 text-[13px] font-normal tracking-[-0.39px] text-ink-500">
                    Issue {issue.number} &middot;{' '}
                    {new Date(issue.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <Link
                    href={`/newsletter/${issue.slug}`}
                    className="mb-2 block text-[20px] font-light leading-[1.4] text-ink-900 transition-colors hover:text-primary"
                  >
                    {issue.title}
                  </Link>
                  <p className="text-[15px] font-light leading-[1.4] text-ink-700">
                    {issue.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          ABOUT THE AUTHOR
          ============================================================ */}
      <section className="bg-surface-soft px-6 py-16 md:py-24">
        <div className="mx-auto max-w-[640px] text-center">
          <p className="mb-10 text-base font-light leading-[1.4] text-ink-900">
            The Workbench is written by Jaydeepp Sikdar, a consulting CMO who spent 20 years
            across enterprise tech and high-growth startups. He builds practical marketing
            tools with AI and shares everything he learns. More at{' '}
            <Link
              href="/"
              className="text-primary transition-colors hover:text-primary-hover"
            >
              jaydipsikdar.com
            </Link>
            .
          </p>
          <NewsletterSubscribeForm id="ml-newsletter-form-about" />
        </div>
      </section>
    </main>
  )
}

const VALUE_PROPS = [
  {
    title: 'The build',
    description:
      'A marketing tool I built with AI, start to finish. The prompts, the process, the mistakes.',
  },
  {
    title: 'The lesson',
    description: "What worked, what failed, and what I'd do differently. No fluff.",
  },
  {
    title: 'The insight',
    description:
      'One idea you can act on this week, drawn from 20 years across enterprise tech and startups.',
  },
]
