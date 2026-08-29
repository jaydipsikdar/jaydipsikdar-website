import Link from 'next/link'
import Eyebrow from './ui/Eyebrow'
import Card from './ui/Card'
import GuideSignupForm from './GuideSignupForm'
import type { Guide } from '@/lib/guides'

export default function GuideLanding({ guide }: { guide: Guide }) {
  return (
    <main className="px-6 py-16 md:py-20 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 lg:gap-14 items-start">
        {/* Left — the pitch */}
        <div>
          <Eyebrow className="mb-4">{guide.eyebrow}</Eyebrow>
          <h1 className="text-[34px] md:text-[40px] font-light tracking-[-0.8px] leading-[1.08] text-ink-900 mb-5">
            {guide.title}
          </h1>
          <p className="text-lg text-ink-700 leading-[1.5] mb-10 max-w-xl">{guide.subtitle}</p>

          <div className="space-y-4 mb-12 max-w-xl">
            {guide.intro.map((para, i) => (
              <p key={i} className="text-ink-700 leading-[1.6]">
                {para}
              </p>
            ))}
          </div>

          <h2 className="text-xl font-light text-ink-900 mb-5">{guide.whatsInsideHeading}</h2>
          <ul className="space-y-4 max-w-xl">
            {guide.whatsInside.map((item) => (
              <li key={item.label} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-[9px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"
                />
                <span className="text-ink-700 leading-[1.5]">
                  <span className="text-ink-900 font-normal">{item.label}.</span> {item.detail}
                </span>
              </li>
            ))}
          </ul>

          {guide.proof && (
            <p className="mt-10 max-w-xl border-l-2 border-primary/40 pl-4 text-sm italic text-ink-500 leading-[1.5]">
              {guide.proof}
            </p>
          )}
        </div>

        {/* Right — the gate */}
        <div className="lg:sticky lg:top-24">
          <Card elevation={1}>
            <h2 className="text-lg font-light text-ink-900 mb-2">{guide.form.heading}</h2>
            <p className="text-sm text-ink-700 leading-[1.4] mb-5">{guide.form.subcopy}</p>
            <GuideSignupForm
              source={guide.source}
              pdfHref={guide.pdfHref}
              copy={guide.form}
            />
            <p className="mt-4 text-xs text-ink-500">Free. No spam. Unsubscribe anytime.</p>
          </Card>
        </div>
      </div>

      {/* Cross-sell */}
      <section className="mt-20 pt-12 border-t border-hairline">
        <h2 className="text-xl font-light text-ink-900 mb-6">{guide.crossSellHeading}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {guide.crossSell.map((item) => {
            const inner = (
              <>
                <h3 className="text-base font-normal text-ink-900 mb-2">{item.label}</h3>
                <p className="text-sm text-ink-700 leading-[1.45]">{item.description}</p>
              </>
            )
            const className =
              'block h-full rounded-lg border border-hairline bg-white p-6 transition-shadow duration-150 ease-out hover:shadow-2'
            return item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {inner}
              </a>
            ) : (
              <Link key={item.label} href={item.href} className={className}>
                {inner}
              </Link>
            )
          })}
        </div>
      </section>
    </main>
  )
}
