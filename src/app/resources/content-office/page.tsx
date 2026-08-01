import type { Metadata } from 'next'
import ContentOfficeFlow from '@/components/ContentOfficeFlow'

export const metadata: Metadata = {
  title: "Jaydeepp's Content Office | jaydipsikdar.com",
  description:
    'Your content system, built from five questions. Get a personalized content matrix: topics mapped to themes, structures, and channels.',
}

export default function ContentOfficePage() {
  return (
    <main className="px-6 py-20 max-w-2xl mx-auto bg-white">
      <ContentOfficeFlow />
    </main>
  )
}
