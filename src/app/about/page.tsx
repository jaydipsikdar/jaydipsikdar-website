import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Eyebrow from '@/components/ui/Eyebrow'

export const metadata: Metadata = {
  title: 'About - Jaydeepp Sikdar',
  description:
    "I build and test what works in marketing and share everything I learn. 20 years across IBM, Adobe, Cisco, and MoEngage, now building free marketing tools and advising AI startups as CMO.",
  alternates: {
    canonical: '/about',
  },
}

const linkClasses = 'text-primary transition-colors hover:text-primary-hover'

export default function AboutPage() {
  return (
    <main className="px-6 py-20 max-w-2xl mx-auto">
      <Eyebrow className="mb-4">ABOUT</Eyebrow>
      <h1 className="text-[32px] font-light tracking-[-0.64px] leading-[1.1] text-ink-900 mb-10">
        I build and test what works in marketing and share everything I learn.
      </h1>

      <Image
        src="/images/jaydip-sikdar.png"
        alt="Jaydeepp Sikdar"
        width={150}
        height={150}
        className="rounded-pill mb-10 object-cover"
        priority
      />

      <div className="space-y-5 text-ink-700 text-lg leading-[1.4]">
        <p>Right now, that means three things.</p>
        <p>
          I&apos;m building a set of free, interactive marketing tools at{' '}
          <Link href="/" className={linkClasses}>jaydipsikdar.com</Link>. A{' '}
          <Link href="/resources/vendor-contract-assessment" className={linkClasses}>
            vendor contract assessment
          </Link>{' '}
          that scores your agency deal clause by clause. A{' '}
          <Link href="/resources/marketing-advisor" className={linkClasses}>
            marketing decision advisor
          </Link>{' '}
          built on patterns from 200+ CMO conversations. A{' '}
          <Link href="/resources/marketing-maturity-score" className={linkClasses}>
            marketing maturity scorecard
          </Link>
          . A{' '}
          <Link href="/resources/content-office" className={linkClasses}>
            content strategy workspace
          </Link>
          . Each one solves a specific problem in minutes. More are coming.
        </p>
        <p>
          I write{' '}
          <Link href="/newsletter" className={linkClasses}>The Workbench</Link>, a weekly
          newsletter: one build, one lesson, one thing you can use today. And I host The Marketing
          Couch, a podcast with 21 conversations (so far) with B2B marketing, product, sales, and
          CS leaders about how they actually make decisions.
        </p>
        <p>
          <strong className="font-normal">The backstory:</strong> 20 years of marketing across
          enterprise tech and high-growth startups. IBM, Adobe, Cisco, MoEngage. I ran portfolio
          marketing at IBM across five countries, led growth and customer success at Adobe across
          Americas, EMEA, and APAC, and led customer success at MoEngage for India. Across those
          roles, I worked with 200+ CMOs and kept seeing the same problems repeat (positioning
          gaps, vendor misalignment, launch blind spots) regardless of company size.
        </p>
        <p>
          I also work as a consulting CMO for AI and B2B SaaS startups, building the marketing
          function and hiring the team to run it after I leave.
        </p>
        <p>
          I guest-lecture on marketing strategy at business schools across India, including Christ
          University, PES University, Amity University, and FORE School of Management.
        </p>
        <div className="pt-4">
          <Button href="/resources">Explore the tools</Button>
        </div>
      </div>
    </main>
  )
}
