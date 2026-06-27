import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
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
  title: 'Jaydip Sikdar — Fractional CMO & B2B Marketing Consultant',
  description:
    'Jaydip Sikdar is a Fractional CMO and B2B marketing consultant with 20+ years of experience at IBM, Adobe, and MoEngage. He helps early-stage startup founders build their marketing engine.',
  metadataBase: new URL('https://jaydipsikdar.com'),
  openGraph: {
    title: 'Jaydip Sikdar — Fractional CMO & B2B Marketing Consultant',
    description:
      'Jaydip Sikdar helps early-stage startup founders build their marketing engine — from positioning and go-to-market to demand generation and customer advocacy.',
    url: 'https://jaydipsikdar.com',
    siteName: 'Jaydip Sikdar',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jaydip Sikdar — Fractional CMO & B2B Marketing Consultant',
    description:
      'Fractional CMO. 20+ years at IBM, Adobe, MoEngage. Helping startup founders build their marketing engine.',
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
        {/*
         * GA4 — Google Analytics 4
         * Add the two <Script> tags here once you have the Measurement ID.
         * Steps:
         *   1. Go to analytics.google.com (use unstoppable.club Workspace login)
         *   2. Create account → property (jaydipsikdar.com) → web data stream
         *   3. Copy the Measurement ID (format: G-XXXXXXXXXX)
         *   4. Replace GA_MEASUREMENT_ID below and uncomment both Script tags
         *
         * import Script from 'next/script'
         *
         * <Script
         *   src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
         *   strategy="afterInteractive"
         * />
         * <Script id="ga4-init" strategy="afterInteractive">
         *   {`
         *     window.dataLayer = window.dataLayer || [];
         *     function gtag(){dataLayer.push(arguments);}
         *     gtag('js', new Date());
         *     gtag('config', 'GA_MEASUREMENT_ID');
         *   `}
         * </Script>
         */}
      </head>
      <body className="bg-brand-bg text-brand-text font-sans antialiased flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
