import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Clock, Hammer, GraduationCap, Lightbulb } from 'lucide-react'
import Eyebrow from '@/components/ui/Eyebrow'
import NewsletterSubscribeForm from '@/components/NewsletterSubscribeForm'
import { getListedIssues } from '@/lib/newsletter'

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
  const issues = getListedIssues()
  const [latest, ...rest] = issues

  return (
    <main>
      {/* ============================================================
          HERO — with the brand's atmospheric color field behind it
          ============================================================ */}
      <section className="relative overflow-hidden bg-surface-cream px-6 py-12 md:py-16">
        {/* Soft blurred gradient forms (peach + a hint of ember/ochre), kept subtle */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            className="absolute right-[-5rem] top-[-3rem] h-[240px] w-[240px] rounded-full opacity-40 blur-3xl"
            style={{
              background:
                'radial-gradient(circle at center, rgba(232,69,0,0.22) 0%, rgba(223,71,112,0.14) 50%, rgba(232,69,0,0) 72%)',
            }}
          />
          <div
            className="absolute left-[-4rem] bottom-[-3rem] h-[200px] w-[200px] rounded-full opacity-35 blur-3xl"
            style={{
              background:
                'radial-gradient(circle at center, rgba(181,119,56,0.20) 0%, rgba(181,119,56,0) 72%)',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <Eyebrow className="mb-5 flex justify-center">THE WORKBENCH</Eyebrow>
          <h1 className="mx-auto max-w-2xl text-balance text-[34px] font-light leading-[1.15] tracking-[-0.7px] text-ink-900 md:text-[46px]">
            I build and test what works in marketing{' '}
            <span className="text-ink-500">(so&nbsp;you don&apos;t have to),</span> and share
            everything I&nbsp;learn.
          </h1>
          <p className="mx-auto mt-6 mb-9 max-w-md text-lg font-light leading-[1.5] text-ink-700">
            One build, one lesson, one insight. Every alternate week in your inbox.
          </p>
          <NewsletterSubscribeForm id="ml-newsletter-form" />
          <p className="mt-4 text-[13px] text-ink-500">Free. No spam. Unsubscribe in one click.</p>
        </div>
      </section>

      {/* ============================================================
          WHAT YOU'LL GET — three value props with icons
          ============================================================ */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-[1080px]">
          <div className="mx-auto mb-14 max-w-xl text-center">
            <Eyebrow className="mb-4 flex justify-center">EVERY ISSUE</Eyebrow>
            <h2 className="text-[27px] font-light leading-[1.12] tracking-[-0.3px] text-ink-900">
              One build, one lesson, one insight
            </h2>
            <p className="mt-4 text-[15px] font-light leading-[1.6] text-ink-700">
              Three things, no filler in between. Here is what lands in your inbox.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {VALUE_PROPS.map((prop) => {
              const Icon = prop.icon
              return (
                <div
                  key={prop.title}
                  className="group relative overflow-hidden rounded-2xl border border-hairline bg-white p-7 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_40px_-16px_rgba(19,35,61,0.18)]"
                >
                  <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-subtle/60 text-primary transition-colors group-hover:bg-primary-subtle">
                    <Icon size={22} strokeWidth={1.5} />
                  </span>
                  <h3 className="mb-2 text-lg font-normal leading-[1.4] text-ink-900">
                    {prop.title}
                  </h3>
                  <p className="text-[15px] font-light leading-[1.55] text-ink-700">
                    {prop.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          ARCHIVE
          ============================================================ */}
      <section className="border-t border-hairline bg-surface-soft/50 px-6 py-20 md:py-28">
        <div className="mx-auto max-w-[1080px]">
          <div className="mb-12 text-center">
            <Eyebrow className="mb-4 flex justify-center">PAST ISSUES</Eyebrow>
            <h2 className="text-[27px] font-light leading-[1.12] tracking-[-0.3px] text-ink-900">
              Everything shared so far
            </h2>
          </div>

          {issues.length === 0 ? (
            <p className="mx-auto max-w-lg text-center text-base font-light leading-[1.5] text-ink-500">
              The first issue is coming soon. Subscribe above and it lands in your inbox the day it
              ships.
            </p>
          ) : (
            <div className="space-y-6">
              {/* Featured latest issue */}
              <Link
                href={`/newsletter/${latest.slug}`}
                className="group relative block overflow-hidden rounded-2xl border border-hairline bg-white p-8 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_16px_50px_-20px_rgba(19,35,61,0.22)] sm:p-10"
              >
                {/* accent spine */}
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary-soft to-primary opacity-80"
                />
                <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-ink-500">
                  <span className="rounded-pill bg-primary-subtle/60 px-2.5 py-1 font-normal text-primary">
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
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-normal text-primary">
                  Read this issue
                  <ArrowRight
                    size={15}
                    strokeWidth={1.75}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>

              {/* Older issues as cards */}
              {rest.length > 0 && (
                <div className="grid gap-5 sm:grid-cols-2">
                  {rest.map((issue) => (
                    <Link
                      key={issue.slug}
                      href={`/newsletter/${issue.slug}`}
                      className="group flex flex-col rounded-xl border border-hairline bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_40px_-18px_rgba(19,35,61,0.18)]"
                    >
                      <div className="mb-2 flex items-center gap-3 text-xs text-ink-500">
                        <span className="font-normal text-ink-700">Issue {issue.number}</span>
                        <time dateTime={issue.date}>{formatDate(issue.date)}</time>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} strokeWidth={1.75} />
                          {issue.readingMinutes} min
                        </span>
                      </div>
                      <h3 className="text-[18px] font-light leading-[1.4] text-ink-900 transition-colors group-hover:text-primary">
                        {issue.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-[14px] font-light leading-[1.55] text-ink-700">
                        {issue.description}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-normal text-primary">
                        Read
                        <ArrowRight
                          size={14}
                          strokeWidth={1.75}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
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
      <section className="px-6 py-20 md:py-28">
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
    icon: Hammer,
    title: 'One build',
    description:
      'A marketing tool I built with AI, start to finish. The prompts, the process, the mistakes.',
  },
  {
    icon: GraduationCap,
    title: 'One lesson',
    description: "What worked, what failed, and what I'd do differently. No fluff.",
  },
  {
    icon: Lightbulb,
    title: 'One insight',
    description:
      'One idea you can act on this week, drawn from 20 years across enterprise tech and startups.',
  },
]
