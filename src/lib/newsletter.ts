import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

// The Newsletter section's content layer. Each issue of The Workbench lives as
// an .mdx file in src/content/newsletter/ - normal prose with a small
// frontmatter header. This module reads them at build time so the /newsletter
// archive and each hosted issue page render statically. To publish a new issue,
// drop an .mdx file in that folder; no code changes needed. Mirrors the shape
// of src/lib/writing.ts on purpose so the two sections stay consistent.

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'newsletter')

export type IssueFrontmatter = {
  /** Sequential issue number, shown as "Issue 1". */
  number: number
  title: string
  description: string
  /** ISO date, e.g. '2026-09-01'. Drives ordering and the visible date. */
  date: string
  /** Set false to keep a file in the repo without publishing it. */
  published?: boolean
  /** When true, an unpublished issue is still LISTED in the archive (for
   *  review), but stays noindex and out of the sitemap. Ignored once
   *  published is true. */
  preview?: boolean
  /** Optional social share image path under /public. */
  ogImage?: string
}

export type IssueMeta = IssueFrontmatter & {
  slug: string
  readingMinutes: number
}

export type Issue = IssueMeta & {
  /** Raw MDX body (frontmatter stripped), compiled by the issue page. */
  content: string
}

function readIssueFile(slug: string): Issue | null {
  const fullPath = path.join(CONTENT_DIR, `${slug}.mdx`)
  if (!fs.existsSync(fullPath)) return null

  const raw = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(raw)
  const fm = data as IssueFrontmatter

  return {
    slug,
    number: fm.number,
    title: fm.title,
    description: fm.description,
    date: fm.date,
    published: fm.published ?? true,
    preview: fm.preview ?? false,
    ogImage: fm.ogImage,
    readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
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

function sortedMeta(filter: (i: Issue) => boolean): IssueMeta[] {
  return allSlugs()
    .map(readIssueFile)
    .filter((i): i is Issue => i !== null && filter(i))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .map(({ content: _content, ...meta }) => meta)
}

/** Published issues only - for the sitemap and search index. */
export function getPublishedIssues(): IssueMeta[] {
  return sortedMeta((i) => i.published !== false)
}

/** Issues shown on the /newsletter archive: published ones, plus unpublished
 *  ones flagged `preview: true` (visible for review, but kept noindex and out
 *  of the sitemap). Newest first. */
export function getListedIssues(): IssueMeta[] {
  return sortedMeta((i) => i.published !== false || i.preview === true)
}

/** A single issue by slug, or null. Returns unpublished files too so a direct
 *  preview link works; callers gate on `published` where needed. */
export function getIssue(slug: string): Issue | null {
  return readIssueFile(slug)
}

/** Slugs for generateStaticParams - published only. */
export function getPublishedIssueSlugs(): string[] {
  return getPublishedIssues().map((i) => i.slug)
}
