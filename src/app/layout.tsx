import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import Script from 'next/script'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Jaydip Sikdar — CMO & Marketing Strategist | Free Tools & Frameworks',
  description:
    '20-year CMO (IBM, Adobe, MoEngage) who also builds free marketing tools for marketers, solopreneurs, and consultants. Strategy, frameworks, and practical resources.',
  metadataBase: new URL('https://jaydipsikdar.com'),
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Jaydip Sikdar — CMO & Marketing Strategist | Free Tools & Frameworks',
    description:
      '20-year CMO (IBM, Adobe, MoEngage) who also builds free marketing tools for marketers, solopreneurs, and consultants. Strategy, frameworks, and practical resources.',
    url: 'https://jaydipsikdar.com',
    siteName: 'Jaydip Sikdar',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jaydip Sikdar — CMO & Marketing Strategist | Free Tools & Frameworks',
    description:
      '20-year CMO (IBM, Adobe, MoEngage) who also builds free marketing tools for marketers, solopreneurs, and consultants. Strategy, frameworks, and practical resources.',
  },
  verification: {
    google: 'fSn7ta_cQWI0HUqg6ocgHDjAapiL9X-6YZ4RNp_FCm0',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* GA4 — Google Analytics 4 — Measurement ID: G-V5X6DHSLD7 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-V5X6DHSLD7"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-V5X6DHSLD7');
          `}
        </Script>
      </head>
      <body className="bg-brand-bg text-brand-text font-sans antialiased flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
