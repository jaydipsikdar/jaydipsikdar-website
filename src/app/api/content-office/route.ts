import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import {
  THEMES,
  STRUCTURES,
  CHANNELS,
  INTENT_OPTIONS,
  PILLAR_MIN,
  PILLAR_MAX,
  CHANNEL_MAX,
  INTENT_MAX,
  channelById,
  intentById,
  type ThemeId,
  type StructureId,
  type ChannelId,
  type IntentId,
  type ContentOfficeInputs,
  type ContentOfficeResult,
  type PillarMatrix,
  type MatrixCell,
} from '@/lib/contentOfficeData'

// ---------------------------------------------------------------------------
// Content Office — content matrix generation
//
// Batched approach: one Anthropic call per pillar (generates all 10 theme
// cells for that pillar), run in parallel, followed by one call that takes
// all pillar matrices as context and generates the profile, starter
// sequence, gaps analysis, channel fit analysis, and rhythm recommendation.
// Mirrors /api/marketing-advisor/route.ts (forced tool_choice, structured
// JSON via the tool's input).
// ---------------------------------------------------------------------------

export const runtime = 'nodejs'
export const maxDuration = 60

const STRUCTURE_IDS = STRUCTURES.map((s) => s.id)
const THEME_IDS = THEMES.map((t) => t.id)
const CHANNEL_IDS = CHANNELS.map((c) => c.id)

const QUALITY_GUARDRAILS = `QUALITY RULES (non-negotiable):
- No generic titles. "5 tips for better X" or "The ultimate guide to X" are banned.
- Every idea must be specific enough that the user could start writing it immediately. Name the mechanism, the number, or the specific claim.
- Vary structure across the matrix. Do not default to lists for everything.
- Channel guidance must include a specific length or format note, not just "post it on LinkedIn."
- Match the audience's sophistication level. Do not suggest beginner content for an expert audience, or jargon-heavy content for a broad one.
- No em dashes anywhere in generated text. Use commas, colons, periods, hyphens, or parentheses.
- Banned words and phrases: unleash, game-changing, dive into, straightforward, unlock, it's worth noting, at the end of the day, synergize, leverage, circle back, touch base, "doesn't just X, it Y".
- No unearned superlatives (best, only, first, revolutionary) unless the claim is provably specific.
- Sentence case. Never Title Case a content idea.`

// ── Request validation ──────────────────────────────────────────────────

interface ContentOfficeRequestBody {
  role?: string
  intents?: string[]
  audience?: string
  pillars?: string[]
  channels?: string[]
}

function validateInputs(body: ContentOfficeRequestBody): { ok: true; inputs: ContentOfficeInputs } | { ok: false; error: string } {
  const role = body.role?.trim()
  if (!role || role.length > 200) return { ok: false, error: 'What you do is required (max 200 characters).' }

  const intents = (body.intents ?? []).filter((i): i is IntentId => INTENT_OPTIONS.some((o) => o.id === i))
  if (intents.length < 1 || intents.length > INTENT_MAX) {
    return { ok: false, error: `Pick 1-${INTENT_MAX} content goals.` }
  }

  const audience = body.audience?.trim()
  if (!audience || audience.length > 200) return { ok: false, error: 'Target audience is required (max 200 characters).' }

  const pillars = (body.pillars ?? []).map((p) => p.trim()).filter(Boolean)
  if (pillars.length < PILLAR_MIN || pillars.length > PILLAR_MAX) {
    return { ok: false, error: `Provide ${PILLAR_MIN}-${PILLAR_MAX} content pillars.` }
  }

  const channels = (body.channels ?? []).filter((c): c is ChannelId => CHANNELS.some((ch) => ch.id === c))
  if (channels.length < 1 || channels.length > CHANNEL_MAX) {
    return { ok: false, error: `Pick 1-${CHANNEL_MAX} channels.` }
  }

  return { ok: true, inputs: { role, intents, audience, pillars, channels } }
}

// ── Tool schemas ────────────────────────────────────────────────────────

function pillarMatrixTool(numChannels: number) {
  return {
    name: 'submit_pillar_matrix',
    description: 'Submit the 10 content ideas for this pillar, one per theme, in the exact order given.',
    input_schema: {
      type: 'object' as const,
      required: ['cells'],
      properties: {
        cells: {
          type: 'array',
          minItems: 10,
          maxItems: 10,
          description: 'Exactly 10 items, in the same order as the themes listed in the prompt.',
          items: {
            type: 'object',
            required: ['contentIdea', 'structure', 'channelMapping'],
            properties: {
              contentIdea: { type: 'string', description: 'A specific, publishable title or hook. Not a generic topic.' },
              structure: { type: 'string', enum: STRUCTURE_IDS },
              channelMapping: {
                type: 'array',
                minItems: numChannels,
                maxItems: numChannels,
                items: {
                  type: 'object',
                  required: ['channel', 'guidance'],
                  properties: {
                    channel: { type: 'string' },
                    guidance: { type: 'string', description: 'One or two sentences: specific length/format guidance for adapting this idea to this channel.' },
                  },
                },
              },
            },
          },
        },
      },
    },
  }
}

const extrasTool = {
  name: 'submit_content_extras',
  description: 'Submit the content profile, starter sequence, gaps analysis, channel fit analysis, and rhythm recommendation.',
  input_schema: {
    type: 'object' as const,
    required: ['profile', 'starterSequence', 'gaps', 'channelFit', 'rhythm'],
    properties: {
      profile: {
        type: 'string',
        description:
          'One paragraph connecting role, intent, audience, pillars, and channels into a strategy brief. E.g. "You are a [role] building authority with [audience] around [pillars]. Your primary channels favor [themes] delivered as [structures]."',
      },
      starterSequence: {
        type: 'array',
        minItems: 10,
        maxItems: 10,
        description:
          'The first 10 posts to publish, drawn from the matrix provided, ordered for variety (no two consecutive posts from the same pillar or the same theme). Post 1: POV on the strongest pillar. Post 2: education on a different pillar. Post 3: behind the scenes. Post 4: commentary. Post 5: framework on the strongest pillar. Posts 6-10: rotate through the remaining themes.',
        items: {
          type: 'object',
          required: ['pillar', 'theme', 'contentIdea'],
          properties: {
            pillar: { type: 'string', description: 'Must exactly match one of the pillar names given.' },
            theme: { type: 'string', enum: THEME_IDS },
            contentIdea: { type: 'string', description: 'Must exactly match the contentIdea text for that pillar/theme cell from the matrix provided.' },
          },
        },
      },
      gaps: {
        type: 'object',
        required: ['body', 'underusedThemes', 'avoidedStructures', 'missingPillarNote'],
        properties: {
          body: { type: 'string', description: '2-3 sentences analyzing what the matrix reveals about likely blind spots, grounded in the specific channel and pillar choices given.' },
          underusedThemes: { type: 'array', minItems: 1, maxItems: 3, items: { type: 'string', enum: THEME_IDS }, description: 'Themes this user is probably underusing, based on their channel selection.' },
          avoidedStructures: { type: 'array', minItems: 1, maxItems: 3, items: { type: 'string', enum: STRUCTURE_IDS }, description: 'Structures that would fit their content intent but they might be avoiding.' },
          missingPillarNote: { type: 'string', description: 'A short note (2-3 sentences) on what a fourth pillar could round out, without naming it specifically.' },
        },
      },
      channelFit: {
        type: 'object',
        required: ['body', 'mismatchedChannels', 'opportunityThemes', 'capacityNote'],
        properties: {
          body: { type: 'string', description: '2-3 sentences on mismatches between the selected channels and the pillars/themes/intent.' },
          mismatchedChannels: { type: 'array', maxItems: 2, items: { type: 'string', enum: CHANNELS.map((c) => c.id) }, description: "Selected channels that fit this user's intent poorly. Can be empty." },
          opportunityThemes: { type: 'array', minItems: 1, maxItems: 3, items: { type: 'string', enum: THEME_IDS }, description: 'Themes that would perform well on channels this user is not currently using.' },
          capacityNote: { type: 'string', description: 'One sentence stating the math (pillars times channels equals content streams) and naming that as a publishing operation, not a side project.' },
        },
      },
      rhythm: {
        type: 'object',
        required: ['cadence', 'body', 'disclaimer'],
        properties: {
          cadence: { type: 'string', description: 'A short cadence label, e.g. "4-5 posts per week with repurposing."' },
          body: { type: 'string', description: '2-3 sentences with a content day recommendation: one day for creation, one for distribution, one for engagement.' },
          disclaimer: { type: 'string', description: 'One sentence noting the right rhythm depends on bandwidth, team, and what else competes for their time. This is a starting point, not a prescription.' },
        },
      },
    },
  },
}

// ── Prompt builders ─────────────────────────────────────────────────────

function contextBlock(inputs: ContentOfficeInputs): string {
  const intentLabels = inputs.intents.map((i) => intentById(i).label).join('; ')
  const channelLines = inputs.channels
    .map((c) => {
      const ch = channelById(c)
      return `- ${ch.name}: ${ch.formatConstraints}. Ideal length: ${ch.idealLength}. Performs well as: ${ch.performsWell.join(', ')}.`
    })
    .join('\n')

  return `WHAT THE USER DOES: ${inputs.role}
CONTENT INTENT: ${intentLabels}
TARGET AUDIENCE: ${inputs.audience}
ALL PILLARS: ${inputs.pillars.join(', ')}
SELECTED CHANNELS:
${channelLines}`
}

function buildPillarSystemPrompt(inputs: ContentOfficeInputs): string {
  const themeList = THEMES.map((t, i) => `${i + 1}. ${t.name}: ${t.description} (example: "${t.example}")`).join('\n')
  const structureList = STRUCTURES.map((s) => `- ${s.name}: ${s.description}`).join('\n')

  return `You are building a content matrix for Jaydeepp's Content Office, a tool that turns one topic pillar into 10 distinct content ideas by running it through 10 different "themes" (ways of approaching the topic).

${contextBlock(inputs)}

THE 10 THEMES, IN ORDER (generate exactly one idea per theme, in this order):
${themeList}

AVAILABLE STRUCTURES (assign one per idea, vary them, no more than 3 uses of the same structure across the 10 ideas):
${structureList}

${QUALITY_GUARDRAILS}

For each of the 10 themes, generate one content idea for the pillar given in the user message, specific to this user's audience and intent, with channel-specific guidance for every selected channel. Use the submit_pillar_matrix tool.`
}

function buildExtrasSystemPrompt(inputs: ContentOfficeInputs, matrixSummary: string): string {
  return `You are finishing a content matrix for Jaydeepp's Content Office.

${contextBlock(inputs)}

THE FULL MATRIX ALREADY GENERATED (pillar, theme, content idea, structure):
${matrixSummary}

${QUALITY_GUARDRAILS}

Use the submit_content_extras tool to generate the content profile, a 10-post starter sequence drawn from the exact ideas above (copy the contentIdea text verbatim), a gaps analysis, a channel fit analysis, and a rhythm recommendation.`
}

// ── AI calls ────────────────────────────────────────────────────────────

interface RawCell {
  contentIdea?: string
  structure?: string
  channelMapping?: { channel?: string; guidance?: string }[]
}

// Note: the tool schema declares `structure` as an enum, but the model
// occasionally returns an off-list value anyway (e.g. a theme name instead
// of a structure id). Enum membership isn't checked here; invalid values are
// coerced to a safe fallback when building the matrix cell instead of
// failing the whole pillar over one bad field.
function cellsWellFormed(cells: unknown, channels: ChannelId[]): cells is RawCell[] {
  if (!Array.isArray(cells) || cells.length !== 10) return false
  return cells.every(
    (c: RawCell) =>
      typeof c?.contentIdea === 'string' &&
      typeof c?.structure === 'string' &&
      Array.isArray(c.channelMapping) &&
      c.channelMapping.length === channels.length &&
      c.channelMapping.every((m) => typeof m?.guidance === 'string')
  )
}

const FALLBACK_STRUCTURE: StructureId = 'framework'
const FALLBACK_THEME: ThemeId = 'information'

function coerceStructure(value: string | undefined, context: string): StructureId {
  if (value && STRUCTURE_IDS.includes(value as StructureId)) return value as StructureId
  console.warn(`[content-office] invalid structure "${value}" for ${context}, falling back to "${FALLBACK_STRUCTURE}"`)
  return FALLBACK_STRUCTURE
}

function coerceTheme(value: string | undefined, context: string): ThemeId {
  if (value && THEME_IDS.includes(value as ThemeId)) return value as ThemeId
  console.warn(`[content-office] invalid theme "${value}" for ${context}, falling back to "${FALLBACK_THEME}"`)
  return FALLBACK_THEME
}

async function generatePillarMatrix(anthropic: Anthropic, inputs: ContentOfficeInputs, pillar: string): Promise<PillarMatrix> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 4096,
    system: buildPillarSystemPrompt(inputs),
    messages: [{ role: 'user', content: `Generate the 10-idea matrix for the pillar: "${pillar}". Use the submit_pillar_matrix tool.` }],
    tools: [pillarMatrixTool(inputs.channels.length)],
    tool_choice: { type: 'tool', name: 'submit_pillar_matrix' },
  })

  const toolBlock = message.content.find((b) => b.type === 'tool_use')
  if (!toolBlock || toolBlock.type !== 'tool_use') {
    throw new Error(`No tool_use block for pillar "${pillar}"`)
  }
  const input = toolBlock.input as { cells?: unknown }
  if (!cellsWellFormed(input.cells, inputs.channels)) {
    throw new Error(`Malformed matrix for pillar "${pillar}"`)
  }

  const cells: MatrixCell[] = input.cells.map((c, i) => ({
    theme: THEME_IDS[i] as ThemeId,
    contentIdea: c.contentIdea!.trim(),
    structure: coerceStructure(c.structure, `pillar "${pillar}" cell ${i}`),
    channelMapping: inputs.channels.map((channel, ci) => ({
      channel,
      guidance: c.channelMapping![ci]?.guidance?.trim() ?? '',
    })),
  }))

  return { pillar, cells }
}

interface RawExtras {
  profile?: string
  starterSequence?: { pillar?: string; theme?: string; contentIdea?: string }[]
  gaps?: { body?: string; underusedThemes?: string[]; avoidedStructures?: string[]; missingPillarNote?: string }
  channelFit?: { body?: string; mismatchedChannels?: string[]; opportunityThemes?: string[]; capacityNote?: string }
  rhythm?: { cadence?: string; body?: string; disclaimer?: string }
}

function extrasWellFormed(x: RawExtras): boolean {
  return (
    typeof x.profile === 'string' &&
    Array.isArray(x.starterSequence) &&
    x.starterSequence.length === 10 &&
    x.starterSequence.every((p) => typeof p?.pillar === 'string' && typeof p?.theme === 'string' && typeof p?.contentIdea === 'string') &&
    !!x.gaps &&
    typeof x.gaps.body === 'string' &&
    Array.isArray(x.gaps.underusedThemes) &&
    Array.isArray(x.gaps.avoidedStructures) &&
    typeof x.gaps.missingPillarNote === 'string' &&
    !!x.channelFit &&
    typeof x.channelFit.body === 'string' &&
    Array.isArray(x.channelFit.mismatchedChannels) &&
    Array.isArray(x.channelFit.opportunityThemes) &&
    typeof x.channelFit.capacityNote === 'string' &&
    !!x.rhythm &&
    typeof x.rhythm.cadence === 'string' &&
    typeof x.rhythm.body === 'string' &&
    typeof x.rhythm.disclaimer === 'string'
  )
}

async function generateExtras(anthropic: Anthropic, inputs: ContentOfficeInputs, pillars: PillarMatrix[]) {
  const matrixSummary = pillars
    .map((p) => p.cells.map((c) => `[${p.pillar} / ${c.theme} / ${c.structure}] ${c.contentIdea}`).join('\n'))
    .join('\n')

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-5',
    max_tokens: 4096,
    system: buildExtrasSystemPrompt(inputs, matrixSummary),
    messages: [{ role: 'user', content: 'Use the submit_content_extras tool to return your response.' }],
    tools: [extrasTool],
    tool_choice: { type: 'tool', name: 'submit_content_extras' },
  })

  const toolBlock = message.content.find((b) => b.type === 'tool_use')
  if (!toolBlock || toolBlock.type !== 'tool_use') throw new Error('No tool_use block for extras')
  const raw = toolBlock.input as RawExtras
  if (!extrasWellFormed(raw)) throw new Error('Malformed extras response')

  return raw
}

// ── Route handler ───────────────────────────────────────────────────────

export async function POST(request: Request) {
  let body: ContentOfficeRequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const validated = validateInputs(body)
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 })
  }
  const { inputs } = validated

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('[content-office] ANTHROPIC_API_KEY is not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }
  const anthropic = new Anthropic({ apiKey })

  let pillars: PillarMatrix[]
  try {
    pillars = await Promise.all(inputs.pillars.map((pillar) => generatePillarMatrix(anthropic, inputs, pillar)))
  } catch (err) {
    console.error('[content-office] pillar generation failed:', err)
    return NextResponse.json({ error: 'Matrix generation failed. Please try again.' }, { status: 502 })
  }

  let extras: RawExtras
  try {
    extras = await generateExtras(anthropic, inputs, pillars)
  } catch (err) {
    console.error('[content-office] extras generation failed:', err)
    return NextResponse.json({ error: 'Matrix generation failed. Please try again.' }, { status: 502 })
  }

  const validThemes = (values: string[] | undefined, context: string): ThemeId[] =>
    (values ?? []).filter((v): v is ThemeId => {
      const ok = THEME_IDS.includes(v as ThemeId)
      if (!ok) console.warn(`[content-office] dropping invalid theme "${v}" from ${context}`)
      return ok
    })
  const validStructures = (values: string[] | undefined, context: string): StructureId[] =>
    (values ?? []).filter((v): v is StructureId => {
      const ok = STRUCTURE_IDS.includes(v as StructureId)
      if (!ok) console.warn(`[content-office] dropping invalid structure "${v}" from ${context}`)
      return ok
    })
  const validChannels = (values: string[] | undefined, context: string): ChannelId[] =>
    (values ?? []).filter((v): v is ChannelId => {
      const ok = CHANNEL_IDS.includes(v as ChannelId)
      if (!ok) console.warn(`[content-office] dropping invalid channel "${v}" from ${context}`)
      return ok
    })

  const result: ContentOfficeResult = {
    inputs,
    profile: extras.profile!.trim(),
    pillars,
    starterSequence: extras.starterSequence!.map((p, i) => ({
      order: i + 1,
      pillar: p.pillar!,
      theme: coerceTheme(p.theme, `starter post ${i + 1}`),
      contentIdea: p.contentIdea!.trim(),
    })),
    gaps: {
      body: extras.gaps!.body!.trim(),
      underusedThemes: validThemes(extras.gaps!.underusedThemes, 'gaps.underusedThemes'),
      avoidedStructures: validStructures(extras.gaps!.avoidedStructures, 'gaps.avoidedStructures'),
      missingPillarNote: extras.gaps!.missingPillarNote!.trim(),
    },
    channelFit: {
      body: extras.channelFit!.body!.trim(),
      mismatchedChannels: validChannels(extras.channelFit!.mismatchedChannels, 'channelFit.mismatchedChannels'),
      opportunityThemes: validThemes(extras.channelFit!.opportunityThemes, 'channelFit.opportunityThemes'),
      capacityNote: extras.channelFit!.capacityNote!.trim(),
    },
    rhythm: {
      cadence: extras.rhythm!.cadence!.trim(),
      body: extras.rhythm!.body!.trim(),
      disclaimer: extras.rhythm!.disclaimer!.trim(),
    },
  }

  return NextResponse.json(result)
}
