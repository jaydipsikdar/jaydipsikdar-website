import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { ArrowLeft, Clock } from 'lucide-react'
import { getIssue, getPublishedIssueSlugs } from '@/lib/newsletter'
import { mdxComponents } from '@/components/writing/mdxComponents'
import EngagementBar from '@/components/writing/EngagementBar'
import NewsletterSubscribeForm from '@/components/NewsletterSubscribeForm'
import Eyebrow from '@/components/ui/Eyebrow'

const SITE = 'https://jaydipsikdar.com'
const AUTHOR = 'Jaydeepp Sikdar'
const DEFAULT_OG = '/images/jaydip-sikdar.png'

export function generateStaticParams() {
  return getPublishedIssueSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const issue = getIssue(slug)
  if (!issue) return { title: 'Not found' }

  const url = `${SITE}/newsletter/${slug}`
  const ogImage = issue.ogImage ?? DEFAULT_OG
  return {
    title: `${issue.title} | The Workbench`,
    description: issue.description,
    // Keep unpublished drafts out of the index while a direct link still works.
    robots: issue.published === false ? { index: false, follow: false } : undefined,
    alternates: { canonical: `/newsletter/${slug}` },
    openGraph: {
      title: issue.title,
      description: issue.description,
      url,
      type: 'article',
      publishedTime: issue.date,
      authors: [`${SITE}/about`],
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: issue.title,
      description: issue.description,
      images: [ogImage],
    },
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function IssuePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const issue = getIssue(slug)
  // An unpublished issue still renders via a direct link (for review), but it is
  // never listed in the archive, generateStaticParams, or the sitemap.
  if (!issue) notFound()

  const url = `${SITE}/newsletter/${slug}`

  // Section titles ("One build", "One lesson", "One insight") are the only h2s in
  // an issue. Recolor just those to the brand deep orange, reusing the shared h2
  // styling so Writing articles keep their default ink heading color.
  const issueComponents = {
    ...mdxComponents,
    h2: (props: { children?: ReactNode; id?: string }) => (
      <h2
        id={props.id}
        className="mt-12 mb-4 scroll-mt-24 text-[24px] font-light leading-[1.2] tracking-tight text-primary"
      >
        {props.children}
      </h2>
    ),
  }

  const { content } = await compileMDX({
    source: issue.content,
    components: issueComponents,
    options: {
      parseFrontmatter: false,
      mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] },
    },
  })

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: issue.title,
    description: issue.description,
    datePublished: issue.date,
    author: { '@type': 'Person', name: AUTHOR, url: SITE },
    publisher: { '@type': 'Person', name: AUTHOR, url: SITE },
    image: `${SITE}${issue.ogImage ?? DEFAULT_OG}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    isPartOf: { '@type': 'CreativeWorkSeries', name: 'The Workbench', url: `${SITE}/newsletter` },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'The Workbench', item: `${SITE}/newsletter` },
      { '@type': 'ListItem', position: 3, name: issue.title, item: url },
    ],
  }

  return (
    <main className="px-6 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="mx-auto max-w-[720px]">
        <Link
          href="/newsletter"
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-primary"
        >
          <ArrowLeft size={15} strokeWidth={1.75} />
          All issues
        </Link>

        <header className="mt-6">
          <Eyebrow className="mb-4">THE WORKBENCH · ISSUE {issue.number}</Eyebrow>
          <h1 className="text-[34px] font-light leading-[1.15] tracking-[-0.7px] text-ink-900">
            {issue.title}
          </h1>
          <div className="mt-4 flex items-center gap-3 text-sm text-ink-500">
            <time dateTime={issue.date}>{formatDate(issue.date)}</time>
            <span className="inline-flex items-center gap-1">
              <Clock size={14} strokeWidth={1.75} />
              {issue.readingMinutes} min read
            </span>
          </div>
        </header>

        <article className="mt-6">{content}</article>

        <hr className="my-10 border-hairline" />
        <EngagementBar slug={slug} title={issue.title} url={url} />

        {/* Closing capture: an on-site reader who is not yet subscribed joins the
            combined newsletter + writing list here. */}
        <section className="mt-14 rounded-lg border border-primary/30 bg-primary-subtle/25 p-6 sm:p-8">
          <p className="mb-1 text-lg font-light text-ink-900">
            Get the next issue in your inbox
          </p>
          <p className="mb-5 text-sm leading-[1.5] text-ink-700">
            One build, one lesson, one insight, every alternate week. An essay the weeks
            between. Unsubscribe anytime.
          </p>
          <NewsletterSubscribeForm id="newsletter-issue-subscribe" />
        </section>
      </div>
    </main>
  )
}
