// Jaydeepp's Content Office — core taxonomy and shared types.
// Source of truth: 00-context/jaydips-content-office-spec.md

export type ThemeId =
  | 'information'
  | 'education'
  | 'analysis'
  | 'pov'
  | 'commentary'
  | 'critique'
  | 'now-vs-then'
  | 'prediction'
  | 'behind-the-scenes'
  | 'curation'

export type StructureId =
  | 'framework'
  | 'story'
  | 'list'
  | 'comparison'
  | 'contrarian'
  | 'case-breakdown'
  | 'question-led'
  | 'data-led'
  | 'tutorial'
  | 'hot-take'

export type ChannelId =
  | 'linkedin'
  | 'x'
  | 'blog'
  | 'newsletter'
  | 'youtube'
  | 'instagram'
  | 'facebook'
  | 'podcast'

export type IntentId =
  | 'authority'
  | 'leads'
  | 'talent'
  | 'audience'
  | 'learning'

export interface Theme {
  id: ThemeId
  name: string
  description: string
  example: string
  color: string
}

export const THEMES: Theme[] = [
  { id: 'information', name: 'Information', description: 'Reports facts, data, or news without editorializing', example: 'The average B2B SaaS company changed pricing 2.3 times in 2025', color: '#4a7b8c' },
  { id: 'education', name: 'Education', description: 'Teaches a concept, framework, or skill', example: 'How to run a pricing audit in 5 steps', color: '#27874a' },
  { id: 'analysis', name: 'Analysis', description: "Breaks down why something works or doesn't", example: "Why Notion's pricing pivot worked (and what most founders miss)", color: '#b57738' },
  { id: 'pov', name: 'Point of view', description: 'States your position on a contested topic', example: 'Most B2B companies underprice by 40 percent. Here is why that is rational.', color: '#df4770' },
  { id: 'commentary', name: 'Commentary', description: "Reacts to a trend, news event, or someone else's take", example: 'Stripe just changed their pricing again. Here is what it signals.', color: '#ef7bc2' },
  { id: 'critique', name: 'Critique', description: "Calls out what's broken or misunderstood", example: "The 'value-based pricing' advice most consultants give is incomplete", color: '#a13d5c' },
  { id: 'now-vs-then', name: 'Now vs. then', description: 'Compares how things have changed over time', example: 'B2B pricing in 2020 vs. 2026: three shifts nobody talks about', color: '#6d7d91' },
  { id: 'prediction', name: 'Prediction', description: 'Projects where things are heading', example: 'By 2028, usage-based pricing will be the default', color: '#7c5cbf' },
  { id: 'behind-the-scenes', name: 'Behind the scenes', description: 'Shows your process, mistakes, or journey', example: 'How I helped a client raise prices 30 percent without losing an account', color: '#34465d' },
  { id: 'curation', name: 'Curation', description: "Collects and frames others' work on the topic", example: 'Five pricing resources I keep coming back to (and one I would skip)', color: '#5a8f6b' },
]

export interface Structure {
  id: StructureId
  name: string
  description: string
}

export const STRUCTURES: Structure[] = [
  { id: 'framework', name: 'Framework', description: 'Named model with steps, components, or a matrix' },
  { id: 'story', name: 'Story', description: 'Personal narrative, client case, or origin story' },
  { id: 'list', name: 'List', description: 'Numbered or ranked items (3, 5, 7, 10)' },
  { id: 'comparison', name: 'Comparison', description: 'X vs. Y, side by side' },
  { id: 'contrarian', name: 'Contrarian', description: 'Everyone says X. I think Y.' },
  { id: 'case-breakdown', name: 'Case breakdown', description: 'Real example dissected with lessons' },
  { id: 'question-led', name: 'Question-led', description: 'Opens with a provocative question, answers it' },
  { id: 'data-led', name: 'Data-led', description: 'Opens with a stat or finding, unpacks implications' },
  { id: 'tutorial', name: 'Tutorial', description: 'Step by step walkthrough with specific instructions' },
  { id: 'hot-take', name: 'Hot take', description: 'Short, sharp, opinionated (under 200 words)' },
]

export interface Channel {
  id: ChannelId
  name: string
  formatConstraints: string
  idealLength: string
  // Freeform display names (structures and, per source spec, occasionally
  // themes) that tend to perform on this channel. Prompt context only, not
  // validated against the ThemeId/StructureId enums.
  performsWell: string[]
}

export const CHANNELS: Channel[] = [
  { id: 'linkedin', name: 'LinkedIn', formatConstraints: 'Hook in first 2 lines (before "see more"), single-idea focus, white space between lines', idealLength: '800-1,500 characters (sweet spot 1,200)', performsWell: ['Framework', 'Story', 'Contrarian', 'List'] },
  { id: 'x', name: 'X / Twitter', formatConstraints: 'Single tweet (280 chars) or thread (3-8 tweets), punchy, no preamble', idealLength: '280 chars, or 800-1,500 chars as a thread', performsWell: ['Hot take', 'Data-led', 'Question-led', 'List'] },
  { id: 'blog', name: 'Blog (own site)', formatConstraints: 'SEO-aware headline, scannable with subheads, internal links', idealLength: '800-2,000 words', performsWell: ['Tutorial', 'Case breakdown', 'Comparison', 'Framework'] },
  { id: 'newsletter', name: 'Newsletter', formatConstraints: 'Personal tone, one idea per edition, clear CTA at end', idealLength: '500-800 words', performsWell: ['Point of view', 'Story', 'Curation'] },
  { id: 'youtube', name: 'YouTube', formatConstraints: 'Hook in first 15 seconds, talking head or screen share, chapters', idealLength: '5-15 minutes', performsWell: ['Tutorial', 'Case breakdown', 'Framework', 'Comparison'] },
  { id: 'instagram', name: 'Instagram', formatConstraints: 'Carousel (5-10 slides) or single image with caption, visual-first', idealLength: '5-10 slides, or a 150-300 word caption', performsWell: ['List', 'Framework', 'Data-led', 'Hot take'] },
  { id: 'facebook', name: 'Facebook', formatConstraints: 'Conversational, question-driven, community-oriented', idealLength: '300-600 words', performsWell: ['Story', 'Question-led', 'Commentary'] },
  { id: 'podcast', name: 'Podcast', formatConstraints: 'Conversational, can go deeper, needs a hook and a structure', idealLength: '15-45 minutes', performsWell: ['Analysis', 'Point of view', 'Story', 'Behind the scenes'] },
]

export interface IntentOption {
  id: IntentId
  label: string
  primaryThemes: ThemeId[]
  secondaryThemes: ThemeId[]
}

export const INTENT_OPTIONS: IntentOption[] = [
  { id: 'authority', label: 'Build authority in my space', primaryThemes: ['pov', 'analysis', 'critique'], secondaryThemes: ['prediction', 'commentary'] },
  { id: 'leads', label: 'Generate inbound leads', primaryThemes: ['education', 'behind-the-scenes'], secondaryThemes: ['information', 'pov'] },
  { id: 'talent', label: 'Attract talent to my team', primaryThemes: ['behind-the-scenes', 'pov'], secondaryThemes: ['commentary', 'curation'] },
  { id: 'audience', label: 'Grow an audience for a future product', primaryThemes: ['commentary', 'now-vs-then'], secondaryThemes: ['critique', 'prediction'] },
  { id: 'learning', label: "Document what I'm learning", primaryThemes: ['behind-the-scenes', 'education'], secondaryThemes: ['analysis', 'curation'] },
]

export const CHANNEL_THEME_AFFINITY: Record<ThemeId, { best: ChannelId[]; weak: ChannelId[] }> = {
  information: { best: ['x', 'linkedin', 'newsletter'], weak: ['instagram'] },
  education: { best: ['blog', 'youtube', 'linkedin'], weak: ['x'] },
  analysis: { best: ['blog', 'newsletter', 'podcast'], weak: ['instagram', 'x'] },
  pov: { best: ['linkedin', 'x', 'newsletter'], weak: ['youtube'] },
  commentary: { best: ['x', 'linkedin'], weak: ['blog'] },
  critique: { best: ['linkedin', 'blog', 'podcast'], weak: ['instagram', 'facebook'] },
  'now-vs-then': { best: ['linkedin', 'blog', 'youtube'], weak: ['x'] },
  prediction: { best: ['linkedin', 'newsletter', 'podcast'], weak: ['instagram'] },
  'behind-the-scenes': { best: ['instagram', 'linkedin', 'podcast'], weak: ['x'] },
  curation: { best: ['newsletter', 'linkedin', 'blog'], weak: ['youtube', 'instagram'] },
}

export const PILLAR_MIN = 2
export const PILLAR_MAX = 3
export const CHANNEL_MAX = 4
export const INTENT_MAX = 2

export function themeById(id: ThemeId): Theme {
  return THEMES.find((t) => t.id === id)!
}
export function structureById(id: StructureId): Structure {
  return STRUCTURES.find((s) => s.id === id)!
}
export function channelById(id: ChannelId): Channel {
  return CHANNELS.find((c) => c.id === id)!
}
export function intentById(id: IntentId): IntentOption {
  return INTENT_OPTIONS.find((i) => i.id === id)!
}

// ── Shared request/response shapes ──────────────────────────────────────

export interface ContentOfficeInputs {
  role: string
  intents: IntentId[]
  audience: string
  pillars: string[]
  channels: ChannelId[]
}

export interface ChannelMapping {
  channel: ChannelId
  guidance: string
}

export interface MatrixCell {
  theme: ThemeId
  contentIdea: string
  structure: StructureId
  channelMapping: ChannelMapping[]
}

export interface PillarMatrix {
  pillar: string
  cells: MatrixCell[]
}

export interface StarterPost {
  order: number
  pillar: string
  theme: ThemeId
  contentIdea: string
}

export interface GapsAnalysis {
  body: string
  underusedThemes: ThemeId[]
  avoidedStructures: StructureId[]
  missingPillarNote: string
}

export interface ChannelFitAnalysis {
  body: string
  mismatchedChannels: ChannelId[]
  opportunityThemes: ThemeId[]
  capacityNote: string
}

export interface RhythmRecommendation {
  cadence: string
  body: string
  disclaimer: string
}

export interface ContentOfficeResult {
  inputs: ContentOfficeInputs
  profile: string
  pillars: PillarMatrix[]
  starterSequence: StarterPost[]
  gaps: GapsAnalysis
  channelFit: ChannelFitAnalysis
  rhythm: RhythmRecommendation
}
