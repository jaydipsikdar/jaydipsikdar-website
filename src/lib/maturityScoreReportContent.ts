// Full-report content for the Marketing Maturity Score PDF.
// "What this means" paragraphs are adapted from the tier calibration
// language in 00-context/maturity-score-benchmarks-and-brand-direction.md.
// "Recommendation" paragraphs are original, one per dimension per tier.
// Source of truth for structure: 00-context/maturity-score-sample-report.html

import type { DimensionId, StageId, FundingId, Tier } from './maturityScoreData'
import { STAGE_OPTIONS, DIMENSIONS, dimensionById, AI_WORKFLOWS } from './maturityScoreData'
import type { DimensionScore, AIAnswers, AIWorkflowEstimate } from './maturityScoring'

type TierId = Tier['id']

export const WHAT_THIS_MEANS: Record<DimensionId, Record<TierId, string>> = {
  positioning: {
    foundation:
      "There's no documented ideal customer profile and no positioning framework. Messaging is inconsistent across whatever channels you use, and the team doesn't have a shared answer for why a prospect should choose you. This is common and not a crisis on its own, but it means every other marketing dollar works harder than it should.",
    emerging:
      'Your ICP exists informally, everyone roughly agrees on who you serve, but nothing is documented or validated. Differentiation talking points lean feature-based rather than value-based, and messaging varies depending on who is telling the story. The foundation is there. It just is not codified.',
    scaling:
      'Positioning is documented and your ICP has been validated at some point, but messaging guidelines are unevenly adopted across sales, marketing, and product. Some channels are on-brand, others drift. The gap is enforcement, not definition.',
    optimized:
      'You have a tested positioning framework the whole company can articulate, a validated ICP reviewed on a real cadence, and centrally managed messaging with active competitive intelligence. This dimension is a genuine strength: protect it as the team grows.',
  },
  'demand-gen': {
    foundation:
      'Leads come almost entirely from the founder\'s network or word of mouth. There is no CRM in meaningful use and no pipeline tracking, so you cannot say with confidence where your next ten customers are coming from.',
    emerging:
      'One or two channels carry all of demand gen, usually whatever worked early. A CRM exists but is inconsistently updated, so you can report lead volume but not which channels actually convert to revenue.',
    scaling:
      'Three or more channels are active and a CRM is maintained, but conversion tracking is patchy and forecasting still leans on gut feel. You can see pipeline, but you cannot yet say with confidence which channel is earning its budget.',
    optimized:
      'Demand generation is diversified across inbound, outbound, and partnerships, with clear conversion data for each channel and pipeline that is genuinely forecastable. This is one of the harder dimensions to mature. Treat it as a real advantage.',
  },
  content: {
    foundation:
      'Content is published sporadically, when someone has time or an idea strikes. There is no editorial calendar, no strategy, and no distribution plan beyond hoping people find it. Nobody outside your existing customer base has much reason to know who you are.',
    emerging:
      'You publish with some regularity, but content is mostly reactive: product updates, company news, whatever is top of mind. Distribution is a share on social media, once or twice, and then the piece disappears.',
    scaling:
      'A documented content strategy exists and publishing has a real cadence, but the connection between content and pipeline is still mostly invisible, and distribution beyond the first post is inconsistent.',
    optimized:
      'Content strategy ties directly to the buyer journey, production is scalable rather than dependent on one person, and you can trace content back to pipeline and revenue. This is rare among companies your size. It compounds.',
  },
  ops: {
    foundation:
      'Marketing tools are disconnected and mostly manual: email, follow-ups, and lead routing all take a human doing it by hand every time. There is no CRM in real use, or one that nobody trusts.',
    emerging:
      'Basic automation exists (a welcome series, maybe a drip) but everything past that is manual. The CRM is messy: duplicate records, incomplete fields, no data standards anyone enforces.',
    scaling:
      'Your core stack, CRM, email, and analytics, is integrated and several workflows are automated, but the setup is fragile and no one fully owns it. Dashboards exist but are not always current, and secondary tools still require manual exports.',
    optimized:
      'Your stack is well-integrated with clean data flow, automation covers lead scoring, nurture, and lifecycle triggers, and you have a single source of truth for key metrics. This is your strongest operational lever. Protect it as you scale.',
  },
  measurement: {
    foundation:
      "There are no defined marketing KPIs, no regular reporting rhythm, and no attribution model. Marketing performance only comes up when something goes wrong or a board meeting forces the question.",
    emerging:
      'You track activity metrics, posts published, emails sent, but not outcome metrics tied to the business. Attribution is last-touch at best, and reporting is a monthly data dump without much analysis or a clear audience beyond marketing itself.',
    scaling:
      'Outcome metrics are tracked and a basic multi-touch attribution model is in place, but the data is not always timely enough to act on before a decision has already been made elsewhere.',
    optimized:
      'KPIs are clearly tied to business objectives, attribution is well understood and cross-referenced with qualitative signals, and reporting drives real decisions rather than just documenting what happened. Few companies at any stage do this well.',
  },
  team: {
    foundation:
      'Nobody really owns marketing. The founder or CEO does it ad hoc, or it is split across people whose primary job is something else. There is no defined budget, no planning cadence, and no formal alignment with sales or product.',
    emerging:
      'One junior marketer or fractional support handles execution but does not set strategy. Budget exists but is allocated reactively, planning horizon is a few weeks, and other teams tend to treat marketing as a service desk.',
    scaling:
      'A marketing lead or small team owns execution and some strategy, but major calls still route through the CEO. Budget is planned annually but reallocates slowly, and quarterly plans exist on paper more than in practice.',
    optimized:
      'A senior marketing leader owns both strategy and execution with a real mandate from leadership. Budget reallocates based on performance within the quarter, processes are documented, and alignment with sales, product, and CS is tight. This is a mature marketing function.',
  },
}

export const RECOMMENDATION: Record<DimensionId, Record<TierId, string>> = {
  positioning: {
    foundation:
      'Before anything else, write down who you serve, the one problem you solve better than the alternative, and the proof that backs it up. Test it in five real conversations. You cannot fix messaging consistency until there is a single message to be consistent about.',
    emerging:
      'Document what is currently informal. Write the positioning statement down, validate it with five customers and five prospects, and give sales and marketing the same language to use. This has zero incremental cost and the highest immediate return of any dimension.',
    scaling:
      'The gap is adoption, not definition. Audit your last month of customer-facing content against your positioning guidelines and fix the drift. Assign one owner who is responsible for catching deviations before they ship.',
    optimized:
      'Keep the review cadence quarterly and push competitive intelligence from a document into a living system. The risk at this level is complacency: revisit the positioning as the market and competitors move, not just when something breaks.',
  },
  'demand-gen': {
    foundation:
      'Get a CRM in place, even a simple one, and start tracking every lead in one place. You do not need more channels yet. You need to see what is actually happening in the one or two channels you already have.',
    emerging:
      'Do not add channels yet. Instrument the ones you have so you can see conversion rates at each stage, and find out whether your problem is volume or conversion before spending more anywhere.',
    scaling:
      'Move from patchy tracking to structured experimentation. Give each channel a hypothesis, a budget, and a success threshold, and let the data (not habit) decide where next quarter\'s spend goes.',
    optimized:
      'Protect the attribution discipline you have built as you add channels or team members. The risk at this level is process decay: make sure new hires inherit the same rigor, not a simplified version of it.',
  },
  content: {
    foundation:
      'Start with what already exists: your own sales conversations. Take one question a prospect asked this week and write a 500-word answer. Publish it. The goal for 90 days is cadence, not polish.',
    emerging:
      'Put a simple editorial calendar in place, even a monthly one, and shift the mix from reactive updates toward content tied to what your buyers are actually deciding. Add one distribution step (email, repurpose) to every piece you publish.',
    scaling:
      'Close the loop between content and pipeline. Add basic attribution, even self-reported "how did you hear about us," so you can tell which pieces are earning their keep and double down there.',
    optimized:
      'Your production model is scalable. Use that advantage to go deeper on fewer, higher-authority formats rather than wider on more channels, and keep the attribution loop tight as volume increases.',
  },
  ops: {
    foundation:
      'Pick one CRM and commit to using it for every lead, every time, starting this week. Automation and integration come later. Right now the job is getting one source of truth in place.',
    emerging:
      'Add one real automation: a lead-scoring rule or a nurture sequence for your highest-intent segment. Then spend an afternoon cleaning the CRM so the automation has good data to work with.',
    scaling:
      'Before your next tool purchase, document your existing workflows: lead routing, nurture triggers, reporting cadence. Written processes are what survive a team member going on leave. More tools without documentation just adds more fragility.',
    optimized:
      'This is your strongest dimension. The main risk now is tool sprawl: audit your stack annually and retire anything that duplicates a job another tool already does well.',
  },
  measurement: {
    foundation:
      'Pick three KPIs that tie directly to revenue, marketing-sourced pipeline is a good place to start, and report them monthly, even informally. You need a starting baseline before you can improve anything.',
    emerging:
      'Move from activity metrics to outcome metrics. Track marketing-sourced pipeline and a basic conversion rate at each funnel stage, and put a 30-minute monthly review on the calendar where those numbers actually get discussed.',
    scaling:
      'Tighten the timing gap: get reporting frequent enough to inform decisions before they are made, not just to document what already happened. A simple live dashboard beats a polished monthly deck.',
    optimized:
      'Push from good attribution toward strategic measurement: track which investments compound over quarters, not just which ones paid back this month. This protects long-cycle bets like content and brand from being starved by short-cycle thinking.',
  },
  team: {
    foundation:
      "Name one person, even part time, who is accountable for marketing. Ad hoc ownership by the founder is fine for a few months. It is not a system, and it will not scale past this stage.",
    emerging:
      'Decide whether your current marketing hire is a strategy person or an execution person, and hire for whichever one they are not. Give them a real budget and a quarterly plan, not just a task list.',
    scaling:
      'Push decision rights down. If every major call still routes through the CEO, that is the ceiling on how fast marketing can move. Document the processes that currently live in one person\'s head so the team survives transitions.',
    optimized:
      'Keep reallocating budget based on performance rather than history, and keep the cross-functional alignment tight as headcount grows. The risk at this level is process ossifying into bureaucracy: revisit what "documented" means every year or two.',
  },
}

// ── Stage + funding benchmark narrative ──

interface ScoreRange {
  min: number
  max: number
}

const STAGE_BASE_RANGE: Record<StageId, ScoreRange> = {
  'pre-revenue': { min: 1.0, max: 1.8 },
  'under-1m': { min: 1.5, max: 2.3 },
  '1m-5m': { min: 2.0, max: 2.9 },
  '5m-10m': { min: 2.6, max: 3.4 },
  '10m-plus': { min: 3.2, max: 4.2 },
}

const FUNDING_ADJECTIVE: Record<FundingId, string> = {
  'vc-backed': 'VC-backed',
  bootstrapped: 'bootstrapped',
  hybrid: 'hybrid-funded',
}

const FUNDING_SHIFT: Record<FundingId, number> = {
  'vc-backed': 0.3,
  hybrid: 0.1,
  bootstrapped: -0.2,
}

const STAGE_PATTERN_SENTENCE: Record<StageId, string> = {
  'pre-revenue':
    'At this stage, the pattern is consistent: positioning and messaging are still being discovered through early customer conversations, and nothing is documented yet because the product itself is still moving.',
  'under-1m':
    "The pattern here is consistent: ops tends to be the strongest dimension (you've had to get organized just to keep up), while content and measurement are the most common gaps because there isn't yet a dedicated owner for either.",
  '1m-5m':
    "The pattern at this stage is consistent: ops and positioning tend to be the strongest dimensions (you've survived long enough to have something working), while content and measurement are the most common gaps.",
  '5m-10m':
    'The pattern here is consistent: teams at this stage usually have a senior marketing hire in place and a working stack, but measurement discipline and cross-functional alignment with sales lag behind.',
  '10m-plus':
    'The pattern at this stage is consistent: most of the fundamentals are in place, and the differentiator between companies that keep compounding and those that plateau is usually strategic measurement and content depth, not execution basics.',
}

function stageLabel(stageId: StageId): string {
  return STAGE_OPTIONS.find((s) => s.id === stageId)?.label ?? stageId
}

export function benchmarkParagraph(stage: StageId, funding: FundingId, overallScore: number): string {
  const base = STAGE_BASE_RANGE[stage]
  const shift = FUNDING_SHIFT[funding]
  const min = Math.max(1, Math.round((base.min + shift) * 10) / 10)
  const max = Math.min(5, Math.round((base.max + shift) * 10) / 10)
  const adjective = FUNDING_ADJECTIVE[funding]
  const inRange = overallScore >= min && overallScore <= max

  const rangeSentence = `Most ${adjective} B2B companies at the ${stageLabel(stage)} stage score between ${min.toFixed(1)} and ${max.toFixed(1)} overall. Your score of ${overallScore.toFixed(1)} is ${inRange ? 'within that range' : overallScore > max ? 'above that range' : 'below that range'}.`

  return `${rangeSentence} ${STAGE_PATTERN_SENTENCE[stage]} The differentiator between companies that grow through this stage and those that stall is usually the willingness to invest in the dimensions that don't pay back immediately, specifically content, brand, and strategic measurement.`
}

// ── 90-day priorities ──

const PRIORITY_TITLE: Record<DimensionId, string> = {
  positioning: 'Document your positioning: write the one-pager you would give a new hire',
  'demand-gen': 'Instrument your funnel before adding another channel',
  content: 'Build a content cadence from your own sales conversations',
  ops: 'Document your workflows before buying another tool',
  measurement: 'Pick three KPIs tied to revenue and review them monthly',
  team: 'Decide whether your marketing hire needs to be strategy or execution',
}

const PRIORITY_DETAIL: Record<DimensionId, string> = {
  positioning:
    'Write a single document that answers who your ICP is, what problem you solve, why you and not the alternative, and what proof backs it up. Test it with five customers. This document becomes the foundation for content, campaigns, and hiring briefs.',
  'demand-gen':
    'Set up visibility into conversion rates at each funnel stage before spending on a new channel. Once you can see where leads stall, you will know whether the problem is volume or conversion.',
  content:
    'Take one question or objection from your sales calls each week and publish a short answer. The goal for the next 90 days is cadence, not polish. You should have close to 12 published pieces by the end.',
  ops:
    'Write down your lead routing, nurture triggers, and reporting cadence before your next tool purchase. Documented process is what survives a team transition. More tools without it just adds fragility.',
  measurement:
    'Set up tracking for marketing-sourced pipeline and one or two conversion metrics, and put a 30-minute monthly review on the calendar. You do not need a sophisticated model yet, just consistent measurement.',
  team:
    'Assess whether your current marketing hire is executing well without direction, or setting direction without being able to execute, and hire to cover whichever gap that leaves.',
}

export function ninetyDayPriorities(weakest: DimensionScore[]): { title: string; detail: string }[] {
  return weakest.slice(0, 3).map((w) => ({
    title: PRIORITY_TITLE[w.dimensionId],
    detail: PRIORITY_DETAIL[w.dimensionId],
  }))
}

// ── Overall assessment paragraph (page 1 of the full report) ──

export function overallAssessment(
  dimensionScores: DimensionScore[],
  funding: FundingId
): string {
  const sorted = [...dimensionScores].sort((a, b) => b.score - a.score)
  const strongest = dimensionById(sorted[0].dimensionId)
  const weakest = [...dimensionScores]
    .filter((d) => d.dimensionId !== strongest.id)
    .sort((a, b) => a.score - b.score)
  const weakestTwo = weakest.slice(0, 2).map((w) => dimensionById(w.dimensionId).name)

  const fundingClause =
    funding === 'bootstrapped'
      ? 'As a bootstrapped company, your biggest risk is continuing to invest in what got you here without testing whether it will get you to the next stage.'
      : funding === 'vc-backed'
        ? 'With outside capital funding growth, the risk is spending ahead of the systems that would make that spend efficient.'
        : 'Balancing external funding with revenue discipline, the risk is under-investing in the dimensions that do not pay back this quarter.'

  return `Your marketing function has moved beyond founder-only execution, but several systems are still fragile. You have real strength in ${strongest.name.toLowerCase()}, but gaps in ${weakestTwo.join(' and ')} mean decisions are being made with incomplete information. ${fundingClause}`
}

// ── AI Readiness Overlay: pattern summary ──
// Replaces per-workflow paragraphs with one consolidated read on the
// heatmap: where adoption is furthest ahead, where the biggest gap is, and
// one observation about the shape of the pattern.

export function aiReadinessPatternSummary(estimates: AIWorkflowEstimate[]): string {
  const byWorkflow = new Map(estimates.map((e) => [e.workflowId, e]))
  const sorted = [...estimates].sort((a, b) => b.score - a.score)
  const strongest = sorted[0]
  const weakest = sorted[sorted.length - 1]
  const strongestName = AI_WORKFLOWS.find((w) => w.id === strongest.workflowId)!.name
  const weakestName = AI_WORKFLOWS.find((w) => w.id === weakest.workflowId)!.name

  const range = strongest.score - weakest.score
  let observation: string
  if (range <= 1) {
    observation = 'Adoption is fairly even across workflows rather than concentrated in one or two.'
  } else {
    const execution = byWorkflow.get('campaign-execution')?.score ?? 0
    const strategy = byWorkflow.get('campaign-strategy')?.score ?? 0
    const segmentation = byWorkflow.get('target-segmentation')?.score ?? 0
    if (execution - Math.max(strategy, segmentation) >= 1) {
      observation =
        'The pattern is a common one: execution is ahead of strategy, AI is producing things faster before it is helping decide what to produce.'
    } else {
      observation = `Adoption is concentrated in ${strongestName.toLowerCase()} and thin everywhere else.`
    }
  }

  return `You are furthest ahead in ${strongestName.toLowerCase()}, at the ${strongest.stage.label.toLowerCase()} stage. The biggest gap is ${weakestName.toLowerCase()}, still at the ${weakest.stage.label.toLowerCase()} stage. ${observation}`
}

// ── Team composition / resource gap pattern matching ──
// Doubles as Consulting Bridge Section 1 ("Your Resource Gap") and the
// team-composition contextual output: both are the same inference over the
// same scoring pattern, so they're generated together rather than twice.

const HIRE_TYPE: Record<DimensionId, string> = {
  positioning: 'a senior positioning or product marketing lead',
  'demand-gen': 'a growth marketer who can own pipeline and instrumentation together',
  content: 'a senior content strategist',
  ops: 'an ops-oriented hire, or a fractional marketing ops resource',
  measurement: 'someone who can own reporting and attribution end to end',
  team: 'a senior marketing leader who can own strategy and execution',
}

interface ResourceGapInsight {
  recommendation: string
  question: string
}

function inferResourceGap(dimensionScores: DimensionScore[]): ResourceGapInsight {
  const byId = new Map(dimensionScores.map((d) => [d.dimensionId, d.score]))
  const score = (id: DimensionId) => byId.get(id) ?? 0
  const isLow = (id: DimensionId) => score(id) <= 2.4
  const isHigh = (id: DimensionId) => score(id) >= 3.5

  if (isLow('content') && isLow('ops') && isHigh('measurement')) {
    return {
      recommendation:
        "Your gap pattern suggests you need a senior content strategist before you need a marketing ops hire. Your measurement infrastructure can already support content scaling. Your production can't keep up with it.",
      question: 'Should that hire come in-house, fractional, or through an agency retainer?',
    }
  }

  if (isLow('demand-gen') && isLow('measurement')) {
    return {
      recommendation:
        "Your demand generation and measurement gaps are linked: you need someone who can build the pipeline and instrument it at the same time. That's typically a growth marketer, not a brand marketer.",
      question: 'Should that hire land before or after you fix the underlying data infrastructure?',
    }
  }

  const otherThanTeam = DIMENSIONS.filter((d) => d.id !== 'team')
  const avgOthers = otherThanTeam.reduce((sum, d) => sum + score(d.id), 0) / otherThanTeam.length
  if (isLow('team') && avgOthers >= 3.5) {
    return {
      recommendation:
        "Your marketing is performing despite a structural leadership gap. That's fragile: the next hire should be a senior marketing leader who can protect and scale what's already working, not another individual contributor.",
      question: 'What seniority and mandate does that leader need to actually hold the function together?',
    }
  }

  if (isLow('ops') && isLow('measurement') && isHigh('content')) {
    return {
      recommendation:
        "You're producing good content but can't measure its impact or operationalize it. An ops-oriented hire, or a fractional ops resource, would have more impact right now than another content person.",
      question: 'Should that role be a full-time hire or a fractional engagement at your stage?',
    }
  }

  const weakest = [...dimensionScores].sort((a, b) => a.score - b.score)[0]
  const dim = dimensionById(weakest.dimensionId)
  return {
    recommendation: `Your gap pattern points most clearly to ${dim.name.toLowerCase()}. The highest-impact next move is ${HIRE_TYPE[weakest.dimensionId]}, not a generalist hire.`,
    question: 'Should that role be a full-time hire, a fractional resource, or an agency engagement given your stage and budget?',
  }
}

export function resourceGapBridge(dimensionScores: DimensionScore[]): { body: string; prompt: string } {
  const insight = inferResourceGap(dimensionScores)
  const caveat =
    "This is directional. The right answer depends on your runway, your team's current bandwidth, and whether you're building in-house or going agency-first."
  return {
    body: `${insight.recommendation} ${caveat}`,
    prompt: `The question your report raises: ${insight.question}`,
  }
}

// ── Consulting Bridge Section 2: Strategic Sequencing ──

const SEQUENCING_FACTOR: Record<FundingId, string> = {
  'vc-backed': 'your next funding milestone and how investors expect to see traction change',
  bootstrapped: 'your runway and which gap is currently capping revenue growth',
  hybrid: 'your runway and your next funding milestone, whichever is the tighter constraint',
}

export function strategicSequencingBridge(
  weakest: DimensionScore[],
  funding: FundingId
): { body: string; prompt: string } {
  const names = weakest.slice(0, 3).map((w) => dimensionById(w.dimensionId).name)
  const body = `Weakest first, your report ranks the priority order as: ${names.join(', ')}. The right sequence depends on your competitive timeline, your next funding milestone, and which of these gaps is actually blocking the others from closing.`
  const prompt = `Your report can tell you what's weakest. It can't tell you what to fix first. That depends on ${SEQUENCING_FACTOR[funding]}.`
  return { body, prompt }
}

// ── Consulting Bridge Section 3: AI Integration Map ──

export function aiIntegrationMapBridge(
  weakest: DimensionScore[],
  aiAnswers: AIAnswers
): { body: string; prompt: string } {
  const topWeak = weakest.slice(0, 2).map((w) => dimensionById(w.dimensionId).name.toLowerCase())
  const body = `Your weakest main dimensions are ${topWeak.join(' and ')}. Based on your AI readiness answers, this is also where AI has the most room to accelerate, but only once the underlying process is sound. AI speeds up execution. It doesn't fix a broken strategy underneath it.`

  const aq1 = aiAnswers.aq1 ?? 0
  const aq5 = aiAnswers.aq5 ?? 0
  let question: string
  if (aq1 - aq5 >= 2) {
    question =
      "your team is using AI more broadly than it's trained to use it well. What would a practical AI training plan look like at your size?"
  } else if (aq5 - aq1 >= 2) {
    question =
      'your team has more AI capability than your current workflows are putting to use. What would it take to close that gap?'
  } else {
    question =
      'this assessment reads AI readiness at a pattern level. A deeper, workflow-by-workflow audit would show exactly which tools and process changes carry the highest ROI for your team.'
  }
  return { body, prompt: `The question your AI readiness raises: ${question}` }
}

// Re-export for convenience where only dimension metadata is needed
export { DIMENSIONS, AI_WORKFLOWS }
