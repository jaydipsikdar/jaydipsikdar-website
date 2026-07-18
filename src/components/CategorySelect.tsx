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
    label: 'Positioning & Messaging',
    subtitle: "I can't clearly explain what makes us different",
    Icon: IconCompass,
  },
  {
    id: 'brand',
    label: 'Brand Strategy',
    subtitle: "Nobody knows we exist, or our content isn't landing",
    Icon: IconMegaphone,
  },
  {
    id: 'customer-growth',
    label: 'Customer Growth & Retention',
    subtitle: "I can't get repeat customers or referrals",
    Icon: IconTrendingUp,
  },
  {
    id: 'ai-marketing',
    label: 'AI for Marketing',
    subtitle: "I don't know how to use AI without sounding generic",
    Icon: IconSparkles,
  },
  {
    id: 'launch',
    label: 'Launch & Go-to-Market',
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
          className="text-left border border-gray-200 rounded-lg p-6 bg-white hover:border-brand-accent hover:shadow-sm transition-all"
        >
          <category.Icon className="w-6 h-6 text-brand-accent mb-3" />
          <h3 className="text-base font-semibold mb-2">{category.label}</h3>
          <p className="text-brand-text text-sm leading-relaxed">{category.subtitle}</p>
        </button>
      ))}
    </div>
  )
}
