'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import {
  INTENT_OPTIONS,
  CHANNELS,
  PILLAR_MIN,
  PILLAR_MAX,
  CHANNEL_MAX,
  INTENT_MAX,
  type IntentId,
  type ChannelId,
  type ContentOfficeInputs,
} from '@/lib/contentOfficeData'

interface ContentOfficeFormProps {
  onSubmit: (inputs: ContentOfficeInputs) => void
}

function FieldLabel({ children, helper }: { children: React.ReactNode; helper?: string }) {
  return (
    <div className="mb-3">
      <label className="block text-[15px] font-normal font-sans text-[color:var(--text-body)]">{children}</label>
      {helper && <p className="text-[13px] font-light font-sans text-[color:var(--text-muted)] mt-1">{helper}</p>}
    </div>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-[13px] font-normal font-sans text-[color:var(--accent-rose)] mt-2">{message}</p>
}

function ToggleOption({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2.5 text-left px-4 py-3 rounded-[var(--radius-md)] border text-[15px] font-light font-sans transition-colors ${
        selected
          ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary-subtle)] text-[color:var(--text-body)]'
          : 'border-[color:var(--border-hairline)] bg-white text-[color:var(--text-body)] hover:border-[color:var(--color-primary)]'
      }`}
    >
      <span
        className={`flex-shrink-0 w-4 h-4 rounded-[var(--radius-xs)] border flex items-center justify-center ${
          selected ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)]' : 'border-[color:var(--border-input)] bg-white'
        }`}
      >
        {selected && <Check size={12} strokeWidth={2} className="text-white" />}
      </span>
      {label}
    </button>
  )
}

const ROLE_MAX = 200
const AUDIENCE_MAX = 200

export default function ContentOfficeForm({ onSubmit }: ContentOfficeFormProps) {
  const [role, setRole] = useState('')
  const [intents, setIntents] = useState<IntentId[]>([])
  const [audience, setAudience] = useState('')
  const [pillarsRaw, setPillarsRaw] = useState('')
  const [channels, setChannels] = useState<ChannelId[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  function toggleIntent(id: IntentId) {
    setIntents((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id)
      if (prev.length >= INTENT_MAX) return prev
      return [...prev, id]
    })
  }

  function toggleChannel(id: ChannelId) {
    setChannels((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id)
      if (prev.length >= CHANNEL_MAX) return prev
      return [...prev, id]
    })
  }

  function parsePillars(): string[] {
    return pillarsRaw
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
  }

  function validate(): Record<string, string> {
    const next: Record<string, string> = {}

    if (!role.trim()) next.role = 'Tell us what you do.'
    else if (role.length > ROLE_MAX) next.role = `Keep it under ${ROLE_MAX} characters.`

    if (intents.length < 1) next.intents = 'Pick at least one.'
    else if (intents.length > INTENT_MAX) next.intents = `Pick up to ${INTENT_MAX}.`

    if (!audience.trim()) next.audience = 'Tell us who you are writing for.'
    else if (audience.length > AUDIENCE_MAX) next.audience = `Keep it under ${AUDIENCE_MAX} characters.`

    const pillars = parsePillars()
    if (pillars.length < PILLAR_MIN || pillars.length > PILLAR_MAX) {
      next.pillars = `List ${PILLAR_MIN} to ${PILLAR_MAX} pillars, separated by commas.`
    }

    if (channels.length < 1) next.channels = 'Pick at least one.'
    else if (channels.length > CHANNEL_MAX) next.channels = `Pick up to ${CHANNEL_MAX}.`

    return next
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    onSubmit({
      role: role.trim(),
      intents,
      audience: audience.trim(),
      pillars: parsePillars(),
      channels,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div>
        <FieldLabel>What you do</FieldLabel>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          maxLength={ROLE_MAX}
          placeholder="I run a B2B fintech startup"
          className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[color:var(--border-input)] text-[15px] font-light font-sans text-[color:var(--text-body)] bg-white placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-[3px] focus:ring-[color:var(--color-primary-subtle)] transition-colors"
        />
        <FieldError message={errors.role} />
      </div>

      <div>
        <FieldLabel>What you want content to do</FieldLabel>
        <div className="flex flex-col gap-2">
          {INTENT_OPTIONS.map((opt) => (
            <ToggleOption key={opt.id} label={opt.label} selected={intents.includes(opt.id)} onClick={() => toggleIntent(opt.id)} />
          ))}
        </div>
        <FieldError message={errors.intents} />
      </div>

      <div>
        <FieldLabel>Your target audience</FieldLabel>
        <input
          type="text"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          maxLength={AUDIENCE_MAX}
          placeholder="SaaS founders at $1M-$10M ARR"
          className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[color:var(--border-input)] text-[15px] font-light font-sans text-[color:var(--text-body)] bg-white placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-[3px] focus:ring-[color:var(--color-primary-subtle)] transition-colors"
        />
        <FieldError message={errors.audience} />
      </div>

      <div>
        <FieldLabel helper="The 2-3 topics you want to be known for. Pick topics you have genuine experience with.">
          Your content pillars
        </FieldLabel>
        <input
          type="text"
          value={pillarsRaw}
          onChange={(e) => setPillarsRaw(e.target.value)}
          placeholder="B2B pricing strategy, product-led growth, founder mental health"
          className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[color:var(--border-input)] text-[15px] font-light font-sans text-[color:var(--text-body)] bg-white placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-[3px] focus:ring-[color:var(--color-primary-subtle)] transition-colors"
        />
        <FieldError message={errors.pillars} />
      </div>

      <div>
        <FieldLabel>Your active channels</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          {CHANNELS.map((ch) => (
            <ToggleOption key={ch.id} label={ch.name} selected={channels.includes(ch.id)} onClick={() => toggleChannel(ch.id)} />
          ))}
        </div>
        <FieldError message={errors.channels} />
      </div>

      <button
        type="submit"
        className="px-4 py-2 rounded-[var(--radius-pill)] bg-[color:var(--color-primary)] text-white text-[16px] font-normal font-sans hover:bg-[color:var(--color-primary-hover)] transition-colors self-center"
      >
        Build my content system
      </button>
    </form>
  )
}
