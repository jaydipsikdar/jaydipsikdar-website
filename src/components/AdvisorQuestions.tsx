'use client'

import { useState } from 'react'
import type { MarketingCategory } from './CategorySelect'

export interface AdvisorAnswers {
  userRole: string
  businessStage: string
  primaryChallenge: string
  secondaryAnswer?: string
  description: string
}

interface AdvisorQuestionsProps {
  category: MarketingCategory
  onSubmit: (answers: AdvisorAnswers) => void
}

const ROLES = [
  'Solopreneur or freelancer',
  'Startup founder',
  'Marketing professional',
  'Consultant or agency',
  'Student or career changer',
]

const STAGES = [
  'Pre-launch or idea stage',
  'Just launched (0–6 months)',
  'Growing (6 months – 2 years)',
  'Established (2+ years)',
]

interface CategoryConfig {
  primaryChallengeQuestion: string
  primaryChallengeOptions: string[]
  secondary?: { question: string; options: string[] }
  descriptionQuestion: string
  descriptionPlaceholder: string
}

const CATEGORY_CONFIG: Record<MarketingCategory, CategoryConfig> = {
  positioning: {
    primaryChallengeQuestion: "What's your primary challenge?",
    primaryChallengeOptions: [
      "Can't clearly articulate what we do differently",
      "Customers don't understand our value proposition",
      'We sound too similar to competitors',
      'Trying to serve too many audiences at once',
    ],
    descriptionQuestion: 'Describe your business and the positioning or messaging problem you’re facing.',
    descriptionPlaceholder:
      "e.g., We're a design agency that does branding for startups, but every pitch feels the same as the next agency. Clients keep asking 'what makes you different' and I don't have a good answer.",
  },
  brand: {
    primaryChallengeQuestion: "What's your primary challenge?",
    primaryChallengeOptions: [
      'Nobody knows we exist yet',
      'Our brand doesn’t feel different from competitors',
      'We’re creating content but it’s not getting traction',
      'Our brand voice is inconsistent across channels',
    ],
    secondary: {
      question: 'Where do you primarily reach your audience?',
      options: [
        'Social media (organic)',
        'Search / SEO',
        'Paid ads',
        'Events or speaking',
        'Referrals and word of mouth',
        'Haven’t figured this out yet',
      ],
    },
    descriptionQuestion: 'Describe your brand challenge.',
    descriptionPlaceholder:
      "e.g., I post on LinkedIn 3x a week but engagement is flat. I sell marketing consulting but my content reads like everyone else's — frameworks, tips, listicles. Nothing stands out.",
  },
  'customer-growth': {
    primaryChallengeQuestion: "What's your primary challenge?",
    primaryChallengeOptions: [
      'Getting my first customers',
      'Customers buy once but don’t come back',
      'I can’t get referrals or reviews',
      'Want to build a community but don’t know how',
    ],
    secondary: {
      question: 'Roughly how many active customers do you have?',
      options: ['0–10', '11–50', '51–200', '200+'],
    },
    descriptionQuestion: 'Describe your growth or retention challenge.',
    descriptionPlaceholder:
      'e.g., I run a Shopify store selling organic skincare. I get decent first orders from Instagram ads but repeat purchase rate is under 10%. I have no email strategy and no community.',
  },
  'ai-marketing': {
    primaryChallengeQuestion: "What's your primary challenge?",
    primaryChallengeOptions: [
      'Don’t know where to start with AI in marketing',
      'Using AI tools but the output feels generic',
      'Want to be found by AI search and assistants',
      'Need to scale content production without losing quality',
      'Want to use AI for marketing decisions, not just content',
    ],
    descriptionQuestion: 'Describe what you’re trying to achieve with AI in your marketing.',
    descriptionPlaceholder:
      "e.g., I use ChatGPT for blog drafts but everything sounds the same. I know AI search is changing how people find services like mine but I have no idea how to optimize for it.",
  },
  launch: {
    primaryChallengeQuestion: 'What are you launching?',
    primaryChallengeOptions: [
      'New product',
      'New service',
      'Entering a new market or audience',
      'Rebranding or pivoting',
      'New feature or major update',
    ],
    secondary: {
      question: 'When is your launch?',
      options: ['This month', 'Next 1–3 months', '3–6 months out', 'No fixed timeline'],
    },
    descriptionQuestion: 'Describe what you’re launching and your biggest concern.',
    descriptionPlaceholder:
      "e.g., I'm launching a paid community for freelance designers in 6 weeks. I have 400 newsletter subscribers but no pre-orders yet. I'm worried nobody will pay when there's so much free content out there.",
  },
}

function QuestionBlock({
  question,
  options,
  selected,
  onSelect,
}: {
  question: string
  options: string[]
  selected: string | null
  onSelect: (value: string) => void
}) {
  return (
    <div className="mb-8">
      <h3 className="text-base font-semibold mb-3">{question}</h3>
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`text-left px-4 py-3 rounded border text-sm transition-colors ${
              selected === option
                ? 'border-brand-accent bg-brand-accent/5 text-brand-text font-medium'
                : 'border-gray-300 bg-white text-brand-text hover:border-brand-accent'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function AdvisorQuestions({ category, onSubmit }: AdvisorQuestionsProps) {
  const config = CATEGORY_CONFIG[category]

  const [userRole, setUserRole] = useState<string | null>(null)
  const [businessStage, setBusinessStage] = useState<string | null>(null)
  const [primaryChallenge, setPrimaryChallenge] = useState<string | null>(null)
  const [secondaryAnswer, setSecondaryAnswer] = useState<string | null>(null)
  const [description, setDescription] = useState('')

  const needsSecondary = Boolean(config.secondary)
  const canSubmit =
    userRole &&
    businessStage &&
    primaryChallenge &&
    (!needsSecondary || secondaryAnswer) &&
    description.trim().length >= 20

  function handleSubmit() {
    if (!canSubmit) return
    onSubmit({
      userRole: userRole!,
      businessStage: businessStage!,
      primaryChallenge: primaryChallenge!,
      secondaryAnswer: secondaryAnswer ?? undefined,
      description: description.trim(),
    })
  }

  return (
    <div>
      <QuestionBlock
        question="What best describes you?"
        options={ROLES}
        selected={userRole}
        onSelect={setUserRole}
      />
      <QuestionBlock
        question="What stage is your business at?"
        options={STAGES}
        selected={businessStage}
        onSelect={setBusinessStage}
      />
      <QuestionBlock
        question={config.primaryChallengeQuestion}
        options={config.primaryChallengeOptions}
        selected={primaryChallenge}
        onSelect={setPrimaryChallenge}
      />
      {config.secondary && (
        <QuestionBlock
          question={config.secondary.question}
          options={config.secondary.options}
          selected={secondaryAnswer}
          onSelect={setSecondaryAnswer}
        />
      )}

      <div className="mb-8">
        <h3 className="text-base font-semibold mb-3">{config.descriptionQuestion}</h3>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={config.descriptionPlaceholder}
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded text-sm text-brand-text bg-white placeholder-gray-400 focus:outline-none focus:border-brand-accent transition-colors resize-none"
        />
        {description.trim().length > 0 && description.trim().length < 20 && (
          <p className="text-xs text-gray-500 mt-2">A couple of sentences helps a lot — keep going.</p>
        )}
      </div>

      <div className="text-center">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="px-6 py-3 bg-brand-accent text-white rounded hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Get my advice →
        </button>
      </div>
    </div>
  )
}
