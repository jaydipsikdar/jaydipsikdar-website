import type { ReactNode } from 'react'
import Link from 'next/link'
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
}
