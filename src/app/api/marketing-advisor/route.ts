import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// ---------------------------------------------------------------------------
// Marketing Decision Advisor — evaluation endpoint
//
// Takes the selected category + qualifying question answers, asks Claude to
// reason from a category-specific set of operator lessons (distilled from
// The Marketing Couch podcast interviews), and returns structured JSON the
// results screen can render directly. Mirrors /api/vendor-check/route.ts.
// ---------------------------------------------------------------------------

export const runtime = 'nodejs'

type MarketingCategory = 'positioning' | 'brand' | 'customer-growth' | 'ai-marketing' | 'launch'

interface AdvisorRequestBody {
  category: MarketingCategory
  userRole: string
  businessStage: string
  primaryChallenge: string
  secondaryAnswer?: string
  description: string
}

const CATEGORY_LABELS: Record<MarketingCategory, string> = {
  positioning: 'Positioning & Messaging',
  brand: 'Brand Strategy',
  'customer-growth': 'Customer Growth & Retention',
  'ai-marketing': 'AI for Marketing',
  launch: 'Launch & Go-to-Market',
}

// Label for the category's optional secondary question, used only to format
// the user message (e.g. "Where do you primarily reach your audience: ...").
const SECONDARY_QUESTION_LABELS: Partial<Record<MarketingCategory, string>> = {
  brand: 'Where do you primarily reach your audience',
  'customer-growth': 'Roughly how many active customers do you have',
  launch: 'When is your launch',
}

const BASE_PROMPT = `You are the MARKETING DECISION ADVISOR on jaydipsikdar.com — an AI advisor built from 213 lessons distilled from 21 long-form interviews with senior marketing leaders (CMOs, VPs, founders) on The Marketing Couch podcast.

You do not give generic advice. You reason from the specific operator lessons provided below, applying them to the user's exact situation. Every recommendation must connect back to a specific lesson or principle from the knowledge base.

RULES:
- Be specific to this person's situation. Generic advice is a failure.
- Plain language. No em dashes in output.
- Banned words: unlock, leverage, game-changer, synergy, flywheel, north star, double-click, paradigm, supercharge.
- Do not invent statistics or name specific case studies. A clearly labeled rule of thumb is fine.
- Do not use the construction "It's not X, it's Y" for reframing.
- Do not use "quietly" + verb constructions.
- Operator tone: direct, experienced, no flattery, no filler.
- Every piece of advice must be grounded in the lessons below. Do not hallucinate principles that aren't in the knowledge base.
- Provide 3-5 moves, sequenced in order of priority.
- In the "why" field, paraphrase the lesson in plain language. Do not write "Lesson 3" or cite lesson numbers directly — use the dedicated lessonTag field for the short label instead.

Use the submit_advice tool to return your response.`

const CATEGORY_LESSONS: Record<MarketingCategory, string> = {
  positioning: `KNOWLEDGE BASE — POSITIONING & MESSAGING:
1. Get positioning, messaging, and distribution right first. They are most of the work, before any clever tactic.
2. If you cannot write your positioning in one clear sentence, you do not understand it. Speaking lets you bluff, writing does not.
3. Own a problem, not just a category. People should think of you when that specific pain shows up.
4. Go slow to go fast. Do not announce and make noise before you can clearly say who you serve and what you solve.
5. Brand equals business model. If your delivery cannot back the promise, the brand breaks.
6. Differentiation is not permanent. Competitors copy features fast, so keep sharpening the narrative.
7. Sell outcomes and numbers, not feature specs. Customers buy results.
8. Translate one feature into different value for each buyer: what matters to the budget holder is different from what matters to the end user.
9. Buying is emotional. Buyers carry fear and bias, not just spreadsheets. Your positioning must address the emotional risk of choosing you.
10. Only a small share of buyers are in-market at any time. Aim most content at the larger group still educating themselves.
11. Product marketing exists to get customer, product, and market right before you scale spend.
12. Niche your brand to one ideal customer. It cuts the noise to a few real rivals.`,
  brand: `KNOWLEDGE BASE — BRAND STRATEGY:
1. Branding is managing perceptions. Design the cues that make value feel real.
2. Tell one consistent story. Switching it confuses the buyer.
3. Nothing spreads on its own. Spend more energy pushing content out than making it.
4. Your content has to beat the environment it interrupts. A dull post loses to the feed around it.
5. Personal and founder branding is a by-product of posting with a real point of view, consistently, in one domain.
6. Buying is emotional. Buyers carry fear and bias, not just rational analysis. Your brand must address the feeling, not just the function.
7. Own a problem, not just a category. People should think of you when that specific pain shows up.
8. Get positioning, messaging, and distribution right first. They are most of the work.
9. Differentiation is not permanent. Keep sharpening the narrative as competitors copy.
10. Only a small share of potential buyers are in-market at any time. Aim most content at the larger group still educating themselves.
11. Niche your brand to one ideal customer. It cuts the noise to a few real rivals.
12. Search is becoming ask. Optimize to be the answer and the cited source, not just a ranking.`,
  'customer-growth': `KNOWLEDGE BASE — CUSTOMER GROWTH & RETENTION:
1. The customer journey is a loop, not a one-way funnel. Happy customers drive new customers.
2. Retention is product and experience first. Discounts are a patch, not a strategy.
3. Community is the single biggest growth lever. Find the tribe that already exists and give it a cause.
4. Customers grow you through usage and through advocacy, references, and reviews. Treat advocacy as a growth channel.
5. Build the customer-first habit while you are small. It is very hard to turn the ship later.
6. Do not campaign hard before you have a few flagship reference customers with brilliant implementation.
7. Sell and serve by asking questions, not by pitching what you know.
8. Brand equals business model. If delivery cannot back the promise, the brand breaks. Retention starts with what you actually deliver.
9. Own a problem, not just a category. Repeat customers come back because you own their specific pain.
10. Solve adjacent problems to build stickiness and lower acquisition cost.
11. Have customer stories ready before you scale. Social proof compounds.
12. Gate every new offering on four filters: easy to buy, easy to use, easy to get help, easy to leave. Friction in any one kills retention.`,
  'ai-marketing': `KNOWLEDGE BASE — AI FOR MARKETING:
1. Search is becoming ask. Optimize to be the answer and the cited source, not just a ranking.
2. Create content for AI agents too. Structure it so it is easy to extract and cite.
3. AI is an intern, not the strategist. Use it for grunt work, keep judgment and empathy human.
4. Mentor the AI tools. That needs deep functional knowledge, or they produce output that is confidently wrong.
5. Execution is cheap now. Thinking is the edge. Use AI to refine your point of view, not to originate it.
6. Frame AI as expanding your capacity to serve, not just cutting cost.
7. Your content has to beat the environment it interrupts. AI-generated content that sounds like everything else loses.
8. Personal branding is a by-product of posting with a real point of view, consistently. AI can help you produce, but the POV must be yours.
9. Differentiation is not permanent. When everyone uses AI to produce the same content, the differentiator becomes original thinking and real experience.
10. Nothing spreads on its own. AI can help you produce more, but you still need to push content out deliberately.
11. Only a small share of buyers are in-market at any time. AI search will increasingly surface the best answer, not the most optimized page.
12. If you cannot write your positioning in one clear sentence, AI tools will only amplify the confusion.`,
  launch: `KNOWLEDGE BASE — LAUNCH & GO-TO-MARKET:
1. Product marketing exists to get customer, product, and market right before you scale spend.
2. Have customer and pilot stories ready before launch, not after.
3. Gate every launch on four filters: easy to buy, easy to sell, easy to serve, easy to exit.
4. Sell outcomes and numbers, not feature specs. Customers buy results.
5. Solve adjacent problems to build stickiness and lower acquisition cost.
6. Go slow to go fast. Do not announce and make noise before you can clearly say who you serve and what you solve.
7. Get positioning, messaging, and distribution right first. They are most of the work.
8. Do not campaign hard before you have a few flagship reference customers with brilliant implementation.
9. Only a small share of buyers are in-market at any time. Your launch must reach the larger group still educating themselves, not just the ready-to-buy slice.
10. Niche your brand to one ideal customer at launch. It cuts the noise to a few real competitors.
11. Translate one feature into different value for each buyer.
12. Nothing spreads on its own. Spend more pushing your launch out than polishing the announcement.`,
}

const advisorTool = {
  name: 'submit_advice',
  description: 'Submit the completed marketing advisory report',
  input_schema: {
    type: 'object' as const,
    required: ['diagnosis', 'firstThingToFix', 'moves', 'whatWouldBreak', 'oneQuestion'],
    properties: {
      diagnosis: {
        type: 'string',
        description:
          '2-3 sentences. What is actually going on — not what the user thinks is happening, but the underlying problem. Be direct.',
      },
      firstThingToFix: {
        type: 'string',
        description:
          'The single most important thing to address before anything else. One clear sentence stating what it is, followed by 2-3 sentences explaining why this is the root issue.',
      },
      moves: {
        type: 'array',
        minItems: 3,
        maxItems: 5,
        items: {
          type: 'object',
          required: ['order', 'action', 'why', 'timeframe', 'lessonTag'],
          properties: {
            order: { type: 'integer' },
            action: { type: 'string', description: 'Specific, concrete action — not a platitude' },
            why: { type: 'string', description: '1 sentence connecting this to a lesson from the knowledge base' },
            timeframe: { type: 'string', enum: ['This week', 'This month', 'Ongoing'] },
            lessonTag: {
              type: 'string',
              description:
                'A short label, 3-6 words, naming the specific lesson or principle this move draws on — e.g. "Own a problem, not a category". Paraphrase it in plain language. Do not just say "Lesson 3" or reference a lesson number.',
            },
          },
        },
      },
      whatWouldBreak: {
        type: 'string',
        description: 'The likeliest way this advice fails and the early signal to watch for. 2-3 sentences.',
      },
      oneQuestion: {
        type: 'string',
        description:
          'A single provocative question that reframes the problem — designed to make the user think differently about their situation.',
      },
    },
  },
}

function buildSystemPrompt(body: AdvisorRequestBody): string {
  const categoryLabel = CATEGORY_LABELS[body.category]
  const aboutUser = `ABOUT THE USER:
- Role: ${body.userRole}
- Business stage: ${body.businessStage}
- Advisory category: ${categoryLabel}
- Primary challenge: ${body.primaryChallenge}
- Additional context: ${body.description}`

  return `${BASE_PROMPT}\n\n${aboutUser}\n\n${CATEGORY_LESSONS[body.category]}`
}

function buildUserMessage(body: AdvisorRequestBody): string {
  const categoryLabel = CATEGORY_LABELS[body.category]
  const secondaryLabel = SECONDARY_QUESTION_LABELS[body.category]
  const secondaryLine =
    secondaryLabel && body.secondaryAnswer ? `${secondaryLabel}: ${body.secondaryAnswer}\n` : ''

  return `Category: ${categoryLabel}
Role: ${body.userRole}
Business stage: ${body.businessStage}
Primary challenge: ${body.primaryChallenge}
${secondaryLine}Situation description: ${body.description}

Use the submit_advice tool to return your advisory report.`
}

export async function POST(request: Request) {
  let body: AdvisorRequestBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body?.category || !CATEGORY_LABELS[body.category]) {
    return NextResponse.json({ error: 'Missing or invalid category' }, { status: 400 })
  }
  if (!body.userRole || !body.businessStage || !body.primaryChallenge) {
    return NextResponse.json(
      { error: 'Missing context answers (userRole, businessStage, primaryChallenge).' },
      { status: 400 }
    )
  }
  if (!body.description || typeof body.description !== 'string' || body.description.trim().length < 20) {
    return NextResponse.json(
      { error: 'Situation description is missing or too short.' },
      { status: 400 }
    )
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('[marketing-advisor] ANTHROPIC_API_KEY is not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const anthropic = new Anthropic({ apiKey })

  let parsed: unknown
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 8192,
      system: buildSystemPrompt(body),
      messages: [{ role: 'user', content: buildUserMessage(body) }],
      tools: [advisorTool],
      tool_choice: { type: 'tool', name: 'submit_advice' },
    })

    console.log('[marketing-advisor] Response content types:', message.content.map((b) => b.type))

    const toolBlock = message.content.find((block) => block.type === 'tool_use')
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      console.error('[marketing-advisor] No tool_use block in response:', message.content.map((b) => b.type))
      return NextResponse.json({ error: 'Advisory generation failed. Please try again.' }, { status: 502 })
    }
    parsed = toolBlock.input
  } catch (err) {
    console.error('[marketing-advisor] Anthropic API error:', err)
    return NextResponse.json({ error: 'Advisory generation failed. Please try again.' }, { status: 502 })
  }

  const result = parsed as {
    diagnosis?: string
    firstThingToFix?: string
    moves?: Array<{ order?: number; action?: string; why?: string; timeframe?: string; lessonTag?: string }>
    whatWouldBreak?: string
    oneQuestion?: string
  }

  const movesWellFormed =
    Array.isArray(result.moves) &&
    result.moves.length >= 3 &&
    result.moves.length <= 5 &&
    result.moves.every(
      (m) =>
        typeof m.order === 'number' &&
        typeof m.action === 'string' &&
        typeof m.why === 'string' &&
        typeof m.timeframe === 'string' &&
        typeof m.lessonTag === 'string'
    )

  if (
    typeof result.diagnosis !== 'string' ||
    typeof result.firstThingToFix !== 'string' ||
    !movesWellFormed ||
    typeof result.whatWouldBreak !== 'string' ||
    typeof result.oneQuestion !== 'string'
  ) {
    console.error('[marketing-advisor] Claude response failed shape validation:', result)
    return NextResponse.json({ error: 'Advisory generation returned an incomplete result. Please try again.' }, { status: 502 })
  }

  return NextResponse.json({
    category: body.category,
    userRole: body.userRole,
    businessStage: body.businessStage,
    primaryChallenge: body.primaryChallenge,
    description: body.description,
    diagnosis: result.diagnosis,
    firstThingToFix: result.firstThingToFix,
    moves: result.moves,
    whatWouldBreak: result.whatWouldBreak,
    oneQuestion: result.oneQuestion,
  })
}
