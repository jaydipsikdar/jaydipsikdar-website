'use client'

import ContentMatrixCell from './ContentMatrixCell'
import { themeById, type ContentOfficeResult } from '@/lib/contentOfficeData'

export default function ContentOfficeResults({ result }: { result: ContentOfficeResult }) {
  const firstPillar = result.pillars[0]
  const previewPosts = result.starterSequence.slice(0, 3)
  const underusedCount = result.gaps.underusedThemes.length
  const opportunityCount = result.channelFit.opportunityThemes.length

  return (
    <div>
      <p className="text-[10px] font-normal uppercase tracking-[0.1px] font-sans text-[color:var(--color-primary)] mb-4 text-center">
        Content strategy
      </p>
      <h1 className="text-[32px] font-light font-sans tracking-[-0.64px] leading-[1.1] text-[color:var(--text-body)] text-center mb-3">
        Here&apos;s a taste of your content system
      </h1>

      <p className="text-[16px] font-light font-sans leading-[1.4] text-[color:var(--text-secondary)] text-center mb-10 max-w-lg mx-auto">
        {result.profile}
      </p>

      <h2 className="text-[20px] font-light font-sans tracking-[-0.2px] leading-[1.4] text-[color:var(--text-body)] mb-1">
        {firstPillar.pillar}
      </h2>
      <p className="text-[13px] font-normal font-sans text-[color:var(--text-muted)] mb-6">
        All 10 themes for your first pillar
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {firstPillar.cells.map((cell, i) => (
          <div key={cell.theme} style={{ animationDelay: `${i * 60}ms` }} className="content-office-fade-in">
            <ContentMatrixCell cell={cell} />
          </div>
        ))}
      </div>

      <h2 className="text-[20px] font-light font-sans tracking-[-0.2px] leading-[1.4] text-[color:var(--text-body)] mb-4">
        Your starter sequence
      </h2>
      <div className="flex flex-col gap-3 mb-10">
        {previewPosts.map((post) => (
          <div
            key={post.order}
            className="rounded-[var(--radius-lg)] border border-[color:var(--border-hairline)] bg-[color:var(--surface-soft)] p-6"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="[font-feature-settings:'tnum'_1] text-[13px] font-normal font-sans text-[color:var(--color-primary)]">
                {post.order}
              </span>
              <span className="text-[11px] font-normal font-sans text-[color:var(--text-muted)]">
                {post.pillar} &middot; {themeById(post.theme).name}
              </span>
            </div>
            <p className="text-[15px] font-light font-sans leading-[1.4] text-[color:var(--text-body)]">{post.contentIdea}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[var(--radius-lg)] border border-[color:var(--border-hairline)] bg-[color:var(--surface-cream)] p-6 text-center">
        <p className="text-[15px] font-light font-sans leading-[1.4] text-[color:var(--text-body)]">
          Your matrix reveals {underusedCount} underused theme{underusedCount === 1 ? '' : 's'} and {opportunityCount} channel
          opportunit{opportunityCount === 1 ? 'y' : 'ies'}. The full analysis is in your report.
        </p>
      </div>
    </div>
  )
}
