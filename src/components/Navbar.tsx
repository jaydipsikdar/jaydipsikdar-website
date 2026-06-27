'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="w-full bg-brand-bg border-b border-gray-200">
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand name */}
        <Link
          href="/"
          className="font-serif text-lg text-brand-text hover:text-brand-accent transition-colors"
        >
          Jaydip Sikdar
        </Link>

        {/* Nav links */}
        <ul className="flex items-center gap-8">
          {links.map(({ href, label }) => {
            const isActive =
              href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`font-sans text-sm transition-colors ${
                    isActive
                      ? 'text-brand-accent'
                      : 'text-brand-text hover:text-brand-accent'
                  }`}
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
