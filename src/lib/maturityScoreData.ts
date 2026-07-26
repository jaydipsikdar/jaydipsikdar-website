// Marketing Maturity Score — content and configuration.
// Source of truth: 00-context/marketing-maturity-score-spec.md

export type QuestionScore = 1 | 2 | 3 | 5

export interface QuestionOption {
  text: string
  score: QuestionScore
}

export interface Question {
  id: string
  dimensionId: DimensionId
  question: string
  options: QuestionOption[]
}

export type DimensionId =
  | 'positioning'
  | 'demand-gen'
  | 'content'
  | 'ops'
  | 'measurement'
  | 'team'

export interface Dimension {
  id: DimensionId
  name: string
  shortName: string
  // Source of truth: 00-context/maturity-score-sample-report.html (:root
  // --dim-* tokens). Hex values kept alongside the CSS var name since
  // Recharts/jsPDF need a resolved color, not a var() reference.
  color: string
  colorVar: string
}

export const DIMENSIONS: Dimension[] = [
  { id: 'positioning', name: 'Positioning & Messaging', shortName: 'Positioning', color: '#e84500', colorVar: 'var(--dim-positioning)' },
  { id: 'demand-gen', name: 'Demand Generation', shortName: 'Demand gen', color: '#b57738', colorVar: 'var(--dim-demand)' },
  { id: 'content', name: 'Content & Thought Leadership', shortName: 'Content', color: '#df4770', colorVar: 'var(--dim-content)' },
  { id: 'ops', name: 'Marketing Ops & Tech Stack', shortName: 'Ops', color: '#34465d', colorVar: 'var(--dim-ops)' },
  { id: 'measurement', name: 'Measurement & Attribution', shortName: 'Measurement', color: '#4a7b8c', colorVar: 'var(--dim-measurement)' },
  { id: 'team', name: 'Team & Leadership', shortName: 'Team', color: '#6d7d91', colorVar: 'var(--dim-team)' },
]

export function dimensionById(id: DimensionId): Dimension {
  const d = DIMENSIONS.find((dim) => dim.id === id)
  if (!d) throw new Error(`Unknown dimension: ${id}`)
  return d
}

// ── Qualifiers ──

export const ROLE_OPTIONS = [
  { id: 'founder', label: 'Founder / CEO' },
  { id: 'cmo', label: 'Marketing Head / CMO / VP Marketing' },
  { id: 'manager', label: 'Marketing Manager / Team Lead' },
  { id: 'consultant', label: 'Consultant (assessing for a client)' },
  { id: 'solopreneur', label: 'Solopreneur / Solo Marketer' },
] as const

export type RoleId = (typeof ROLE_OPTIONS)[number]['id']

export const STAGE_OPTIONS = [
  { id: 'pre-revenue', label: 'Pre-revenue / pre-product-market-fit' },
  { id: 'under-1m', label: 'Under $1M ARR' },
  { id: '1m-5m', label: '$1M – $5M ARR' },
  { id: '5m-10m', label: '$5M – $10M ARR' },
  { id: '10m-plus', label: '$10M+ ARR' },
] as const

export type StageId = (typeof STAGE_OPTIONS)[number]['id']

export const FUNDING_OPTIONS = [
  { id: 'vc-backed', label: 'VC / PE-backed' },
  { id: 'bootstrapped', label: 'Bootstrapped / revenue-funded' },
  { id: 'hybrid', label: 'Hybrid (some external funding, primarily revenue-driven)' },
] as const

export type FundingId = (typeof FUNDING_OPTIONS)[number]['id']

export interface Qualifiers {
  role: RoleId
  stage: StageId
  funding: FundingId
}

export const COMPLETION_FRAMING = [
  "Your score is calculated across 6 dimensions. Skipping sections means your recommendations won't account for blind spots, which is usually where the biggest gaps are.",
  'This assessment is calibrated against patterns from 20+ years of B2B marketing leadership across IBM, Adobe, MoEngage, and early-stage startups.',
]

// ── Questions ──

export const QUESTIONS: Question[] = [
  // Dimension 1 — Positioning & Messaging
  {
    id: 'q1',
    dimensionId: 'positioning',
    question: 'How clearly defined is your Ideal Customer Profile?',
    options: [
      { text: "We sell to anyone who'll buy. No formal ICP exists.", score: 1 },
      { text: 'We have a general sense of who we\'re targeting but nothing documented.', score: 2 },
      { text: "We have a documented ICP but it hasn't been validated or updated in the last 6 months.", score: 3 },
      { text: 'We have a validated ICP with firmographics, pain points, and buying triggers, reviewed quarterly.', score: 5 },
    ],
  },
  {
    id: 'q2',
    dimensionId: 'positioning',
    question: "If a prospect asks 'why should I choose you over [competitor]?', what happens?",
    options: [
      { text: 'Everyone on the team gives a different answer.', score: 1 },
      { text: "We have talking points but they're mostly feature-based (\"we have X, they don't\").", score: 2 },
      { text: "We have a positioning statement but it's not consistently used across sales, marketing, and product.", score: 3 },
      { text: 'We have a clear, tested positioning framework the whole company can articulate, grounded in a defensible advantage, not just features.', score: 5 },
    ],
  },
  {
    id: 'q3',
    dimensionId: 'positioning',
    question: 'How consistent is your messaging across website, sales decks, ads, and outbound?',
    options: [
      { text: 'Every channel says something different. Nobody owns messaging.', score: 1 },
      { text: 'Website messaging is decent but sales and marketing tell different stories.', score: 2 },
      { text: 'We have messaging guidelines but adoption is inconsistent: some channels are on-brand, others drift.', score: 3 },
      { text: 'Messaging is centrally managed, documented, and consistently applied across all customer-facing channels. Deviations get caught and corrected.', score: 5 },
    ],
  },
  {
    id: 'q4',
    dimensionId: 'positioning',
    question: 'How well does your team understand the competitive landscape?',
    options: [
      { text: "We know who the big names are but haven't done formal competitive analysis.", score: 1 },
      { text: "We've looked at competitor websites and pricing but don't track them systematically.", score: 2 },
      { text: "We have competitive intel but it lives in one person's head or a stale document.", score: 3 },
      { text: 'We maintain a live competitive matrix, updated regularly with positioning shifts, product changes, pricing moves, and win/loss patterns.', score: 5 },
    ],
  },

  // Dimension 2 — Demand Generation
  {
    id: 'q5',
    dimensionId: 'demand-gen',
    question: 'Where do your leads come from?',
    options: [
      { text: "Almost entirely from the founder's network or word of mouth.", score: 1 },
      { text: 'One or two channels (e.g., only LinkedIn outbound, or only paid ads).', score: 2 },
      { text: "Three or more active channels, but we don't know which ones actually convert to revenue.", score: 3 },
      { text: 'Diversified across inbound, outbound, and partnerships, with clear conversion data for each channel.', score: 5 },
    ],
  },
  {
    id: 'q6',
    dimensionId: 'demand-gen',
    question: 'Can you see, right now, how many qualified leads are in your pipeline and their expected close dates?',
    options: [
      { text: 'No. We track deals informally: spreadsheets, memory, or scattered notes.', score: 1 },
      { text: "We have a CRM but it's inconsistently updated. Pipeline data is unreliable.", score: 2 },
      { text: 'CRM is maintained, pipeline is visible, but forecasting is mostly gut feel.', score: 3 },
      { text: 'Pipeline is clean, stages are defined, forecasting is data-driven, and marketing can see its contribution to pipeline at any time.', score: 5 },
    ],
  },
  {
    id: 'q7',
    dimensionId: 'demand-gen',
    question: 'Do you know your conversion rates at each stage of the funnel: visitor to lead, lead to MQL, MQL to opportunity, opportunity to close?',
    options: [
      { text: "We don't track any of this.", score: 1 },
      { text: 'We track top-of-funnel (traffic, leads) but lose visibility after handoff to sales.', score: 2 },
      { text: 'We track most stages but the data is patchy or delayed: we see it in monthly reports, not in real time.', score: 3 },
      { text: 'Full-funnel conversion rates are tracked in real time. We know exactly where leads stall and what interventions work.', score: 5 },
    ],
  },
  {
    id: 'q8',
    dimensionId: 'demand-gen',
    question: 'How does your team decide where to invest marketing budget across channels?',
    options: [
      { text: "We do whatever worked last quarter, or whatever the founder/CEO read about recently.", score: 1 },
      { text: "We stick to channels we're comfortable with. We've talked about testing new ones but haven't.", score: 2 },
      { text: "We experiment occasionally but don't have a structured test-and-learn process. Results are anecdotal.", score: 3 },
      { text: 'We run structured experiments with clear hypotheses, budgets, and success criteria. Channels earn their budget based on measured performance.', score: 5 },
    ],
  },

  // Dimension 3 — Content & Thought Leadership
  {
    id: 'q9',
    dimensionId: 'content',
    question: "How would you describe your company's content production?",
    options: [
      { text: 'We publish content sporadically: when someone has time or an idea.', score: 1 },
      { text: 'We have a blog and/or social presence but no editorial calendar or consistent cadence.', score: 2 },
      { text: 'We publish regularly but content is mostly reactive (product updates, company news), not strategic.', score: 3 },
      { text: 'We have a documented content strategy tied to buyer journey stages, with a consistent publishing cadence and clear ownership.', score: 5 },
    ],
  },
  {
    id: 'q10',
    dimensionId: 'content',
    question: 'What happens after you publish a piece of content?',
    options: [
      { text: 'We publish it and hope people find it.', score: 1 },
      { text: 'We share it on social media once or twice.', score: 2 },
      { text: 'We have a distribution checklist (social, email, repurpose) but execution is inconsistent.', score: 3 },
      { text: 'Every piece of content has a distribution plan: multi-channel promotion, repurposing into formats for different audiences, and performance tracking per channel.', score: 5 },
    ],
  },
  {
    id: 'q11',
    dimensionId: 'content',
    question: 'Does your company (or its leadership) have a recognized point of view in your market?',
    options: [
      { text: "No. We're focused on product: nobody outside our customer base knows who we are.", score: 1 },
      { text: 'Our founder/CEO occasionally posts on LinkedIn or speaks at events, but it\'s not a priority.', score: 2 },
      { text: "We're building thought leadership but it's tied to one person and not integrated into the broader marketing strategy.", score: 3 },
      { text: 'Our leadership team has a visible, consistent presence in the market through content, speaking, media, or community. It\'s a deliberate part of our marketing strategy.', score: 5 },
    ],
  },
  {
    id: 'q12',
    dimensionId: 'content',
    question: 'Can you trace a piece of content back to pipeline or revenue?',
    options: [
      { text: "No. Content is a brand activity: we don't measure its business impact.", score: 1 },
      { text: "We track content metrics (views, shares, downloads) but can't connect them to leads or revenue.", score: 2 },
      { text: 'We can attribute some leads to content but the data is incomplete, especially for long-cycle or multi-touch journeys.', score: 3 },
      { text: 'We have clear attribution connecting content to leads, pipeline, and closed revenue, and we use that data to prioritize what we produce.', score: 5 },
    ],
  },

  // Dimension 4 — Marketing Ops & Tech Stack
  {
    id: 'q13',
    dimensionId: 'ops',
    question: 'How much of your marketing runs on automation?',
    options: [
      { text: 'Almost nothing. Email is manual, follow-ups are manual, lead routing is manual.', score: 1 },
      { text: 'We have basic email automation (welcome series, maybe a drip) but everything else is manual.', score: 2 },
      { text: 'We automate several workflows (nurture sequences, lead scoring, alerts) but setup is fragile and nobody fully owns it.', score: 3 },
      { text: 'Marketing automation is robust: lead scoring, nurture paths, lifecycle triggers, handoff to sales, all documented and maintained.', score: 5 },
    ],
  },
  {
    id: 'q14',
    dimensionId: 'ops',
    question: "What's the state of your CRM and contact data?",
    options: [
      { text: "We don't have a CRM, or we have one but nobody uses it properly.", score: 1 },
      { text: "CRM exists but it's messy: duplicate records, incomplete fields, no data standards.", score: 2 },
      { text: 'CRM is reasonably clean but maintenance is reactive: we clean up when something breaks or before a big campaign.', score: 3 },
      { text: 'CRM is well-maintained with defined data standards, regular hygiene processes, and clear ownership. Sales and marketing trust the data.', score: 5 },
    ],
  },
  {
    id: 'q15',
    dimensionId: 'ops',
    question: 'How well do your marketing tools work together?',
    options: [
      { text: "We use a bunch of disconnected tools. Nothing talks to anything else.", score: 1 },
      { text: 'Some tools are integrated but there are major gaps: data lives in silos and requires manual exports/imports.', score: 2 },
      { text: "Core tools are integrated (CRM + email + analytics) but secondary tools aren't: reporting requires pulling from multiple sources.", score: 3 },
      { text: 'Our stack is well-integrated with clean data flow across tools. We have a single source of truth for key metrics and can pull a full-funnel view without manual work.', score: 5 },
    ],
  },
  {
    id: 'q16',
    dimensionId: 'ops',
    question: "If your CEO asks 'how is marketing performing this month?', how quickly can you answer with data?",
    options: [
      { text: 'It would take days. I\'d have to pull numbers from multiple places and build a report from scratch.', score: 1 },
      { text: "I could give a partial answer from memory but wouldn't have a ready report.", score: 2 },
      { text: "I have dashboards but they're not always up to date or comprehensive. I'd need an hour to pull a credible answer.", score: 3 },
      { text: 'I can answer in minutes with a live dashboard or automated report that covers all key metrics.', score: 5 },
    ],
  },

  // Dimension 5 — Measurement & Attribution
  {
    id: 'q17',
    dimensionId: 'measurement',
    question: 'What marketing KPIs does your company track?',
    options: [
      { text: "We don't have defined marketing KPIs. We track whatever gets asked about.", score: 1 },
      { text: 'We track activity metrics (posts published, emails sent, events attended) but not outcome metrics.', score: 2 },
      { text: "We track outcome metrics (leads, MQLs, pipeline) but they aren't tied to business goals or reviewed consistently.", score: 3 },
      { text: 'We have clearly defined KPIs tied to business objectives, reviewed on a regular cadence, with targets and accountability.', score: 5 },
    ],
  },
  {
    id: 'q18',
    dimensionId: 'measurement',
    question: 'How often does marketing formally report on performance, and to whom?',
    options: [
      { text: "We don't have a regular reporting rhythm. Performance comes up when something goes wrong or a board meeting is approaching.", score: 1 },
      { text: "Monthly, but it's mostly a data dump: numbers without interpretation or recommended actions.", score: 2 },
      { text: 'Regular reporting exists with some analysis, but it\'s siloed: marketing reports to marketing, rarely to the executive team or cross-functionally.', score: 3 },
      { text: 'Marketing reports regularly to leadership with performance data, analysis, and strategic recommendations. Reporting drives decisions, not just documentation.', score: 5 },
    ],
  },
  {
    id: 'q19',
    dimensionId: 'measurement',
    question: 'How do you attribute leads and revenue to marketing activities?',
    options: [
      { text: "We don't. Sales gets credit for everything, or nobody tracks attribution at all.", score: 1 },
      { text: 'Last-touch attribution only: whatever the lead touched last before converting gets the credit.', score: 2 },
      { text: "We use a basic multi-touch model but acknowledge it's imperfect. Some channels are probably under- or over-credited.", score: 3 },
      { text: 'We use a well-understood attribution model (multi-touch, weighted, or blended) with known limitations, cross-referenced with qualitative data to sanity-check.', score: 5 },
    ],
  },
  {
    id: 'q20',
    dimensionId: 'measurement',
    question: 'When your team makes a significant marketing decision, new campaign, channel shift, messaging change, what drives it?',
    options: [
      { text: 'Gut feel, CEO preference, or whatever the loudest voice in the room wants.', score: 1 },
      { text: "A mix of intuition and data, but data is usually brought in to justify a decision already made.", score: 2 },
      { text: "Data informs decisions but isn't always available or timely enough. Sometimes we move before the data catches up.", score: 3 },
      { text: 'Significant decisions are backed by data. We have clear criteria for what "good enough data" looks like and when to act on imperfect information.', score: 5 },
    ],
  },

  // Dimension 6 — Team & Leadership
  {
    id: 'q21',
    dimensionId: 'team',
    question: 'Who owns marketing at your company?',
    options: [
      { text: 'Nobody, really. The founder/CEO does it ad hoc, or it\'s split across people who have other primary roles.', score: 1 },
      { text: "One junior marketer who handles execution but doesn't set strategy.", score: 2 },
      { text: 'A marketing lead or small team that owns execution and some strategy, but major decisions go through the CEO.', score: 3 },
      { text: 'A senior marketing leader (CMO, VP, or experienced Head of Marketing) who owns both strategy and execution, with a mandate from leadership.', score: 5 },
    ],
  },
  {
    id: 'q22',
    dimensionId: 'team',
    question: 'How structured are your marketing processes: campaign planning, launch workflows, cross-functional coordination?',
    options: [
      { text: 'There are no documented processes. Everything runs on tribal knowledge and ad hoc coordination.', score: 1 },
      { text: 'A few informal processes exist but they break when someone goes on leave or a new person joins.', score: 2 },
      { text: 'Core processes are documented but unevenly followed. Some campaigns run smoothly, others are chaotic.', score: 3 },
      { text: 'Marketing has documented, repeatable processes for campaign execution, content production, and cross-functional handoffs. New team members can ramp quickly.', score: 5 },
    ],
  },
  {
    id: 'q23',
    dimensionId: 'team',
    question: 'How well does marketing work with sales, product, and customer success?',
    options: [
      { text: 'Marketing operates in isolation. Other teams see it as a service desk or don\'t engage with it at all.', score: 1 },
      { text: "Marketing talks to sales occasionally but there's no formal alignment: different goals, different metrics, frequent friction.", score: 2 },
      { text: 'Some alignment exists (shared meetings, lead handoff process) but it breaks down under pressure. Marketing and sales still blame each other when targets are missed.', score: 3 },
      { text: 'Marketing is tightly aligned with sales, product, and CS: shared goals, regular syncs, feedback loops, and joint accountability for pipeline and revenue.', score: 5 },
    ],
  },
  {
    id: 'q24',
    dimensionId: 'team',
    question: 'How is your marketing budget decided and distributed?',
    options: [
      { text: "There's no defined marketing budget. Spending happens ad hoc: approved per request or pulled from a general pool.", score: 1 },
      { text: "There's a rough annual number but allocation isn't strategic: it goes where it's always gone, or wherever urgency dictates.", score: 2 },
      { text: 'Budget is planned annually with channel allocations, but reallocation is slow: underperforming channels keep their budget longer than they should.', score: 3 },
      { text: 'Budget is allocated strategically across channels and initiatives based on performance data. Reallocation happens within the quarter based on what\'s working.', score: 5 },
    ],
  },
  {
    id: 'q25',
    dimensionId: 'team',
    question: 'How far out does your marketing team plan?',
    options: [
      { text: "We don't plan. Marketing is reactive: we respond to requests and opportunities as they come.", score: 1 },
      { text: 'We plan 2-4 weeks ahead, mostly at the campaign or task level. No strategic roadmap.', score: 2 },
      { text: "We have a quarterly plan but it's loosely followed. Priorities shift frequently and the plan is more aspirational than operational.", score: 3 },
      { text: 'We plan quarterly with clear goals, campaigns, and milestones, reviewed bi-weekly and adjusted based on performance and market changes. Annual strategic direction informs quarterly execution.', score: 5 },
    ],
  },
]

export function questionsForDimension(dimensionId: DimensionId): Question[] {
  return QUESTIONS.filter((q) => q.dimensionId === dimensionId)
}

// ── Tiers ──

export interface Tier {
  id: 'foundation' | 'emerging' | 'scaling' | 'optimized'
  label: string
  headline: string
  min: number
  max: number
  // Source of truth: 00-context/maturity-score-sample-report.html (:root
  // --tier-* tokens).
  color: string
}

export const TIERS: Tier[] = [
  {
    id: 'foundation',
    label: 'Foundation',
    headline: 'Your marketing is founder-driven. That got you here. It won\'t get you to the next stage.',
    min: 1.0,
    max: 1.9,
    color: '#c0392b',
  },
  {
    id: 'emerging',
    label: 'Emerging',
    headline: 'You\'ve started building the function but it\'s fragile, dependent on individuals, not systems.',
    min: 2.0,
    max: 2.9,
    color: '#b57738',
  },
  {
    id: 'scaling',
    label: 'Scaling',
    headline: 'The structure is there. Now it\'s about consistency, measurement, and eliminating the gaps.',
    min: 3.0,
    max: 3.9,
    color: '#4a7b8c',
  },
  {
    id: 'optimized',
    label: 'Optimized',
    headline: 'Your marketing function is mature. Focus on efficiency, experimentation, and strategic bets.',
    min: 4.0,
    max: 5.0,
    color: '#27874a',
  },
]

export function tierForScore(score: number): Tier {
  const tier = TIERS.find((t) => score >= t.min && score <= t.max)
  return tier ?? TIERS[0]
}

// ── Role-based language tailoring ──

export const ROLE_LANGUAGE: Record<RoleId, (dimensionName: string) => string> = {
  founder: (d) =>
    `You need a senior marketing hire, not a junior executor. The gap in ${d} is a strategy problem, not a capacity problem.`,
  cmo: (d) =>
    `Your ${d} gap suggests a process or resource issue. Build the case internally, here's what the business impact looks like.`,
  manager: (d) =>
    `You're seeing the symptoms of weak ${d} in your day-to-day. This recommendation gives you language to escalate it.`,
  consultant: (d) =>
    `Your client scores low on ${d}. Here's how to frame the recommendation and what to prioritize in the first 90 days.`,
  solopreneur: (d) =>
    `With limited resources, ${d} is where your time has the highest ROI right now. Start here before investing elsewhere.`,
}

// ── One-sentence gap summaries (used for the ungated top 3 priority gaps) ──

export const DIMENSION_GAP_SUMMARY: Record<DimensionId, string> = {
  positioning:
    'Without a validated ICP and a tested positioning statement, every other marketing dollar works harder than it should.',
  'demand-gen':
    'Lead sources are narrow or unmeasured, so you can\'t tell which channels are actually worth the budget.',
  content:
    'Content is inconsistent or untracked, which means it builds little authority and even less pipeline.',
  ops:
    'Manual processes and disconnected tools are quietly eating hours that should go toward strategy.',
  measurement:
    'Without reliable KPIs and attribution, marketing decisions are still running on gut feel more than data.',
  team:
    'Ownership, process, or budget allocation is unclear, which slows down every other dimension.',
}

// ── AI Readiness Overlay ──
// Source of truth: 00-context/ai-marketing-maturity-framework.md

export type AIWorkflowId =
  | 'target-segmentation'
  | 'campaign-strategy'
  | 'campaign-execution'
  | 'distribution'
  | 'operations'
  | 'analytics-optimization'

export interface AIWorkflow {
  id: AIWorkflowId
  name: string
}

export const AI_WORKFLOWS: AIWorkflow[] = [
  { id: 'target-segmentation', name: 'Target & Segmentation' },
  { id: 'campaign-strategy', name: 'Campaign Strategy' },
  { id: 'campaign-execution', name: 'Campaign Execution' },
  { id: 'distribution', name: 'Distribution' },
  { id: 'operations', name: 'Operations' },
  { id: 'analytics-optimization', name: 'Analytics & Optimization' },
]

export type AIStageId = 'unaware' | 'experimenting' | 'functional' | 'integrated'

export interface AIStage {
  id: AIStageId
  label: string
  min: number
  max: number
}

export const AI_STAGES: AIStage[] = [
  { id: 'unaware', label: 'Unaware', min: 1.0, max: 1.9 },
  { id: 'experimenting', label: 'Experimenting', min: 2.0, max: 2.9 },
  { id: 'functional', label: 'Functional', min: 3.0, max: 3.9 },
  { id: 'integrated', label: 'Integrated', min: 4.0, max: 5.0 },
]

export function aiStageForScore(score: number): AIStage {
  const stage = AI_STAGES.find((s) => score >= s.min && score <= s.max)
  return stage ?? AI_STAGES[0]
}

export type AIQuestionId = 'aq1' | 'aq2' | 'aq3' | 'aq4' | 'aq5'

export interface AIQuestion {
  id: AIQuestionId
  question: string
  options: QuestionOption[]
}

export const AI_TRANSITION_COPY =
  'Last section. Five questions about how AI fits into your marketing workflows.'

export const AI_QUESTIONS: AIQuestion[] = [
  {
    id: 'aq1',
    question:
      'Across your marketing workflows (research, content, design, distribution, operations, analytics), how broadly is AI being used?',
    options: [
      { text: "We're not using AI in any meaningful way. Maybe someone has a personal ChatGPT login.", score: 1 },
      { text: "We use AI for one or two tasks (usually content drafting or image generation) but it's individual, not systematic.", score: 2 },
      { text: 'AI is used across a few workflows but adoption is uneven. Some team members use it daily, others haven\'t started.', score: 3 },
      { text: 'AI is embedded across multiple marketing workflows with defined use cases, shared prompts or templates, and team-wide adoption.', score: 5 },
    ],
  },
  {
    id: 'aq2',
    question: 'How does your team use AI in content creation and creative production?',
    options: [
      { text: "We don't. All content is produced manually.", score: 1 },
      { text: 'We use AI for first drafts or brainstorming, but a human rewrites most of the output.', score: 2 },
      { text: 'AI handles specific content tasks end-to-end (social posts, email subject lines, ad variations) but strategic content is still fully manual.', score: 3 },
      { text: 'AI is integrated into the content workflow with clear guidelines on where it adds value and where human judgment is required. Output quality is consistent and the team knows when to override.', score: 5 },
    ],
  },
  {
    id: 'aq3',
    question: 'How does your team use AI for analytics, research, or customer insights?',
    options: [
      { text: "We don't use AI for data or insights. Reporting is manual or dashboard-based.", score: 1 },
      { text: "We've experimented with AI for data summarization or competitor research, but it's not a regular workflow.", score: 2 },
      { text: 'AI is used for specific analytical tasks (campaign analysis, audience research, trend spotting) but the insights still require significant manual interpretation.', score: 3 },
      { text: 'AI is a core part of how we generate insights: surfacing patterns, analyzing performance data, and accelerating research, with human judgment applied to strategic interpretation.', score: 5 },
    ],
  },
  {
    id: 'aq4',
    question: 'When your team uses AI, how is it integrated into day-to-day operations?',
    options: [
      { text: "It's not. AI is something people use on their own time for personal productivity.", score: 1 },
      { text: 'A few people use AI tools but there are no shared workflows, prompts, or standards. Everyone figures it out individually.', score: 2 },
      { text: 'We have some shared AI workflows (prompt libraries, approved tools, defined use cases) but adoption and quality are inconsistent.', score: 3 },
      { text: 'AI tools are part of our documented workflows with clear ownership, quality standards, and regular evaluation of what\'s working. New use cases are tested deliberately.', score: 5 },
    ],
  },
  {
    id: 'aq5',
    question: "How would you describe your marketing team's ability to use AI effectively?",
    options: [
      { text: "Most of the team hasn't used AI tools beyond basic curiosity. There's no training or shared knowledge.", score: 1 },
      { text: "A few team members are proficient, but they're self-taught. The rest of the team is either skeptical or unsure where to start.", score: 2 },
      { text: "The team generally understands AI's potential and uses it occasionally, but nobody would call it a core competency. Quality of AI usage varies widely.", score: 3 },
      { text: 'The team treats AI as a skill, not a novelty. There\'s shared understanding of what AI does well and where it falls short, and the team actively evaluates new capabilities as they emerge.', score: 5 },
    ],
  },
]

// One-sentence implication per stage, shown below the radar chart in the
// ungated results preview.
export const AI_READINESS_IMPLICATION: Record<AIStageId, string> = {
  unaware:
    "AI isn't part of the conversation yet, which means competitors already using it are moving faster on the same budget.",
  experimenting:
    "Usage is personal and inconsistent, so the gains stay with individuals instead of compounding for the team.",
  functional:
    'AI is doing real work in defined workflows, but adoption is uneven and quality still depends on who ran the prompt.',
  integrated:
    'AI is a team capability with shared standards, not a novelty. The bottleneck is likely elsewhere in the function.',
}

// Cross-reference: which main dimension each AI workflow pairs with in the
// full report (see ai-marketing-maturity-framework.md cross-reference table).
export const AI_WORKFLOW_MAIN_DIMENSION: Record<AIWorkflowId, DimensionId> = {
  'target-segmentation': 'positioning',
  'campaign-strategy': 'positioning',
  'campaign-execution': 'content',
  distribution: 'demand-gen',
  operations: 'ops',
  'analytics-optimization': 'measurement',
}

// ── Bootstrapped company context notes (per dimension, full report only) ──

export const BOOTSTRAPPED_NOTES: Record<DimensionId, string> = {
  positioning:
    'This is where bootstrapped discipline should be an advantage but often isn\'t. With limited spend, every rupee needs to work harder, and weak positioning means your limited budget is less efficient. Fixing this has zero incremental cost and the highest immediate ROI of any dimension.',
  'demand-gen':
    'Bootstrapped companies tend to over-index on lead generation from one or two channels that worked early. That\'s rational at the start, but it creates a ceiling. Diversifying doesn\'t mean spending more, it means testing whether your current spend is in the right places.',
  content:
    'Content investment feels risky when you need revenue this quarter, not in 12 months. But bootstrapped companies have an asset funded companies don\'t: real operational stories. Your sales conversations, customer wins, and hard-learned lessons are content that costs nothing to produce and compounds over time.',
  ops:
    'Bootstrapped companies often run lean stacks well: fewer tools, less complexity, less waste. If your score is low here, it\'s likely because growth has outpaced your infrastructure, not because you under-invested. The fix is usually integration and process, not more tools.',
  measurement:
    'Your instinct to measure ROI at the activity level is a genuine strength: many funded companies lack this discipline entirely. The gap for bootstrapped companies is usually strategic measurement, knowing which investments compound over quarters, not just which ones paid back this month. Activity-level ROI favors short-cycle tactics and systematically under-values brand, SEO, and content.',
  team:
    'Bootstrapped companies at the $1M-$5M stage typically spend 2-5% of revenue on marketing, compared to 15-25% for funded companies at the same stage. That\'s not wrong, it\'s a capital constraint. The question isn\'t whether you\'re spending enough, it\'s whether your current spend is allocated to the right things and whether the founder is still the de facto CMO when they should have delegated by now.',
}
