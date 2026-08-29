import { getAllArticles } from '@/lib/writing'

export const dynamic = 'force-static'

const SITE = 'https://jaydipsikdar.com'

function escapeXml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// RSS feed of the Writing section, so readers (and some answer engines) can
// follow new pieces without email. Regenerated on each build/publish.
export function GET() {
  const articles = getAllArticles()
  const updated = articles[0]?.date ?? new Date().toISOString()

  const items = articles
    .map(
      (a) => `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${SITE}/writing/${a.slug}</link>
      <guid>${SITE}/writing/${a.slug}</guid>
      <pubDate>${new Date(a.date).toUTCString()}</pubDate>
      <description>${escapeXml(a.description)}</description>
    </item>`
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Jaydeepp Sikdar - Writing</title>
    <link>${SITE}/writing</link>
    <description>Essays on GTM strategy, marketing, and building AI tools that solve real problems.</description>
    <language>en</language>
    <lastBuildDate>${new Date(updated).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
