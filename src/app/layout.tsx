import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en">
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
      <body className="bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
