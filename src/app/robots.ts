import type { MetadataRoute } from 'next'

const SITE = 'https://jaydipsikdar.com'

// Allow everything (including AI crawlers) and point to the sitemap. Answer
// and generative engines are welcome - being cited is the goal.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  }
}
