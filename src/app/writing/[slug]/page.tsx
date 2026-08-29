import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { ArrowLeft, Clock } from 'lucide-react'
import { getArticle, getPublishedSlugs } from '@/lib/writing'
import { buildSpeechText } from '@/lib/articleSpeech'
import { mdxComponents } from '@/components/writing/mdxComponents'
import AuthorBio from '@/components/writing/AuthorBio'
import TableOfContents from '@/components/writing/TableOfContents'
import EngagementBar from '@/components/writing/EngagementBar'
import ArticleAudioPlayer from '@/components/writing/ArticleAudioPlayer'

const SITE = 'https://jaydipsikdar.com'
const AUTHOR = 'Jaydeepp Sikdar'
const DEFAULT_OG = '/images/jaydip-sikdar.png'

export function generateStaticParams() {
  return getPublishedSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article || article.published === false) return { title: 'Not found' }

  const url = `${SITE}/writing/${slug}`
  const ogImage = article.ogImage ?? DEFAULT_OG
  return {
    title: `${article.title} | ${AUTHOR}`,
    description: article.description,
    alternates: { canonical: `/writing/${slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      type: 'article',
      publishedTime: article.date,
      modifiedTime: article.updated ?? article.date,
      authors: [`${SITE}/about`],
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
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

// Pull FAQ question/answer pairs out of the raw MDX to build FAQPage schema.
// The answer text is stripped of tags so search/answer engines get clean text.
function extractFaqs(raw: string): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = []
  const re = /<FAQ\s+question="([^"]+)">([\s\S]*?)<\/FAQ>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(raw)) !== null) {
    const answer = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    faqs.push({ question: m[1].trim(), answer })
  }
  return faqs
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article || article.published === false) notFound()

  const url = `${SITE}/writing/${slug}`
  const faqs = extractFaqs(article.content)

  const { content } = await compileMDX({
    source: article.content,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
      mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] },
    },
  })

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.updated ?? article.date,
    author: { '@type': 'Person', name: AUTHOR, url: SITE },
    publisher: { '@type': 'Person', name: AUTHOR, url: SITE },
    image: `${SITE}${article.ogImage ?? DEFAULT_OG}`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: (article.tags ?? []).join(', '),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Writing', item: `${SITE}/writing` },
      { '@type': 'ListItem', position: 3, name: article.title, item: url },
    ],
  }

  const faqJsonLd =
    faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
          })),
        }
      : null

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
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_240px]">
        {/* Left - the reading column */}
        <div className="min-w-0">
          <Link
            href="/writing"
            className="inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-primary"
          >
            <ArrowLeft size={15} strokeWidth={1.75} />
            All writing
          </Link>

          <header className="mt-6">
            {article.tags && article.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-pill bg-surface-soft px-3 py-1 text-xs text-ink-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <h1 className="text-[34px] font-light leading-[1.15] tracking-[-0.7px] text-ink-900">
              {article.title}
            </h1>
            <div className="mt-4 flex items-center gap-3 text-sm text-ink-500">
              <time dateTime={article.date}>{formatDate(article.date)}</time>
              <span className="inline-flex items-center gap-1">
                <Clock size={14} strokeWidth={1.75} />
                {article.readingMinutes} min read
              </span>
            </div>
          </header>

          <div className="mt-6 max-w-[720px]">
            <ArticleAudioPlayer text={buildSpeechText(article.title, article.content)} />
          </div>

          <article className="max-w-[720px]">{content}</article>

          <hr className="my-10 border-hairline" />
          <EngagementBar slug={slug} title={article.title} url={url} />

          {/* Author card on mobile (sidebar hides below lg) */}
          <div className="mt-10 lg:hidden">
            <AuthorBio />
          </div>
        </div>

        {/* Right - sticky sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-8">
            <TableOfContents headings={article.headings} />
            <AuthorBio />
          </div>
        </aside>
      </div>
    </main>
  )
}
