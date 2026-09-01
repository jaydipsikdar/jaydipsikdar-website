import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import Eyebrow from '@/components/ui/Eyebrow'
import NewsletterSubscribeForm from '@/components/NewsletterSubscribeForm'
import { getAllIssues } from '@/lib/newsletter'

export const metadata: Metadata = {
  title: 'The Workbench | Jaydeepp Sikdar',
  description:
    "Jaydeepp Sikdar's newsletter. One build, one lesson, one insight, every alternate week in your inbox.",
  openGraph: {
    title: 'The Workbench | Jaydeepp Sikdar',
    description:
      "Jaydeepp Sikdar's newsletter. One build, one lesson, one insight, every alternate week in your inbox.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Workbench | Jaydeepp Sikdar',
    description:
      "Jaydeepp Sikdar's newsletter. One build, one lesson, one insight, every alternate week in your inbox.",
  },
  alternates: {
    canonical: '/newsletter',
  },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function NewsletterPage() {
  const issues = getAllIssues()
  const [latest, ...rest] = issues

  return (
    <main>
      {/* ============================================================
          HERO
          ============================================================ */}
      <section className="relative overflow-hidden bg-surface-cream px-6 py-20 md:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        />
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow className="mb-5 flex justify-center">THE WORKBENCH</Eyebrow>
          <h1 className="mb-6 text-[34px] font-light leading-[1.1] tracking-[-0.7px] text-ink-900 md:text-[44px]">
            I build and test what works in marketing
            <br className="hidden sm:block" />
            <span className="text-ink-700"> (so&nbsp;you don&apos;t have to)</span> and share
            everything I&nbsp;learn.
          </h1>
          <p className="mx-auto mb-9 max-w-xl text-lg font-light leading-[1.5] text-ink-700">
            One build, one lesson, one insight. Every alternate week in your inbox.
          </p>
          <NewsletterSubscribeForm id="ml-newsletter-form" />
          <p className="mt-4 text-[13px] text-ink-500">
            Free. No spam. Unsubscribe in one click.
          </p>
        </div>
      </section>

      {/* ============================================================
          WHAT YOU'LL GET
          ============================================================ */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-[1100px]">
          <h2 className="mb-14 text-center text-[26px] font-light leading-[1.12] tracking-[-0.26px] text-ink-900">
            What you&apos;ll get
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {VALUE_PROPS.map((prop, i) => (
              <div
                key={prop.title}
                className="group relative rounded-xl border border-hairline bg-surface-soft/40 p-7 transition-colors hover:border-primary/30"
              >
                <span className="mb-5 flex h-9 w-9 items-center justify-center rounded-full border border-primary/25 bg-primary-subtle/30 text-sm font-normal text-primary">
                  {i + 1}
                </span>
                <h3 className="mb-2 text-lg font-normal leading-[1.4] text-ink-900">
                  {prop.title}
                </h3>
                <p className="text-[15px] font-light leading-[1.5] text-ink-700">
                  {prop.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          ARCHIVE
          ============================================================ */}
      <section className="border-t border-hairline px-6 py-16 md:py-24">
        <div className="mx-auto max-w-[1100px]">
          <Eyebrow className="mb-4 flex justify-center">PAST ISSUES</Eyebrow>
          <h2 className="mb-14 text-center text-[26px] font-light leading-[1.12] tracking-[-0.26px] text-ink-900">
            Everything shared so far
          </h2>

          {issues.length === 0 ? (
            <p className="mx-auto max-w-lg text-center text-base font-light leading-[1.5] text-ink-500">
              The first issue is coming soon. Subscribe above and it lands in your inbox the day it
              ships.
            </p>
          ) : (
            <div className="space-y-10">
              {/* Featured latest issue */}
              <Link
                href={`/newsletter/${latest.slug}`}
                className="group block rounded-2xl border border-hairline bg-surface-soft/40 p-8 transition-all hover:border-primary/30 hover:bg-surface-soft/70 sm:p-10"
              >
                <div className="mb-4 flex items-center gap-3 text-xs text-ink-500">
                  <span className="rounded-pill bg-primary-subtle/40 px-2.5 py-1 font-normal text-primary">
                    Latest · Issue {latest.number}
                  </span>
                  <time dateTime={latest.date}>{formatDate(latest.date)}</time>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={13} strokeWidth={1.75} />
                    {latest.readingMinutes} min read
                  </span>
                </div>
                <h3 className="text-[26px] font-light leading-[1.2] tracking-[-0.4px] text-ink-900 transition-colors group-hover:text-primary">
                  {latest.title}
                </h3>
                <p className="mt-3 max-w-2xl text-[15px] font-light leading-[1.6] text-ink-700">
                  {latest.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-normal text-primary">
                  Read this issue
                  <ArrowRight
                    size={15}
                    strokeWidth={1.75}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>

              {/* The rest */}
              {rest.length > 0 && (
                <div className="mx-auto max-w-2xl divide-y divide-hairline">
                  {rest.map((issue) => (
                    <Link
                      key={issue.slug}
                      href={`/newsletter/${issue.slug}`}
                      className="group flex flex-col gap-1 py-6 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3 text-xs text-ink-500">
                        <span>Issue {issue.number}</span>
                        <time dateTime={issue.date}>{formatDate(issue.date)}</time>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={13} strokeWidth={1.75} />
                          {issue.readingMinutes} min
                        </span>
                      </div>
                      <h3 className="text-[19px] font-light leading-[1.4] text-ink-900 transition-colors group-hover:text-primary">
                        {issue.title}
                      </h3>
                      <p className="text-[15px] font-light leading-[1.55] text-ink-700">
                        {issue.description}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================
          ABOUT THE AUTHOR
          ============================================================ */}
      <section className="bg-surface-soft px-6 py-16 md:py-24">
        <div className="mx-auto max-w-[640px] text-center">
          <p className="mb-10 text-base font-light leading-[1.6] text-ink-900">
            The Workbench is written by Jaydeepp Sikdar, a consulting CMO who spent 20 years across
            enterprise tech and high-growth startups. He builds practical marketing tools with AI
            and shares everything he learns. More at{' '}
            <Link href="/" className="text-primary transition-colors hover:text-primary-hover">
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
