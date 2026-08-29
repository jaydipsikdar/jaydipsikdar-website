import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

// The Writing section's content layer. Articles live as .mdx files in
// src/content/writing/ - each is a normal prose file with a small frontmatter
// header. This module reads them at build time so the listing page and each
// article page render statically. To publish a new article, drop a .mdx file
// in that folder; no code changes needed.

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'writing')

export type ArticleFrontmatter = {
  title: string
  description: string
  /** ISO date, e.g. '2026-09-01'. Drives ordering and the visible date. */
  date: string
  /** ISO date of a later meaningful revision, if any. */
  updated?: string
  /** Topic tags, shown as chips and used for related-article grouping. */
  tags?: string[]
  /** Set false to keep a file in the repo without publishing it. */
  published?: boolean
  /** Optional social share image path under /public. */
  ogImage?: string
}

export type Heading = { level: 2 | 3; text: string; slug: string }

export type ArticleMeta = ArticleFrontmatter & {
  slug: string
  readingMinutes: number
  headings: Heading[]
}

export type Article = ArticleMeta & {
  /** Raw MDX body (frontmatter stripped), compiled by the article page. */
  content: string
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

// Pulls ## and ### headings straight from the raw markdown for the table of
// contents. Skips fenced code blocks so a "## " inside code isn't mistaken
// for a heading.
function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = []
  let inFence = false
  for (const line of markdown.split('\n')) {
    if (line.trim().startsWith('```')) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const match = /^(#{2,3})\s+(.*)$/.exec(line)
    if (!match) continue
    const level = match[1].length as 2 | 3
    const text = match[2].replace(/[#*`]/g, '').trim()
    headings.push({ level, text, slug: slugifyHeading(text) })
  }
  return headings
}

function readArticleFile(slug: string): Article | null {
  const fullPath = path.join(CONTENT_DIR, `${slug}.mdx`)
  if (!fs.existsSync(fullPath)) return null

  const raw = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(raw)
  const fm = data as ArticleFrontmatter

  return {
    slug,
    title: fm.title,
    description: fm.description,
    date: fm.date,
    updated: fm.updated,
    tags: fm.tags ?? [],
    published: fm.published ?? true,
    ogImage: fm.ogImage,
    readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
    headings: extractHeadings(content),
    content,
  }
}

function allSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return []
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
}

/** Every published article, newest first - for the listing, sitemap, and RSS. */
export function getAllArticles(): ArticleMeta[] {
  return allSlugs()
    .map(readArticleFile)
    .filter((a): a is Article => a !== null && a.published !== false)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(({ content: _content, ...meta }) => meta)
}

/** A single article by slug, or null. Returns unpublished files too so a
 *  direct preview link works; callers gate on `published` where needed. */
export function getArticle(slug: string): Article | null {
  return readArticleFile(slug)
}

/** Slugs for generateStaticParams - published only. */
export function getPublishedSlugs(): string[] {
  return getAllArticles().map((a) => a.slug)
}
