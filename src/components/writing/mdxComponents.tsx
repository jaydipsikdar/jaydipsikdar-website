import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import NewsletterPromo from './NewsletterPromo'

// Brand-styled elements and custom blocks made available to every article's
// MDX. Headings get ids from rehype-slug (for the table of contents and deep
// links). Custom blocks - KeyTakeaways and FAQ - give writing a consistent
// structure that also feeds SEO/AEO (snippets) and GEO (LLM extraction).

function KeyTakeaways({ children }: { children: ReactNode }) {
  return (
    <aside className="not-prose my-8 rounded-lg border border-hairline bg-surface-cream/60 p-6">
      <p className="mb-3 text-xs font-normal uppercase tracking-wide text-accent-ochre">
        Key takeaways
      </p>
      <div className="[&_ul]:m-0 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2 [&_li]:text-ink-700 [&_li]:leading-[1.55] [&_li:last-child]:mb-0">
        {children}
      </div>
    </aside>
  )
}

function FAQ({ question, children }: { question: string; children: ReactNode }) {
  return (
    <div className="not-prose border-t border-hairline py-5">
      <p className="mb-2 font-normal text-ink-900">{question}</p>
      <div className="text-ink-700 leading-[1.65]">{children}</div>
    </div>
  )
}

// A full-width illustration for an article or issue. Rounded, hairline-framed,
// responsive. Pass real pixel dimensions so next/image can reserve space.
function Figure({
  src,
  alt,
  caption,
  width = 1536,
  height = 1024,
}: {
  src: string
  alt: string
  caption?: string
  width?: number
  height?: number
}) {
  return (
    <figure className="not-prose my-10 sm:my-12">
      <div className="overflow-hidden rounded-2xl border border-hairline bg-white">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="(max-width: 768px) 100vw, 720px"
          className="h-auto w-full"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-[13px] leading-[1.5] text-ink-500">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

// A pull-quote "blob": a large quotation mark and oversized light text that
// breaks up a long run of body copy and lets the eye rest. Echo a strong line
// from the surrounding section rather than introducing a new claim.
function PullQuote({ children }: { children: ReactNode }) {
  return (
    <figure className="not-prose my-11 sm:my-14">
      <div className="relative overflow-hidden rounded-2xl bg-surface-cream/60 px-8 py-9 sm:px-12 sm:py-11">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-4 left-4 select-none font-serif text-[86px] leading-none text-primary/25 sm:text-[108px]"
        >
          &ldquo;
        </span>
        <p className="relative text-[22px] font-light leading-[1.4] tracking-[-0.3px] text-ink-900 sm:text-[27px]">
          {children}
        </p>
      </div>
    </figure>
  )
}

// A numberless "example output" card for the tool, mirroring the real report's
// language (five parameters, red flags, the fix to push for) without asserting
// an overall score, since a reader's own contract could land anywhere. A taste
// of the output, not the full report.
function SampleScorecard() {
  const rows = [
    {
      name: 'Performance accountability',
      flag: '15-day remedy, not real accountability',
      fix: 'Hold the final month’s payment until the quarterly target is met.',
    },
    {
      name: 'Payment vs. delivery',
      flag: 'Full retainer paid before delivery',
      fix: 'Hold back 30% until each quarter’s delivery is verified.',
    },
    {
      name: 'Data ownership',
      flag: 'No CRM-exportable data guaranteed',
      fix: 'Name every contact and record you keep, in export-ready format.',
    },
  ]
  return (
    <figure className="not-prose my-10 sm:my-12">
      <div className="rounded-2xl border border-hairline bg-white p-6 sm:p-7">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-ink-500">
          Example output
        </p>
        <p className="mb-5 text-[15px] font-light leading-[1.5] text-ink-700">
          Every contract comes back scored across five parameters, each with its red flags and the
          exact fix to push for.
        </p>
        <div className="divide-y divide-hairline">
          {rows.map((r) => (
            <div key={r.name} className="py-4 first:pt-0 last:pb-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-[15px] font-normal text-ink-900">{r.name}</span>
                <span className="rounded-pill bg-red-50 px-2.5 py-0.5 text-[12px] text-red-700">
                  {r.flag}
                </span>
              </div>
              <p className="text-[13px] leading-[1.5] text-ink-700">
                <span className="font-normal text-ink-900">Fix: </span>
                {r.fix}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-[12px] leading-[1.5] text-ink-500">
          Plus a plain-language verdict and your top three fixes, ranked.
        </p>
      </div>
    </figure>
  )
}

export const mdxComponents = {
  h2: (props: { children?: ReactNode; id?: string }) => (
    <h2
      id={props.id}
      className="mt-12 mb-4 scroll-mt-24 text-[24px] font-light leading-[1.2] tracking-tight text-ink-900"
    >
      {props.children}
    </h2>
  ),
  h3: (props: { children?: ReactNode; id?: string }) => (
    <h3
      id={props.id}
      className="mt-8 mb-3 scroll-mt-24 text-[19px] font-normal leading-snug text-ink-900"
    >
      {props.children}
    </h3>
  ),
  p: (props: { children?: ReactNode }) => (
    <p className="my-5 text-[17px] leading-[1.7] text-ink-700">{props.children}</p>
  ),
  ul: (props: { children?: ReactNode }) => (
    <ul className="my-5 list-disc pl-5 text-[17px] leading-[1.7] text-ink-700 marker:text-ink-500">
      {props.children}
    </ul>
  ),
  ol: (props: { children?: ReactNode }) => (
    <ol className="my-5 list-decimal pl-5 text-[17px] leading-[1.7] text-ink-700 marker:text-ink-500">
      {props.children}
    </ol>
  ),
  li: (props: { children?: ReactNode }) => <li className="mb-2 pl-1">{props.children}</li>,
  a: (props: { href?: string; children?: ReactNode }) => {
    const href = props.href ?? '#'
    const isInternal = href.startsWith('/') || href.startsWith('#')
    const className = 'text-primary underline underline-offset-2 transition-opacity hover:opacity-80'
    if (isInternal) {
      return (
        <Link href={href} className={className}>
          {props.children}
        </Link>
      )
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {props.children}
      </a>
    )
  },
  strong: (props: { children?: ReactNode }) => (
    <strong className="font-normal text-ink-900">{props.children}</strong>
  ),
  blockquote: (props: { children?: ReactNode }) => (
    <blockquote className="my-6 border-l-2 border-primary/40 pl-5 text-[18px] italic leading-[1.6] text-ink-700">
      {props.children}
    </blockquote>
  ),
  hr: () => <hr className="my-10 border-hairline" />,
  code: (props: { children?: ReactNode }) => (
    <code className="rounded-xs bg-surface-soft px-1.5 py-0.5 text-[15px] text-ink-900">
      {props.children}
    </code>
  ),
  KeyTakeaways,
  FAQ,
  NewsletterPromo,
  Figure,
  PullQuote,
  SampleScorecard,
}
