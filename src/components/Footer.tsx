import Link from 'next/link'
import { Music, Mic, Video, Link as LinkIcon } from 'lucide-react'

const LINKEDIN_URL = 'https://www.linkedin.com/in/jaydipsikdar/'

const siteLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/resources', label: 'Resources' },
  { href: '/contact', label: 'Contact' },
]

const podcastLinks = [
  {
    href: 'https://open.spotify.com/show/0BNFOPu4roOCLSdM1sjWUN?si=60dfc28201554a8e',
    label: 'Spotify',
    icon: Music,
  },
  {
    href: 'https://podcasts.apple.com/us/podcast/the-marketing-couch/id1809552287',
    label: 'Apple Podcasts',
    icon: Mic,
  },
  {
    href: 'https://www.youtube.com/watch?v=YWkJzI8xfVc&list=PLDRiPzpWfnc4u3YA9vBK41tOYIwAm0Csl',
    label: 'YouTube',
    icon: Video,
  },
]

export default function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-hairline bg-white">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div>
            <p className="font-sans text-lg font-light text-ink-900">Jaydip Sikdar</p>
            <p className="mt-2 max-w-xs text-sm text-ink-500">
              Fractional CMO and marketing consultant, building free tools and frameworks from
              20 years in the seat.
            </p>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm text-ink-700 transition-colors hover:text-primary"
            >
              <LinkIcon size={16} strokeWidth={1.5} />
              LinkedIn
            </a>
          </div>

          <div className="flex flex-wrap gap-16">
            <div>
              <p className="text-[10px] font-normal uppercase tracking-[0.1px] text-ink-500">Site</p>
              <ul className="mt-4 flex flex-col gap-3">
                {siteLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-ink-700 transition-colors hover:text-primary">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-normal uppercase tracking-[0.1px] text-ink-500">
                The Marketing Couch
              </p>
              <ul className="mt-4 flex flex-col gap-3">
                {podcastLinks.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-ink-700 transition-colors hover:text-primary"
                    >
                      <Icon size={16} strokeWidth={1.5} />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col-reverse items-center justify-between gap-4 border-t border-hairline pt-6 md:flex-row">
          <p className="text-sm text-ink-500">© 2026 Jaydip Sikdar</p>
          <p className="text-xs text-ink-500">Unstoppable Sprints</p>
        </div>
      </div>
    </footer>
  )
}
