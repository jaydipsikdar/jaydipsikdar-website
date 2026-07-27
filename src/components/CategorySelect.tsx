'use client'

import type { ComponentType } from 'react'
import {
  IconCompass,
  IconMegaphone,
  IconTrendingUp,
  IconSparkles,
  IconRocket,
} from './AdvisorIcons'

export type MarketingCategory =
  | 'positioning'
  | 'brand'
  | 'customer-growth'
  | 'ai-marketing'
  | 'launch'

export interface CategoryMeta {
  id: MarketingCategory
  label: string
  subtitle: string
  Icon: ComponentType<{ className?: string }>
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'positioning',
    label: 'Positioning & messaging',
    subtitle: "I can't clearly explain what makes us different",
    Icon: IconCompass,
  },
  {
    id: 'brand',
    label: 'Brand strategy',
    subtitle: "Nobody knows we exist, or our content isn't landing",
    Icon: IconMegaphone,
  },
  {
    id: 'customer-growth',
    label: 'Customer growth & retention',
    subtitle: "I can't get repeat customers or referrals",
    Icon: IconTrendingUp,
  },
  {
    id: 'ai-marketing',
    label: 'AI for marketing',
    subtitle: "I don't know how to use AI without sounding generic",
    Icon: IconSparkles,
  },
  {
    id: 'launch',
    label: 'Launch & go-to-market',
    subtitle: "I'm about to launch and I'm not sure I'm ready",
    Icon: IconRocket,
  },
]

interface CategorySelectProps {
  onSelect: (category: MarketingCategory) => void
}

export default function CategorySelect({ onSelect }: CategorySelectProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(category.id)}
          className="text-left border border-hairline rounded-lg p-6 bg-white transition-shadow duration-150 ease-out hover:border-primary hover:shadow-1"
        >
          <category.Icon className="w-6 h-6 text-primary mb-3" />
          <h3 className="text-base font-light text-ink-900 mb-2">{category.label}</h3>
          <p className="text-ink-700 text-sm leading-[1.4]">{category.subtitle}</p>
        </button>
      ))}
    </div>
  )
}
