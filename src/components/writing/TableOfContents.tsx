import type { Heading } from '@/lib/writing'

// Static table of contents for the sidebar. Anchors match the ids rehype-slug
// puts on the headings, so clicks jump to the section. Only shows when there
// are at least a couple of H2s worth navigating.

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const items = headings.filter((h) => h.level === 2)
  if (items.length < 2) return null

  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="mb-3 text-xs font-normal uppercase tracking-wide text-ink-500">On this page</p>
      <ul className="space-y-2 border-l border-hairline">
        {items.map((h) => (
          <li key={h.slug}>
            <a
              href={`#${h.slug}`}
              className="-ml-px block border-l border-transparent pl-4 text-ink-700 transition-colors hover:border-primary hover:text-primary"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
