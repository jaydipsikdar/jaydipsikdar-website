import type { Metadata } from 'next'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Eyebrow from '@/components/ui/Eyebrow'

export const metadata: Metadata = {
  title: 'The Workbench | Jaydip Sikdar',
  description:
    "Jaydip Sikdar's weekly newsletter. One build, one lesson, one thing you can use, every week in your inbox.",
  openGraph: {
    title: 'The Workbench | Jaydip Sikdar',
    description:
      "Jaydip Sikdar's weekly newsletter. One build, one lesson, one thing you can use, every week in your inbox.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Workbench | Jaydip Sikdar',
    description:
      "Jaydip Sikdar's weekly newsletter. One build, one lesson, one thing you can use, every week in your inbox.",
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
            One build, one lesson, one thing you can use. Every week in your inbox.
          </p>
          <NewsletterSignupForm id="ml-newsletter-form" buttonVariant="primary" />
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
              The first issue is coming soon. Subscribe above so you don&apos;t miss it.
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
            The Workbench is written by Jaydip Sikdar, a consulting CMO who spent 20 years
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
          <NewsletterSignupForm id="ml-newsletter-form-about" buttonVariant="secondary" />
        </div>
      </section>
    </main>
  )
}

const VALUE_PROPS = [
  {
    title: 'Builds & tools',
    description:
      'Practical marketing tools built with AI. The prompts, the process, the mistakes.',
  },
  {
    title: 'Frameworks that work',
    description:
      'Tested strategies from 20 years across enterprise tech and high-growth startups.',
  },
  {
    title: 'Honest lessons',
    description: "What worked, what failed, and what I'd do differently. No fluff.",
  },
]

/**
 * Visual placeholder for the MailerLite signup embed. The real embed
 * snippet gets pasted into the element carrying `id` after launch; this
 * markup exists only to hold the space with the correct sizing and
 * styling until then.
 */
function NewsletterSignupForm({
  id,
  buttonVariant,
}: {
  id: string
  buttonVariant: 'primary' | 'secondary'
}) {
  const buttonStyles =
    buttonVariant === 'primary'
      ? 'bg-primary text-white hover:bg-primary-hover active:bg-primary-press'
      : 'bg-white text-primary border border-primary hover:bg-primary-subtle/40 active:bg-primary-subtle/60'

  return (
    <div id={id} className="mx-auto flex w-full max-w-[480px] flex-col gap-3 sm:flex-row">
      <input
        type="email"
        placeholder="Your email address"
        className="h-11 w-full rounded-sm border border-hairline-input bg-white px-4 text-sm text-ink-900 placeholder-ink-500 transition-colors focus:border-primary focus:outline-none sm:flex-1"
      />
      <button
        type="button"
        className={`h-11 w-full shrink-0 rounded-pill px-6 text-[16px] font-normal transition-colors duration-150 ease-out sm:w-auto ${buttonStyles}`}
      >
        Subscribe
      </button>
    </div>
  )
}
