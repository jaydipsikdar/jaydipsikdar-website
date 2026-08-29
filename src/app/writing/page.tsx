import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { getAllArticles } from '@/lib/writing'

export const metadata: Metadata = {
  title: 'Writing | Jaydeepp Sikdar',
  description:
    'Essays and practical thinking on GTM strategy, marketing problems, the consulting craft, and building AI tools that solve real marketing and go-to-market problems.',
  openGraph: {
    title: 'Writing | Jaydeepp Sikdar',
    description:
      'Essays and practical thinking on GTM strategy, marketing problems, the consulting craft, and building AI tools that solve real marketing and go-to-market problems.',
    url: 'https://jaydipsikdar.com/writing',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Writing | Jaydeepp Sikdar',
    description:
      'Essays and practical thinking on GTM strategy, marketing problems, and building AI tools that solve real marketing problems.',
  },
  alternates: { canonical: '/writing' },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function WritingIndexPage() {
  const articles = getAllArticles()

  return (
    <main className="mx-auto max-w-3xl px-6 py-20">
      <header className="mb-14">
        <h1 className="text-[32px] font-light leading-[1.1] tracking-[-0.64px] text-ink-900">
          Writing
        </h1>
        <p className="mt-4 max-w-xl text-ink-700 leading-[1.6]">
          Essays and practical thinking on GTM strategy, marketing problems, the consulting craft,
          and building AI tools that solve real go-to-market problems.
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="text-ink-500">The first piece is coming soon.</p>
      ) : (
        <ul className="divide-y divide-hairline">
          {articles.map((a) => (
            <li key={a.slug} className="py-8 first:pt-0">
              <article>
                <div className="mb-2 flex items-center gap-3 text-xs text-ink-500">
                  <time dateTime={a.date}>{formatDate(a.date)}</time>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={13} strokeWidth={1.75} />
                    {a.readingMinutes} min read
                  </span>
                </div>
                <h2 className="text-[22px] font-light leading-snug tracking-tight text-ink-900">
                  <Link href={`/writing/${a.slug}`} className="transition-colors hover:text-primary">
                    {a.title}
                  </Link>
                </h2>
                <p className="mt-2 text-ink-700 leading-[1.6]">{a.description}</p>
                {a.tags && a.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {a.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-pill bg-surface-soft px-3 py-1 text-xs text-ink-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
