'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { X, Menu } from 'lucide-react'
import Button from '@/components/ui/Button'

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/resources', label: 'Resources' },
  { href: '/writing', label: 'Writing' },
  { href: '/newsletter', label: 'Newsletter' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

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

  // Translucent-blur treatment once the page scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav
        className={`sticky top-0 z-40 w-full transition-colors duration-150 ease-out ${
          scrolled ? 'bg-white/85 backdrop-blur-md border-b border-hairline' : 'bg-white border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          <Link href="/" className="shrink-0 transition-opacity hover:opacity-80">
            <Image
              src="/images/jaydeepp-sikdar-logo.png"
              alt="Jaydeepp Sikdar"
              width={200}
              height={50}
              priority
              className="h-12 w-auto"
            />
          </Link>

          <ul className="hidden md:flex md:absolute md:left-1/2 md:-translate-x-1/2 items-center gap-8">
            {links.map(({ href, label }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`font-sans text-sm font-light transition-colors ${
                      isActive ? 'text-primary' : 'text-ink-700 hover:text-primary'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="hidden md:block">
            <Button href="/contact" size="sm">
              Book a call
            </Button>
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center text-ink-900 md:hidden"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white" style={{ animation: 'fadeIn 0.15s ease-out' }}>
          <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
            <Link href="/" onClick={() => setMenuOpen(false)}>
              <Image
                src="/images/jaydeepp-sikdar-logo.png"
                alt="Jaydeepp Sikdar"
                width={160}
                height={40}
                className="h-12 w-auto"
              />
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="flex h-10 w-10 items-center justify-center text-ink-900"
            >
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>

          <ul className="flex flex-col gap-8 px-6 pt-10">
            {links.map(({ href, label }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={`font-sans text-2xl font-light tracking-tight transition-colors ${
                      isActive ? 'text-primary' : 'text-ink-900 hover:text-primary'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="mt-auto px-6 pb-10">
            <Button href="/contact" className="w-full">
              Book a call
            </Button>
          </div>
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
