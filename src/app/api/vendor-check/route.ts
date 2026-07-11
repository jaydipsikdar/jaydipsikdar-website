import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// ---------------------------------------------------------------------------
// Vendor Contract Check — evaluation endpoint
//
// Takes contract text + the three context-step answers, asks Claude to score
// the contract across the five-parameter framework (see
// 00-context/vendor-contract-check-thread-summary.md and
// 00-context/Devnagri_Lead_Generation_Contract_Review_Notes.md for the
// source material this system prompt is built from), and returns structured
// JSON the results screen can render directly.
//
// Nothing here is stored server-side. The contract text is sent to the
// Anthropic API for this one evaluation call and is not persisted, logged
// in full, or written to disk.
// ---------------------------------------------------------------------------

export const runtime = 'nodejs'

type VendorType =
  | 'Lead generation / demand generation agency'
  | 'Performance marketing agency'
  | 'PR or content agency'
  | 'Other'

type WhatsAtStake =
  | 'Getting real, qualified pipeline'
  | 'Protecting budget / cash flow'
  | 'Being able to exit cleanly if it doesn\'t work'

type ProcessStage =
  | 'Reviewing before signing'
  | 'Already signed, checking what I agreed to'
  | 'Renewing or renegotiating'

interface VendorCheckRequestBody {
  contractText: string
  vendorType: VendorType
  whatsAtStake: WhatsAtStake
  processStage: ProcessStage
}

const PARAMETER_ORDER = [
  'Deliverable Clarity',
  'Performance Accountability',
  'Data Ownership',
  'Exit Terms',
  'Payment vs. Delivery Alignment',
] as const

const SYSTEM_PROMPT = `You are the evaluation engine behind "Vendor Contract Check," a tool built by Jaydip Sikdar (a Fractional CMO) that assesses lead generation agency contracts (MSAs/SOWs) from the buyer's side.

This is a COMMERCIAL FAIRNESS ASSESSMENT, not legal advice. You are not evaluating legal enforceability — you are evaluating whether the terms are commercially reasonable and protect the buyer, based on industry practice for lead generation agency engagements.

## Evaluation Framework

Score the contract across exactly five parameters, each out of 20 points (100 total). Base your scoring logic, red flags, and recommended clause language on the framework below, which is derived from a real contract review (Devnagri × Demand Virtue).

### 1. Deliverable Clarity (0-20)
- Is "qualified lead" (or equivalent) defined precisely — ICP fit, use case identified, demonstrated purchase intent?
- Is there a named sign-off authority / lead acceptance process?
- Is the target a fixed number, or a vague range (a range gives the vendor a built-in underdelivery cushion)?
- 16-20: explicit definition + named sign-off authority + fixed target.
- 0-5: deliverable undefined or generic ("qualified lead" used loosely or interchangeably with "meeting booked").
Recommended fix language: a Qualified Lead Definition clause specifying (a) mutually agreed ICP/target account fit, (b) at least one relevant use case identified and discussed, (c) demonstrated business interest and purchase intent — with sign-off by the client's designated Sales Lead acting reasonably and in good faith. Replace ranges with a fixed quarterly number.

### 2. Performance Accountability (0-20)
- Is there a real consequence mechanism for non-delivery (not just "more time")?
- Is there a capped remediation period, ideally ≤30 days (structured as 15+15)?
- Is any payment held back and tied to the target?
- Is there pro-rata release of held payment if the target is partially met?
- 16-20: holdback + capped remediation + pro-rata adjustment all present.
- 0-5: no performance targets, or targets are non-binding (e.g., only remedy is extending the engagement).
Recommended fix language: hold the final month's/tranche's payment until the quarterly target is verified; cap remediation at 30 days (15+15) at no extra cost; if still unmet, release the held amount on a pro-rata basis only.

### 3. Data Ownership (0-20)
- Does the client explicitly retain: target account lists, contact details (name, designation, company, business email, LinkedIn URL, phone where available), outreach history, engagement history, meeting notes, campaign reports?
- Is the vendor's retained IP limited to proprietary methodology/playbooks/frameworks/automation workflows only (not campaign data)?
- Is there an Exit Deliverables clause with a defined handover timeline?
- 16-20: explicit, enumerated client ownership of all campaign data + narrow vendor retention + timed exit deliverables clause.
- 0-5: no data ownership clause, or vague "proprietary data" language that could let the vendor claim campaign contacts as their own asset.
Recommended fix language: an explicit Campaign Data Ownership clause enumerating what the client retains (as above) in CRM-ready export format, limiting vendor retention to sourcing methodology/playbooks/frameworks/automation only, plus an Exit Deliverables clause requiring transfer within ~7 business days of engagement completion.

### 4. Exit Terms (0-20)
- Is there a performance-linked exit option (client can leave without penalty if targets are materially missed)?
- Is "target universe exhausted" (or equivalent) determined mutually/by data, not at the vendor's sole discretion?
- Is the standard notice period reasonable (~30 days)?
- 16-20: performance-linked exit option + mutual/data-based determination of exhaustion + reasonable notice.
- 0-5: no exit clause tied to performance, or vendor can unilaterally declare the engagement over with no refund, or full payment required regardless of delivery.
Recommended fix language: replace "sole discretion" with "mutual agreement, supported by data (accounts contacted, response rates, penetration %)"; add a performance-linked exit option (e.g., if targets missed by >30%, client may terminate without penalty and receive pro-rata refund of unused retainer); keep a standard 30-day mutual termination clause.

### 5. Payment vs. Delivery Alignment (0-20)
- Is payment released ahead of proof of delivery, or tied to milestones/holdbacks?
- Is there a holdback on the final tranche pending verification?
- Is the auto-renewal notice period reasonable (≤30 days), or does it silently lock the client into another term?
- 16-20: milestone-linked payment + holdback + reasonable (≤30-day) renewal notice, or opt-in renewal.
- 0-5: fully front-loaded payment with no recourse, and/or an unusually long (40+ day) or easy-to-miss auto-renewal window.
Recommended fix language: restructure to e.g. 70% retainer in advance / 30% held back and released on quarterly verification; reduce auto-renewal notice to 30 days with a written reminder 15 days before the deadline, or shift to opt-in renewal entirely.

## Scoring Interpretation (sum of all five parameters)
- 80-100: Strong — well-balanced, protects buyer
- 60-79: Moderate — has protective elements but gaps to address
- 40-59: Weak — materially favours vendor, significant renegotiation needed
- 0-39: High risk — minimal buyer protection, substantial revision or walk away

When scoring, check whether the sum of your five parameter scores actually equals your overallScore. If they don't match, recalculate before returning the response.

## Context you'll be given
- The vendor type selected by the user. Only "Lead generation / demand generation agency" contracts are fully tuned for this framework. If the vendor type is anything else, still apply the same five-parameter framework as your best approximation, but your response must include a "vendorTypeDisclaimer" field noting the assessment is directional only, since the framework is built specifically for lead generation engagements.
- What's most at stake for the user, and what stage of the process they're in. Use these only to lightly calibrate tone/emphasis in your reasoning (e.g., someone "already signed" needs renegotiation framing, not "before you sign" framing) — do not change the scoring methodology based on these.

Use the submit_evaluation tool to return your assessment.

Ground every "whatItSays" in the actual contract text provided — do not invent clauses that aren't there. If a clause is simply absent, say so explicitly (e.g., "The contract does not mention data ownership at all").

When a parameter's clause is completely absent from the contract, score it 0-5 and state clearly that the contract is silent on this area. Do not award mid-range scores for absent protections — silence is not neutrality, it defaults to the vendor's advantage. A score of 10+ on any parameter requires an explicit, written clause that at least partially addresses the criteria.`

const vendorCheckTool = {
  name: 'submit_evaluation',
  description: 'Submit the completed vendor contract evaluation with scores and analysis',
  input_schema: {
    type: 'object' as const,
    required: ['overallScore', 'riskLevel', 'verdict', 'parameters', 'topPriorities'],
    properties: {
      overallScore: { type: 'integer', description: 'Total score 0-100, sum of all five parameter scores' },
      riskLevel: { type: 'string', enum: ['Strong', 'Moderate', 'Weak', 'High Risk'] },
      verdict: { type: 'string', description: 'One sentence summary of the contract fairness' },
      vendorTypeDisclaimer: { type: 'string', description: 'Disclaimer for non-lead-gen contracts, or null', nullable: true },
      parameters: {
        type: 'array',
        items: {
          type: 'object',
          required: ['name', 'score', 'whatItSays', 'whyItMatters', 'whatToPropose', 'redFlags'],
          properties: {
            name: { type: 'string' },
            score: { type: 'integer' },
            whatItSays: { type: 'string' },
            whyItMatters: { type: 'string' },
            whatToPropose: { type: 'string' },
            redFlags: { type: 'string' },
          },
        },
      },
      topPriorities: { type: 'array', items: { type: 'string' } },
    },
  },
}

function buildUserMessage(body: VendorCheckRequestBody): string {
  return `VENDOR TYPE: ${body.vendorType}
WHAT'S MOST AT STAKE: ${body.whatsAtStake}
STAGE IN PROCESS: ${body.processStage}

CONTRACT TEXT:
"""
${body.contractText}
"""

Evaluate this contract per your instructions and return the JSON object only.`
}

export async function POST(request: Request) {
  let body: VendorCheckRequestBody

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body?.contractText || typeof body.contractText !== 'string' || body.contractText.trim().length < 200) {
    return NextResponse.json(
      { error: 'Contract text is missing or too short to evaluate meaningfully.' },
      { status: 400 }
    )
  }

  if (!body.vendorType || !body.whatsAtStake || !body.processStage) {
    return NextResponse.json(
      { error: 'Missing context answers (vendorType, whatsAtStake, processStage).' },
      { status: 400 }
    )
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('[vendor-check] ANTHROPIC_API_KEY is not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const anthropic = new Anthropic({ apiKey })

  let parsed: unknown
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 16384,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserMessage(body) }],
      tools: [vendorCheckTool],
      tool_choice: { type: 'tool', name: 'submit_evaluation' },
    })

    console.log('[vendor-check] Response content types:', message.content.map((b) => b.type))

    const toolBlock = message.content.find((block) => block.type === 'tool_use')
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      console.error('[vendor-check] No tool_use block in response:', message.content.map((b) => b.type))
      return NextResponse.json({ error: 'Evaluation failed. Please try again.' }, { status: 502 })
    }
    parsed = toolBlock.input
  } catch (err) {
    console.error('[vendor-check] Anthropic API error:', err)
    return NextResponse.json({ error: 'Evaluation failed. Please try again.' }, { status: 502 })
  }

  const result = parsed as {
    overallScore?: number
    riskLevel?: string
    verdict?: string
    vendorTypeDisclaimer?: string | null
    parameters?: Array<{ name?: string; score?: number; redFlags?: unknown }>
    topPriorities?: string[]
  }

  const paramNames = (result.parameters ?? []).map((p) => p.name)
  const hasAllParams = PARAMETER_ORDER.every((name) => paramNames.includes(name))
  const hasRedFlagsOnEach = (result.parameters ?? []).every((p) => typeof p.redFlags === 'string')

  if (
    typeof result.overallScore !== 'number' ||
    typeof result.verdict !== 'string' ||
    !Array.isArray(result.parameters) ||
    result.parameters.length !== 5 ||
    !hasAllParams ||
    !hasRedFlagsOnEach ||
    !Array.isArray(result.topPriorities)
  ) {
    console.error('[vendor-check] Claude response failed shape validation:', result)
    return NextResponse.json({ error: 'Evaluation returned an incomplete result. Please try again.' }, { status: 502 })
  }

  return NextResponse.json(result)
}
