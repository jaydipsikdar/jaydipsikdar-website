'use client'

import { useState } from 'react'
import ContentMatrixCell from './ContentMatrixCell'
import RazorpayBookButton, { CALENDLY_URL } from './RazorpayBookButton'
import { THEMES, themeById, structureById, channelById, type ContentOfficeResult } from '@/lib/contentOfficeData'

type MatrixView = 'pillar' | 'theme'

function joinList(items: string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

function bridgeUrl(campaign: string): string {
  return `${CALENDLY_URL}?utm_source=content-office&utm_medium=pdf&utm_campaign=${campaign}`
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[26px] font-light font-sans tracking-[-0.26px] leading-[1.12] text-[color:var(--text-body)] mb-6">
      {children}
    </h2>
  )
}

function ConsultingBridge({
  eyebrow,
  title,
  body,
  prompt,
  campaign,
}: {
  eyebrow: string
  title: string
  body: string
  prompt: string
  campaign: string
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:var(--border-hairline)] bg-white p-8 mb-10">
      <p className="text-[10px] font-normal uppercase tracking-[0.1px] font-sans text-[color:var(--color-primary)] mb-3">
        {eyebrow}
      </p>
      <h3 className="text-[18px] font-light font-sans leading-[1.4] text-[color:var(--text-body)] mb-4">{title}</h3>
      <p className="text-[15px] font-light font-sans leading-[1.4] text-[color:var(--text-secondary)] mb-5">{body}</p>
      <div className="rounded-[var(--radius-md)] bg-[color:var(--surface-soft)] border-l-4 border-[color:var(--color-primary)] p-5 mb-5">
        <p className="text-[14px] font-light italic font-sans leading-[1.4] text-[color:var(--text-body)]">{prompt}</p>
      </div>
      <RazorpayBookButton
        bookingUrl={bridgeUrl(campaign)}
        className="px-4 py-2 rounded-[var(--radius-pill)] border border-[color:var(--color-primary)] text-[color:var(--color-primary)] text-[16px] font-normal font-sans hover:bg-[color:var(--color-primary-subtle)] transition-colors"
      >
        Set up a conversation
      </RazorpayBookButton>
    </div>
  )
}

export default function ContentOfficeFullResults({ result }: { result: ContentOfficeResult }) {
  const [view, setView] = useState<MatrixView>('pillar')
  const pillarNames = result.pillars.map((p) => p.pillar)
  const totalIdeas = result.pillars.length * 10

  return (
    <div>
      <SectionHeading>Your full content matrix</SectionHeading>

      <div className="flex gap-2 mb-8">
        {(['pillar', 'theme'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-[var(--radius-pill)] border text-[14px] font-normal font-sans transition-colors ${
              view === v
                ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-white'
                : 'border-[color:var(--border-hairline)] bg-white text-[color:var(--text-body)] hover:border-[color:var(--color-primary)]'
            }`}
          >
            {v === 'pillar' ? 'By pillar' : 'By theme'}
          </button>
        ))}
      </div>

      {view === 'pillar'
        ? result.pillars.map((pillar) => (
            <div key={pillar.pillar} className="mb-12">
              <h3 className="text-[20px] font-light font-sans tracking-[-0.2px] leading-[1.4] text-[color:var(--text-body)] mb-4">
                {pillar.pillar}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pillar.cells.map((cell) => (
                  <ContentMatrixCell key={cell.theme} cell={cell} />
                ))}
              </div>
            </div>
          ))
        : THEMES.map((theme) => (
            <div key={theme.id} className="mb-12">
              <h3 className="text-[20px] font-light font-sans tracking-[-0.2px] leading-[1.4] mb-4" style={{ color: theme.color }}>
                {theme.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.pillars.map((pillar) => {
                  const cell = pillar.cells.find((c) => c.theme === theme.id)
                  if (!cell) return null
                  return (
                    <div key={pillar.pillar}>
                      <p className="text-[11px] font-normal font-sans text-[color:var(--text-muted)] mb-2">{pillar.pillar}</p>
                      <ContentMatrixCell cell={cell} />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

      <SectionHeading>Your starter sequence</SectionHeading>
      <div className="flex flex-col gap-3 mb-14">
        {result.starterSequence.map((post) => (
          <div key={post.order} className="rounded-[var(--radius-lg)] border border-[color:var(--border-hairline)] bg-[color:var(--surface-soft)] p-6">
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

      <SectionHeading>Content gaps and opportunities</SectionHeading>
      <p className="text-[15px] font-light font-sans leading-[1.4] text-[color:var(--text-secondary)] mb-4">{result.gaps.body}</p>
      <div className="flex flex-col gap-2 mb-8">
        <p className="text-[14px] font-normal font-sans text-[color:var(--text-body)]">
          Themes you&apos;re probably underusing: {joinList(result.gaps.underusedThemes.map((t) => themeById(t).name))}
        </p>
        <p className="text-[14px] font-normal font-sans text-[color:var(--text-body)]">
          Structures worth trying: {joinList(result.gaps.avoidedStructures.map((s) => structureById(s).name))}
        </p>
      </div>
      <ConsultingBridge
        eyebrow="Consulting bridge"
        title="The missing pillar"
        body={`Your ${pillarNames.length === 2 ? 'two' : 'three'} pillars cover ${joinList(pillarNames)}. ${result.gaps.missingPillarNote}`}
        prompt="Want help identifying your fourth pillar and pressure-testing these? Set up a 60-minute conversation. Rs. 999."
        campaign="bridge-1"
      />

      <SectionHeading>Channel-content fit analysis</SectionHeading>
      <p className="text-[15px] font-light font-sans leading-[1.4] text-[color:var(--text-secondary)] mb-4">{result.channelFit.body}</p>
      <div className="flex flex-col gap-2 mb-4">
        {result.channelFit.mismatchedChannels.length > 0 && (
          <p className="text-[14px] font-normal font-sans text-[color:var(--text-body)]">
            Worth reconsidering: {joinList(result.channelFit.mismatchedChannels.map((c) => channelById(c).name))}
          </p>
        )}
        <p className="text-[14px] font-normal font-sans text-[color:var(--text-body)]">
          Themes that would perform on channels you're not using yet:{' '}
          {joinList(result.channelFit.opportunityThemes.map((t) => themeById(t).name))}
        </p>
      </div>
      <p className="text-[14px] font-normal font-sans text-[color:var(--text-body)] mb-8">{result.channelFit.capacityNote}</p>
      <ConsultingBridge
        eyebrow="Consulting bridge"
        title="The prioritization question"
        body={`Your matrix gives you ${totalIdeas} content ideas. The question isn't what to create, it's what to skip. Prioritization depends on your sales cycle length, your current pipeline, and whether you're building an audience or converting one you already have. The matrix shows you the options.`}
        prompt="If you want a second pair of eyes on which ideas to prioritize for your specific situation, I'm happy to walk through it. 60 minutes, Rs. 999."
        campaign="bridge-2"
      />

      <SectionHeading>Your content rhythm</SectionHeading>
      <p className="text-[15px] font-normal font-sans text-[color:var(--text-body)] mb-2">{result.rhythm.cadence}</p>
      <p className="text-[15px] font-light font-sans leading-[1.4] text-[color:var(--text-secondary)] mb-2">{result.rhythm.body}</p>
      <p className="text-[13px] font-light font-sans leading-[1.4] text-[color:var(--text-muted)] mb-8">{result.rhythm.disclaimer}</p>
      <ConsultingBridge
        eyebrow="Consulting bridge"
        title="The system design"
        body="A content system involves more than ideas. It's a workflow: ideation, creation, review, distribution, measurement. The right system depends on whether you're doing this solo, with a VA, or with a team. Whether you batch-create or publish in real time. Whether you measure reach or revenue. This report gives you the ideas."
        prompt="Some people take this matrix and run with it. Others want help designing the workflow around it. If that's you, set up a conversation and we'll build your content operating system together. 60 minutes, Rs. 999."
        campaign="bridge-3"
      />

      <p className="text-center text-[13px] font-light font-sans text-[color:var(--text-muted)] mt-4">
        Want to assess your full marketing maturity?{' '}
        <a href="/resources/marketing-maturity-score" className="text-[color:var(--color-primary)] hover:text-[color:var(--color-primary-hover)] transition-colors">
          Take the Marketing Maturity Score
        </a>
        .
      </p>
    </div>
  )
}
