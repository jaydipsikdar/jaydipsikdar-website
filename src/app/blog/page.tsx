import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — Jaydip Sikdar',
  description:
    'Marketing strategy, GTM, positioning, and B2B growth — written for founders, marketers, and consultants.',
}

export default function BlogPage() {
  return (
    <main className="px-6 py-20 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-10">Blog</h1>

      {/* ============================================================
          SANITY CMS — NOT YET CONNECTED
          Posts will be fetched from Sanity once the schema is set up.
          TODO (next build step):
            1. Set up Sanity project + schema (post type: title, slug, body, date, excerpt)
            2. Install @sanity/client
            3. Replace this placeholder with a fetch + post list render
          ============================================================ */}
      <div className="border-2 border-dashed border-gray-300 rounded p-10 text-center text-gray-400">
        <p className="text-sm">Blog posts will appear here once Sanity CMS is connected.</p>
      </div>
    </main>
  )
}
