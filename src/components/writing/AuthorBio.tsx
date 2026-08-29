import Image from 'next/image'
import Link from 'next/link'
import { LinkedinIcon } from './BrandIcons'

// Compact author card for the article sidebar (and foot of the page on
// mobile). Keeps the E-E-A-T author signal visible next to the writing.

export default function AuthorBio() {
  return (
    <div className="rounded-lg border border-hairline bg-white p-6">
      <div className="flex items-center gap-4">
        <Image
          src="/images/jaydip-sikdar.png"
          alt="Jaydeepp Sikdar"
          width={56}
          height={56}
          className="h-14 w-14 rounded-full object-cover"
        />
        <div>
          <p className="text-ink-900 font-normal leading-tight">Jaydeepp Sikdar</p>
          <p className="text-ink-500 text-sm leading-tight">CMO · AI Builder · Educator</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-ink-700 leading-[1.5]">
        20 years solving marketing and GTM problems at IBM, Adobe, MoEngage, and dozens of tech
        startups. I write about GTM strategy and build AI tools that solve real marketing problems.
      </p>

      <div className="mt-4 flex items-center gap-3">
        <a
          href="https://www.linkedin.com/in/jaydipsikdar/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Jaydeepp Sikdar on LinkedIn"
          className="text-ink-500 transition-colors hover:text-primary"
        >
          <LinkedinIcon className="h-5 w-5" />
        </a>
        <span className="text-hairline">·</span>
        <Link href="/contact" className="text-sm text-primary transition-opacity hover:opacity-80">
          Work with me →
        </Link>
      </div>
    </div>
  )
}
