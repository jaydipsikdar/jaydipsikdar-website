import type { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/writing'
import { getPublishedIssues } from '@/lib/newsletter'
import { GUIDES } from '@/lib/guides'

const SITE = 'https://jaydipsikdar.com'

// The sitemap Google (and answer engines) crawl. Static pages + tools are
// listed explicitly; Writing articles and guides are pulled from their
// registries so new content shows up automatically.
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    '',
    '/about',
    '/resources',
    '/resources/marketing-maturity-score',
    '/resources/marketing-advisor',
    '/resources/vendor-contract-assessment',
    '/resources/content-office',
    '/newsletter',
    '/writing',
    '/contact',
  ]

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${SITE}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: path === '' ? 1 : 0.7,
  }))

  const articleEntries: MetadataRoute.Sitemap = getAllArticles().map((a) => ({
    url: `${SITE}/writing/${a.slug}`,
    lastModified: new Date(a.updated ?? a.date),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const issueEntries: MetadataRoute.Sitemap = getPublishedIssues().map((i) => ({
    url: `${SITE}/newsletter/${i.slug}`,
    lastModified: new Date(i.date),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const guideEntries: MetadataRoute.Sitemap = Object.values(GUIDES).map((g) => ({
    url: `${SITE}/resources/${g.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticEntries, ...articleEntries, ...issueEntries, ...guideEntries]
}
