'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/resources', label: 'Resources' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <nav className="w-full bg-brand-bg border-b border-gray-200 relative z-40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Brand name */}
          <Link
            href="/"
            className="font-serif text-lg text-brand-text hover:text-brand-accent transition-colors"
          >
            Jaydip Sikdar
          </Link>

          {/* Desktop nav links — hidden on mobile */}
          <ul className="hidden md:flex items-center gap-8">
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

          {/* Hamburger button — mobile only */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="md:hidden flex flex-col justify-center gap-1.5 p-1 text-brand-text"
          >
            <span className="block w-6 h-px bg-current" />
            <span className="block w-6 h-px bg-current" />
            <span className="block w-6 h-px bg-current" />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-brand-bg flex flex-col"
          style={{ animation: 'fadeIn 0.2s ease' }}
        >
          {/* Top bar: brand + close */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <Link
              href="/"
              className="font-serif text-lg text-brand-text"
              onClick={() => setMenuOpen(false)}
            >
              Jaydip Sikdar
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="text-brand-text p-1"
            >
              {/* × icon drawn with two lines */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="4" y1="4" x2="20" y2="20" />
                <line x1="20" y1="4" x2="4" y2="20" />
              </svg>
            </button>
          </div>

          {/* Nav links */}
          <ul className="flex flex-col px-6 pt-10 gap-8">
            {links.map(({ href, label }) => {
              const isActive =
                href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`font-serif text-2xl transition-colors ${
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
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  )
}
