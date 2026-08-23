import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import GuideLanding from '@/components/GuideLanding'
import { getAllGuideSlugs, getGuide } from '@/lib/guides'

// Only the guide slugs in the registry render here. Everything else 404s, so
// this dynamic segment never shadows the hand-built tool pages that sit
// alongside it under /resources.
export const dynamicParams = false

export function generateStaticParams() {
  return getAllGuideSlugs().map((guideSlug) => ({ guideSlug }))
}

type Params = { guideSlug: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { guideSlug } = await params
  const guide = getGuide(guideSlug)
  if (!guide) return {}

  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.metaTitle,
      description: guide.metaDescription,
    },
    alternates: {
      canonical: `/resources/${guide.slug}`,
    },
  }
}

export default async function GuidePage({ params }: { params: Promise<Params> }) {
  const { guideSlug } = await params
  const guide = getGuide(guideSlug)
  if (!guide) notFound()

  return <GuideLanding guide={guide} />
}
