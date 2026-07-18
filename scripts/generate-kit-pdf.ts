// Generates the static CMO Boardroom Kit PDF served from /public/downloads.
// Run with: npm run generate-kit
// Standalone script (not part of the Next.js build) — duplicates the small
// set of PDF helpers from src/lib/generateVendorCheckPDF.ts and
// src/lib/generateAdvisorPDF.ts rather than importing them, so it has no
// dependency on the app's path aliases or bundler config.

import { jsPDF } from 'jspdf'
import * as fs from 'fs'
import * as path from 'path'

type RGB = [number, number, number]
type FontStyle = 'normal' | 'bold' | 'italic'

// ── Colors (site brand palette) ──

function hex(h: string): RGB {
  const n = parseInt(h.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const DARK = hex('#1a1a1a')
const BODY_TEXT = hex('#333333')
const MUTED = hex('#777777')
const LIGHT_MUTED = hex('#999999')
const BORDER = hex('#e5e5e5')
const CREAM = hex('#fff8f0')
const ACCENT = hex('#e8450a')
const ACCENT_BG = hex('#fdeee8')
const PROMPT_BG = hex('#f0f0f0')
const WHITE: RGB = [255, 255, 255]

// ── Text sanitization (mirrors generateVendorCheckPDF.ts) ──
// jsPDF's standard "helvetica" font only maps glyphs for WinAnsi (cp1252)
// encoding. Every string handed to jsPDF is routed through here first.

const CP1252_EXTRA: Record<number, string> = {
  0x80: '€', 0x82: '‚', 0x83: 'ƒ', 0x84: '„', 0x85: '…',
  0x86: '†', 0x87: '‡', 0x88: 'ˆ', 0x89: '‰', 0x8A: 'Š',
  0x8B: '‹', 0x8C: 'Œ', 0x8E: 'Ž', 0x91: '‘', 0x92: '’',
  0x93: '“', 0x94: '”', 0x95: '•', 0x96: '–', 0x97: '—',
  0x98: '˜', 0x99: '™', 0x9A: 'š', 0x9B: '›', 0x9C: 'œ',
  0x9E: 'ž', 0x9F: 'Ÿ',
}

const WINANSI_CODEPOINTS = new Set<number>([
  ...Array.from({ length: 0x80 }, (_, i) => i),
  ...Object.values(CP1252_EXTRA).map((c) => c.codePointAt(0)!),
  ...Array.from({ length: 0x60 }, (_, i) => 0xa0 + i),
])

const CHAR_REPLACEMENTS: Record<string, string> = {
  '₹': 'Rs. ',
  '→': '->',
  '←': '<-',
  '‑': '-',
}

function sanitizeText(text: string): string {
  if (!text) return text
  let out = ''
  for (const ch of text) {
    const code = ch.codePointAt(0)!
    if (WINANSI_CODEPOINTS.has(code)) {
      out += ch
    } else if (CHAR_REPLACEMENTS[ch]) {
      out += CHAR_REPLACEMENTS[ch]
    } else {
      out += '?'
    }
  }
  return out
}

// ── Layout ──

const PT = 0.3528
const mmPt = (pt: number) => pt * PT

class Cursor {
  doc: jsPDF
  margin = 20
  pageWidth: number
  pageHeight: number
  contentWidth: number
  bottomLimit: number
  y: number

  constructor(doc: jsPDF) {
    this.doc = doc
    this.pageWidth = doc.internal.pageSize.getWidth()
    this.pageHeight = doc.internal.pageSize.getHeight()
    this.contentWidth = this.pageWidth - this.margin * 2
    this.bottomLimit = this.pageHeight - 25
    this.y = this.margin
  }

  ensureSpace(height: number) {
    if (this.y + height > this.bottomLimit) {
      this.doc.addPage()
      this.y = this.margin
    }
  }

  addSpace(mm: number) {
    this.y += mm
  }

  hr(color: RGB = BORDER) {
    this.doc.setDrawColor(...color)
    this.doc.setLineWidth(0.18)
    this.doc.line(this.margin, this.y, this.pageWidth - this.margin, this.y)
  }
}

function setFont(doc: jsPDF, size: number, style: FontStyle = 'normal') {
  doc.setFont('helvetica', style)
  doc.setFontSize(size)
}

function setTextColor(doc: jsPDF, c: RGB) {
  doc.setTextColor(c[0], c[1], c[2])
}

function setFillColor(doc: jsPDF, c: RGB) {
  doc.setFillColor(c[0], c[1], c[2])
}

function setDrawColor(doc: jsPDF, c: RGB) {
  doc.setDrawColor(c[0], c[1], c[2])
}

function drawParagraph(
  doc: jsPDF,
  cur: Cursor,
  text: string,
  opts: {
    fontSize: number
    style?: FontStyle
    color: RGB
    lineHeight: number
    x?: number
    maxWidth?: number
    align?: 'left' | 'center' | 'right'
  }
) {
  setFont(doc, opts.fontSize, opts.style ?? 'normal')
  const maxWidth = opts.maxWidth ?? cur.contentWidth
  const lines: string[] = doc.splitTextToSize(sanitizeText(text), maxWidth)
  setTextColor(doc, opts.color)
  for (const line of lines) {
    cur.ensureSpace(opts.lineHeight)
    let x = opts.x ?? cur.margin
    if (opts.align === 'center') x = cur.pageWidth / 2
    if (opts.align === 'right') x = cur.pageWidth - cur.margin
    doc.text(line, x, cur.y + opts.lineHeight * 0.75, { align: opts.align ?? 'left' })
    cur.y += opts.lineHeight
  }
}

// ── Small fixed-height cards (cover page "Inside" box, closing CTA) ──

type CardItem =
  | { kind: 'text'; text: string; fontSize: number; style?: FontStyle; color: RGB; lineHeight: number; align?: 'left' | 'center'; spaceBefore?: number }
  | { kind: 'mixed'; boldPrefix: string; text: string; fontSize: number; color: RGB; lineHeight: number; spaceBefore?: number }
  | { kind: 'space'; height: number }

function measureCardHeight(doc: jsPDF, items: CardItem[], innerWidth: number, paddingV: number): number {
  let h = paddingV * 2
  for (const item of items) {
    if (item.kind === 'space') {
      h += item.height
      continue
    }
    h += item.spaceBefore ?? 0
    if (item.kind === 'text') {
      setFont(doc, item.fontSize, item.style ?? 'normal')
      const lines = doc.splitTextToSize(sanitizeText(item.text), innerWidth)
      h += lines.length * item.lineHeight
    } else if (item.kind === 'mixed') {
      setFont(doc, item.fontSize, 'bold')
      const boldWidth = doc.getTextWidth(item.boldPrefix)
      setFont(doc, item.fontSize, 'normal')
      const fitsOneLine = boldWidth + doc.getTextWidth(item.text) <= innerWidth
      if (fitsOneLine) {
        h += item.lineHeight
      } else {
        h += item.lineHeight
        const wrapped = doc.splitTextToSize(sanitizeText(item.text), innerWidth)
        h += wrapped.length * item.lineHeight
      }
    }
  }
  return h
}

function drawCardItems(doc: jsPDF, items: CardItem[], x: number, startY: number, innerWidth: number) {
  let y = startY
  for (const item of items) {
    if (item.kind === 'space') {
      y += item.height
      continue
    }
    y += item.spaceBefore ?? 0

    if (item.kind === 'text') {
      setFont(doc, item.fontSize, item.style ?? 'normal')
      setTextColor(doc, item.color)
      const lines = doc.splitTextToSize(sanitizeText(item.text), innerWidth)
      for (const line of lines) {
        const tx = item.align === 'center' ? x + innerWidth / 2 : x
        doc.text(line, tx, y + item.lineHeight * 0.75, { align: item.align === 'center' ? 'center' : 'left' })
        y += item.lineHeight
      }
    } else if (item.kind === 'mixed') {
      setFont(doc, item.fontSize, 'bold')
      const boldWidth = doc.getTextWidth(item.boldPrefix)
      setFont(doc, item.fontSize, 'normal')
      const fitsOneLine = boldWidth + doc.getTextWidth(item.text) <= innerWidth
      setTextColor(doc, item.color)
      if (fitsOneLine) {
        setFont(doc, item.fontSize, 'bold')
        doc.text(item.boldPrefix, x, y + item.lineHeight * 0.75)
        setFont(doc, item.fontSize, 'normal')
        doc.text(sanitizeText(item.text), x + boldWidth, y + item.lineHeight * 0.75)
        y += item.lineHeight
      } else {
        setFont(doc, item.fontSize, 'bold')
        doc.text(item.boldPrefix.trim(), x, y + item.lineHeight * 0.75)
        y += item.lineHeight
        setFont(doc, item.fontSize, 'normal')
        const wrapped = doc.splitTextToSize(sanitizeText(item.text), innerWidth)
        for (const line of wrapped) {
          doc.text(line, x, y + item.lineHeight * 0.75)
          y += item.lineHeight
        }
      }
    }
  }
}

function drawCard(
  doc: jsPDF,
  cur: Cursor,
  items: CardItem[],
  opts: { bg?: RGB; border?: RGB; paddingH: number; paddingV: number; radius?: number }
) {
  const innerWidth = cur.contentWidth - opts.paddingH * 2
  const height = measureCardHeight(doc, items, innerWidth, opts.paddingV)
  cur.ensureSpace(height)
  const top = cur.y
  const radius = opts.radius ?? 1.5

  if (opts.bg) setFillColor(doc, opts.bg)
  if (opts.border) {
    setDrawColor(doc, opts.border)
    doc.setLineWidth(0.18)
  }
  const style = opts.bg && opts.border ? 'FD' : opts.bg ? 'F' : 'D'
  doc.roundedRect(cur.margin, top, cur.contentWidth, height, radius, radius, style)

  drawCardItems(doc, items, cur.margin + opts.paddingH, top + opts.paddingV, innerWidth)
  cur.y = top + height
}

// ── Prompt blocks: gray-fill + orange left-border boxes that can flow
// across page breaks (used for the Part 1 boardroom prompt and each Part 2
// single-advisor prompt, since both must be pasted verbatim into a chat
// tool and are too long to treat as fixed-height cards). ──

type PLine =
  | { kind: 'plain'; text: string; fontSize: number; style: FontStyle; color: RGB; lineHeight: number; spaceBefore: number }
  | { kind: 'split'; prefix: string; text: string; fontSize: number; color: RGB; lineHeight: number; spaceBefore: number }

function pushParagraph(
  doc: jsPDF,
  acc: PLine[],
  text: string,
  fontSize: number,
  style: FontStyle,
  color: RGB,
  lineHeight: number,
  innerWidth: number,
  spaceBefore = 0
) {
  setFont(doc, fontSize, style)
  const wrapped: string[] = doc.splitTextToSize(sanitizeText(text), innerWidth)
  wrapped.forEach((w, i) => {
    acc.push({ kind: 'plain', text: w, fontSize, style, color, lineHeight, spaceBefore: i === 0 ? spaceBefore : 0 })
  })
}

function pushHeading(doc: jsPDF, acc: PLine[], text: string, fontSize: number, color: RGB, lineHeight: number, spaceBefore = 0) {
  acc.push({ kind: 'plain', text: sanitizeText(text), fontSize, style: 'bold', color, lineHeight, spaceBefore })
}

function pushMixed(
  doc: jsPDF,
  acc: PLine[],
  boldPrefix: string,
  text: string,
  fontSize: number,
  color: RGB,
  lineHeight: number,
  innerWidth: number,
  spaceBefore = 0
) {
  const prefix = sanitizeText(boldPrefix)
  const body = sanitizeText(text)
  if (!body) {
    acc.push({ kind: 'plain', text: prefix, fontSize, style: 'bold', color, lineHeight, spaceBefore })
    return
  }
  setFont(doc, fontSize, 'bold')
  const prefixWidth = doc.getTextWidth(prefix)
  setFont(doc, fontSize, 'normal')
  const fitsOneLine = prefixWidth + doc.getTextWidth(body) <= innerWidth
  if (fitsOneLine) {
    acc.push({ kind: 'split', prefix, text: body, fontSize, color, lineHeight, spaceBefore })
  } else {
    acc.push({ kind: 'plain', text: prefix.trimEnd(), fontSize, style: 'bold', color, lineHeight, spaceBefore })
    const wrapped: string[] = doc.splitTextToSize(body.trimStart(), innerWidth)
    wrapped.forEach((w) => acc.push({ kind: 'plain', text: w, fontSize, style: 'normal', color, lineHeight, spaceBefore: 0 }))
  }
}

function drawPLine(doc: jsPDF, line: PLine, x: number, baselineY: number) {
  if (line.kind === 'plain') {
    setFont(doc, line.fontSize, line.style)
    setTextColor(doc, line.color)
    doc.text(line.text, x, baselineY)
  } else {
    setFont(doc, line.fontSize, 'bold')
    setTextColor(doc, line.color)
    doc.text(line.prefix, x, baselineY)
    const w = doc.getTextWidth(line.prefix)
    setFont(doc, line.fontSize, 'normal')
    doc.text(line.text, x + w, baselineY)
  }
}

const PROMPT_PAD_H = 4
const PROMPT_PAD_TOP = 3.5
const PROMPT_PAD_BOTTOM = 3.5
const PROMPT_GAP_AFTER = 4

function promptBoxTotalHeight(lines: PLine[]): number {
  let h = PROMPT_PAD_TOP + PROMPT_PAD_BOTTOM
  for (const line of lines) h += line.spaceBefore + line.lineHeight
  return h
}

/** Renders a prompt block, splitting across pages as needed with a fresh gray/orange box on each page it spans. */
function renderPromptBox(doc: jsPDF, cur: Cursor, lines: PLine[]) {
  let idx = 0
  while (idx < lines.length) {
    if (cur.y + PROMPT_PAD_TOP + lines[idx].lineHeight > cur.bottomLimit) {
      doc.addPage()
      cur.y = cur.margin
    }
    const segStartY = cur.y
    let y = cur.y + PROMPT_PAD_TOP
    const segLines: { line: PLine; y: number }[] = []
    while (idx < lines.length) {
      const line = lines[idx]
      const lineTop = y + line.spaceBefore
      if (lineTop + line.lineHeight > cur.bottomLimit - PROMPT_PAD_BOTTOM && segLines.length > 0) break
      y = lineTop
      segLines.push({ line, y })
      y += line.lineHeight
      idx++
    }
    const segEndY = y + PROMPT_PAD_BOTTOM

    setFillColor(doc, PROMPT_BG)
    doc.rect(cur.margin, segStartY, cur.contentWidth, segEndY - segStartY, 'F')
    setFillColor(doc, ACCENT)
    doc.rect(cur.margin, segStartY, 1.2, segEndY - segStartY, 'F')

    for (const { line, y: ly } of segLines) {
      drawPLine(doc, line, cur.margin + PROMPT_PAD_H, ly + line.lineHeight * 0.75)
    }

    cur.y = segEndY + PROMPT_GAP_AFTER
    if (idx < lines.length) {
      doc.addPage()
      cur.y = cur.margin
    }
  }
}

/** Ensures a heading + short intro + prompt box stay together on one page when they fit on a fresh page. */
function ensureBlockTogether(doc: jsPDF, cur: Cursor, totalHeight: number) {
  const fitsFreshPage = totalHeight <= cur.bottomLimit - cur.margin
  if (fitsFreshPage && cur.y + totalHeight > cur.bottomLimit) {
    doc.addPage()
    cur.y = cur.margin
  }
}

// ── Numbered lesson items (Part 3) — never split across a page ──

function drawLessonItem(doc: jsPDF, cur: Cursor, num: number, text: string, fontSize: number, color: RGB, lineHeight: number) {
  const prefix = `${num}. `
  setFont(doc, fontSize, 'normal')
  const prefixWidth = doc.getTextWidth(prefix)
  const innerWidth = cur.contentWidth - prefixWidth
  const wrapped: string[] = doc.splitTextToSize(sanitizeText(text), innerWidth)
  const totalHeight = wrapped.length * lineHeight
  cur.ensureSpace(totalHeight)
  const top = cur.y
  setTextColor(doc, color)
  doc.text(prefix, cur.margin, top + lineHeight * 0.75)
  wrapped.forEach((line, i) => {
    doc.text(line, cur.margin + prefixWidth, top + lineHeight * 0.75 + i * lineHeight)
  })
  cur.y = top + totalHeight
  cur.addSpace(3)
}

// ── Content data ──

const BOARD_MEMBERS: { name: string; desc: string }[] = [
  {
    name: 'THE FUNDAMENTALS OPERATOR',
    desc: 'positioning, messaging, and distribution are most of the work, fix them first. Brand equals business model. Go slow to go fast. No brand, no demand. Writing it down exposes whether you understand your positioning.',
  },
  {
    name: 'THE CUSTOMER-LED GROWTH ARCHITECT',
    desc: 'the journey is a loop, not a one-way funnel. Community is the biggest growth lever. Customers grow you through usage and advocacy. Build the customer-first habit before you scale. Sell by asking questions.',
  },
  {
    name: 'THE DEMAND AND ABM STRATEGIST',
    desc: 'find an edge nobody is exploiting and move before it gets crowded. Avoid what everyone does. ABM is a multi-year game, insights before engagement before lead-gen. Niche to one ideal customer.',
  },
  {
    name: 'THE BRAND AND PERSUASION VETERAN',
    desc: 'advertising is persuasion, an art. Branding is managing perceptions. Tell one consistent story. B2B buyers carry emotion. Nothing spreads on its own, push it out. Beat the environment your content interrupts.',
  },
  {
    name: 'THE PRODUCT MARKETING AND LAUNCH LEAD',
    desc: 'get customer, product, and market right before scaling a campaign. Have customer stories ready before launch. Gate launches on four filters: easy to buy, sell, serve, exit. Solve adjacent problems for stickiness.',
  },
  {
    name: 'THE AI-ERA REALIST',
    desc: 'search is becoming ask, optimize to be the answer and the cited source. Create content for AI agents too. AI is an intern, not the CMO. Thinking is the edge, execution is cheap. AI expands capacity, not just cuts cost.',
  },
  {
    name: 'THE PEOPLE AND ORG BUILDER',
    desc: 'build people through mastery, autonomy, purpose. Hire for attitude and learnability over a perfect resume. Build a function in layers held by alignment. Decentralize control with responsibility. The broad generalist wins.',
  },
  {
    name: 'THE REVENUE AND ALIGNMENT CLOSER',
    desc: 'the rare skill is tying marketing to revenue. Get marketing into the top half of the P&L. No single best channel, results are many touchpoints together. Win sales trust through shared definitions of success. Marketing carries pipeline, sales owns closure.',
  },
]

type Advisor = {
  name: string
  upperName: string
  role: string
  introSuffix: string
  forLine: string
  beliefs: string[]
  respond: string[]
  rules: string
}

const ADVISORS: Advisor[] = [
  {
    name: 'The Fundamentals Operator',
    upperName: 'THE FUNDAMENTALS OPERATOR',
    role: 'a senior marketing advisor',
    introSuffix: ', not a balanced overview.',
    forLine: 'For positioning, messaging, and "what do we actually do" problems.',
    beliefs: [
      'Positioning, messaging, and distribution are most of the work. Fix them before anything clever.',
      'Brand equals business model. Never promise what the business cannot deliver.',
      'Go slow to go fast. Do not make noise before you can say who you serve and what you solve.',
      'No brand, no demand. Most buyers pick a vendor they already knew.',
      'If you cannot write the positioning down in one clear sentence, you do not understand it yet.',
    ],
    respond: [
      'If you need context, ask up to two quick questions. Otherwise proceed.',
      'Your read: what is really going on.',
      'The one-sentence test: make them state who they are for and what they solve.',
      'What you would do: 3 to 5 specific moves.',
      'What would break, and the early signal.',
    ],
    rules:
      'RULES: specific not generic, plain language, no em dashes, no jargon (unlock, leverage, synergy, and similar), operator tone, no flattery. Do not invent stats, a labeled rule of thumb is fine.',
  },
  {
    name: 'The Customer-Led Growth Architect',
    upperName: 'THE CUSTOMER-LED GROWTH ARCHITECT',
    role: 'a senior advisor on customer success and customer-led growth',
    introSuffix: '.',
    forLine: 'For retention, expansion, community, and customer-marketing problems.',
    beliefs: [
      'The customer journey is a loop, not a one-way funnel. Happy customers create more customers.',
      'Community is the single biggest growth lever. It can lift you or sink you.',
      'Customers grow you organically through usage and through advocacy, references, and reviews.',
      'Build the customer-first habit while customers are few. It is very hard to turn the ship later.',
      'Sell and serve by asking questions, not by pitching what you know.',
      'Retention is product and experience first. Discounts are a patch, not a strategy.',
    ],
    respond: [
      'If you need context, ask up to two quick questions. Otherwise proceed.',
      'Your read: what is really going on with their customers.',
      'Who already loves them, and how to make those people louder.',
      'What you would do: 3 to 5 specific moves.',
      'What would break, and the early signal.',
    ],
    rules: 'RULES: specific not generic, plain language, no em dashes, no jargon, operator tone, no flattery. Do not invent stats, a labeled rule of thumb is fine.',
  },
  {
    name: 'The Demand and ABM Strategist',
    upperName: 'THE DEMAND AND ABM STRATEGIST',
    role: 'a senior advisor on demand generation and account-based marketing',
    introSuffix: '.',
    forLine: 'For pipeline, targeting accounts, and finding an edge.',
    beliefs: [
      'Look for an edge nobody is exploiting yet and move before it gets crowded.',
      'Avoid what everyone else is doing. Crowded tactics are inefficient and undifferentiated.',
      'ABM is a multi-year patience game. Do account insights first, then engagement, then lead-gen.',
      'Niche your brand to one ideal customer to cut the noise to a few real competitors.',
      'Differentiation is not permanent. Keep sharpening the narrative.',
    ],
    respond: [
      'If you need context, ask up to two quick questions. Otherwise proceed.',
      'Your read: where the real, uncontested opportunity is.',
      'The honest check: is this differentiated, or just what the category does.',
      'What you would do: 3 to 5 specific moves.',
      'What would break, and the early signal.',
    ],
    rules: 'RULES: specific not generic, plain language, no em dashes, no jargon, operator tone, no flattery. Do not invent stats, a labeled rule of thumb is fine.',
  },
  {
    name: 'The Brand and Persuasion Veteran',
    upperName: 'THE BRAND AND PERSUASION VETERAN',
    role: 'a senior advisor on brand and advertising',
    introSuffix: '.',
    forLine: 'For brand, story, creative, and standing out in a crowded feed.',
    beliefs: [
      'Advertising is persuasion, an art, not a dashboard. Judge it by whether behavior changes.',
      'Branding is managing perceptions. Design the cues that make value feel real.',
      'Tell one consistent story. Changing it confuses the buyer.',
      'B2B buyers are not rational robots. They carry fear and emotion. So do B2C buyers who research.',
      'Nothing spreads on its own. Spend more pushing content out than making it.',
      'Your content has to beat the environment it interrupts, or it gets ignored.',
    ],
    respond: [
      'If you need context, ask up to two quick questions. Otherwise proceed.',
      'Your read: what story they own, or fail to own.',
      'The test: is this interesting enough to survive the feed it lands in.',
      'What you would do: 3 to 5 specific moves.',
      'What would break, and the early signal.',
    ],
    rules: 'RULES: specific not generic, plain language, no em dashes, no jargon, operator tone, no flattery. Do not invent stats, a labeled rule of thumb is fine.',
  },
  {
    name: 'The Product Marketing and Launch Lead',
    upperName: 'THE PRODUCT MARKETING AND LAUNCH LEAD',
    role: 'a senior advisor on product marketing and launches',
    introSuffix: '.',
    forLine: 'For launches, messaging readiness, and feature-to-value translation.',
    beliefs: [
      'Product marketing exists to improve marketing efficiency: get customer, product, and market right before scaling a campaign.',
      'Have customer and pilot stories ready before launch, not after.',
      'Gate every launch on four filters: easy to buy, easy to sell, easy to serve, easy to exit.',
      'Solve adjacent problems to build stickiness and lower the cost of acquisition.',
      'Sell outcomes and numbers, not feature specs.',
    ],
    respond: [
      'If you need context, ask up to two quick questions. Otherwise proceed.',
      'Your read: is this actually ready, or about to course-correct in public.',
      'Run their plan through the four launch filters and call out the weak one.',
      'What you would do: 3 to 5 specific moves.',
      'What would break, and the early signal.',
    ],
    rules: 'RULES: specific not generic, plain language, no em dashes, no jargon, operator tone, no flattery. Do not invent stats, a labeled rule of thumb is fine.',
  },
  {
    name: 'The AI-Era Realist',
    upperName: 'THE AI-ERA REALIST',
    role: 'a senior advisor on marketing in the age of AI search and agents',
    introSuffix: '.',
    forLine: 'For AI search, content strategy, and using AI without getting generic.',
    beliefs: [
      'Search is becoming ask. Optimize to be the answer and the cited source, not just a ranking.',
      'Create content for AI agents too, not only humans. Structure it so it is easy to extract and cite.',
      'AI is an intern, not the CMO. Great at grunt work, useless at judgment and empathy.',
      'Mentor the agents. That needs deep functional knowledge, or they go wrong expensively.',
      'Execution is cheap now. Thinking is the edge. Use AI to refine your point of view, not to originate it.',
      'Frame AI as a way to expand capacity, not just to cut cost.',
    ],
    respond: [
      'If you need context, ask up to two quick questions. Otherwise proceed.',
      'Your read: will an AI recommend them, and are they using AI to think or just to fill space.',
      'What you would do: 3 to 5 specific moves.',
      'What would break, and the early signal.',
    ],
    rules: 'RULES: specific not generic, plain language, no em dashes, no jargon, operator tone, no flattery. Do not invent stats, a labeled rule of thumb is fine.',
  },
  {
    name: 'The People and Org Builder',
    upperName: 'THE PEOPLE AND ORG BUILDER',
    role: 'a senior advisor on marketing teams and org design',
    introSuffix: '.',
    forLine: 'For hiring, first marketing hires, team structure, and ownership.',
    beliefs: [
      'You do not hire unicorns, you build them through mastery, autonomy, and purpose.',
      'Hire for attitude, learnability, and ownership over a perfect resume. Functional skills can be taught.',
      'Build a new function in layers: infrastructure, then strategy, then execution, held together by alignment.',
      'Decentralize control with responsibility. Give guardrails, not micromanagement.',
      'The broad generalist wins in the AI age. Name one person clearly accountable for any initiative.',
    ],
    respond: [
      'If you need context, ask up to two quick questions. Otherwise proceed.',
      'Your read: do they have the right person owning this, and is accountability clear.',
      'What you would do: 3 to 5 specific moves, including who to hire or assign first.',
      'What would break, and the early signal.',
    ],
    rules: 'RULES: specific not generic, plain language, no em dashes, no jargon, operator tone, no flattery. Do not invent stats, a labeled rule of thumb is fine.',
  },
  {
    name: 'The Revenue and Alignment Closer',
    upperName: 'THE REVENUE AND ALIGNMENT CLOSER',
    role: 'a senior advisor on revenue marketing and sales alignment',
    introSuffix: '.',
    forLine: "For budget, channel mix, sales alignment, and proving marketing's value.",
    beliefs: [
      'Anyone can run campaigns. The rare skill is tying marketing to revenue.',
      'Get marketing into the top half of the P&L as a revenue contributor, or AI optimizes it away as a cost.',
      'There is no single best channel. Results are many touchpoints working together.',
      'Win sales trust through constant updates and a shared definition of success.',
      'Marketing carries pipeline, sales owns closure, and marketing does not disengage after the sale.',
      'Organic should be always-on. Paid is for spikes.',
    ],
    respond: [
      'If you need context, ask up to two quick questions. Otherwise proceed.',
      'Your read: how this shows up in pipeline and revenue, and whether sales is bought in.',
      'What you would do: 3 to 5 specific moves.',
      'What would break, and the early signal.',
    ],
    rules: 'RULES: specific not generic, plain language, no em dashes, no jargon, operator tone, no flattery. Do not invent stats, a labeled rule of thumb is fine.',
  },
]

const LESSON_CATEGORIES: { title: string; items: string[] }[] = [
  {
    title: 'Positioning and Fundamentals',
    items: [
      'Get positioning, messaging, and distribution right first. They are most of the work, before any clever tactic.',
      'Brand equals business model. If delivery cannot back the promise, the brand breaks.',
      'Go slow to go fast. Do not announce and make noise before you can clearly say who you serve.',
      'If you cannot write your positioning in one clear sentence, you do not understand it. Speaking lets you bluff, writing does not.',
      'Own a problem, not just a category. People should think of you when that specific pain shows up.',
      'Differentiation is not permanent. Competitors copy features fast, so keep sharpening the narrative.',
    ],
  },
  {
    title: 'Brand and Persuasion',
    items: [
      'Branding is managing perceptions. Design the cues that make value feel real.',
      'Tell one consistent story. Switching it confuses the buyer.',
      'B2B buying is emotional too. Buyers carry fear and bias, not just spreadsheets.',
      'Nothing spreads on its own. Spend more pushing content out than making it.',
      'Your content has to beat the environment it interrupts. A dull chart loses to the feed around it.',
      'Personal and founder branding is a by-product of posting with a real point of view, consistently, in one domain.',
    ],
  },
  {
    title: 'Demand, ABM, and Pipeline',
    items: [
      'Look for the edge nobody is exploiting, and double down before it gets crowded.',
      'Avoid what everyone else does. Crowded tactics are inefficient and undifferentiated.',
      'ABM is a multi-year game. Do account insights before engagement before lead-gen.',
      'Niche your brand to one ideal customer. It cuts the noise to a few real rivals.',
      'No brand, no demand. Most decision-makers pick a vendor they already knew.',
      'Only a small share of buyers are in-market at any time. Aim most content at the larger group still educating themselves.',
    ],
  },
  {
    title: 'Launch and Product Marketing',
    items: [
      'Product marketing exists to get customer, product, and market right before you scale spend.',
      'Have customer and pilot stories ready before launch, not after.',
      'Gate every launch on four filters: easy to buy, easy to sell, easy to serve, easy to exit.',
      'Sell outcomes and numbers, not feature specs. Customers buy results.',
      'Translate one feature into different value for each buyer: scalability for the CTO, ROI for the CFO, agility for the CMO.',
      'Solve adjacent problems to build stickiness and lower acquisition cost.',
    ],
  },
  {
    title: 'Customer-Led Growth, Retention, and Community',
    items: [
      'The journey is a loop, not a one-way funnel. Happy customers drive new customers.',
      'Retention is product and experience first. Discounts are a patch.',
      'Community is the single biggest growth lever. Find the tribe that already exists and give it a cause.',
      'Customers grow you through usage and through advocacy, references, and reviews. Treat advocacy as a growth channel.',
      'Build the customer-first habit while you are small. It is very hard to turn the ship later.',
      'Do not campaign before you have a few flagship reference customers with brilliant implementation.',
    ],
  },
  {
    title: 'The AI Era',
    items: [
      'Search is becoming ask. Optimize to be the answer and the cited source, not just a ranking.',
      'Create content for AI agents too. Structure it so it is easy to extract and cite.',
      'AI is an intern, not the CMO. Use it for grunt work, keep judgment and empathy human.',
      'Mentor the agents. That needs deep functional knowledge or they go wrong expensively.',
      'Execution is cheap now, thinking is the edge. Use AI to refine your point of view, not to originate it.',
      'Frame AI as expanding capacity to serve, not just cutting cost.',
    ],
  },
  {
    title: 'Team and Org',
    items: [
      'You do not hire unicorns, you build them through mastery, autonomy, and purpose.',
      'Hire for attitude, learnability, and ownership over a perfect resume. Skills can be taught.',
      'Build a new function in layers: infrastructure, then strategy, then execution, held by alignment.',
      'Decentralize control with responsibility. Give guardrails, not micromanagement.',
      'The broad generalist wins in the AI age. Name one person clearly accountable for any initiative.',
      'Never say no to a stretch assignment. You grow into it.',
    ],
  },
  {
    title: 'Measurement and Alignment',
    items: [
      'Anyone can run campaigns. The rare skill is tying marketing to revenue.',
      'Get marketing into the top half of the P&L, or it gets optimized away as a cost.',
      'There is no single best channel. Results are many touchpoints working together.',
      'Marketing carries pipeline, sales owns closure, and marketing does not disengage after the sale.',
      'Win sales trust through constant updates and a shared definition of success.',
      'For long sales cycles, measure marketing by the share of pipeline it sources, not final conversion.',
    ],
  },
]

// ── Page builders ──

const CHAPTER_TITLES = [
  'Positioning and Fundamentals',
  'Brand and Persuasion',
  'Demand, ABM, and Pipeline',
  'Launch and Product Marketing',
  'Customer-Led Growth, Retention, and Community',
  'The AI Era',
  'Team and Org',
  'Measurement and Alignment',
]

function buildCoverPage(doc: jsPDF, cur: Cursor) {
  const barHeight = 26
  setFillColor(doc, ACCENT)
  doc.rect(0, 0, cur.pageWidth, barHeight, 'F')

  setFont(doc, 16, 'bold')
  setTextColor(doc, WHITE)
  doc.text('Jaydip Sikdar', cur.pageWidth / 2, 13, { align: 'center' })
  setFont(doc, 9.5, 'normal')
  doc.text('jaydipsikdar.com', cur.pageWidth / 2, 20, { align: 'center' })

  cur.y = barHeight + 11

  drawParagraph(doc, cur, 'The CMO Boardroom Kit', {
    fontSize: 21,
    style: 'bold',
    color: DARK,
    lineHeight: mmPt(24),
    align: 'center',
  })
  cur.addSpace(3)

  drawParagraph(
    doc,
    cur,
    'A board of marketing operators in your pocket. Built from 21 long-form interviews on The Marketing Couch and 213 distilled lessons.',
    { fontSize: 10, color: BODY_TEXT, lineHeight: mmPt(13.5), align: 'center', maxWidth: cur.contentWidth - 15 }
  )
  cur.addSpace(7)

  drawParagraph(doc, cur, 'How to use this Kit:', { fontSize: 10.5, style: 'bold', color: DARK, lineHeight: mmPt(13) })
  cur.addSpace(0.8)
  drawParagraph(
    doc,
    cur,
    "Open to the problem you're working on. Each chapter gives you the operator principles — what experienced marketing leaders have learned about that domain — followed by an AI advisor prompt you can paste into ChatGPT, Claude, or Gemini for specific advice on your situation. For decisions that cut across multiple domains, start with The Full Boardroom on the next page.",
    { fontSize: 8.8, color: BODY_TEXT, lineHeight: mmPt(12) }
  )
  cur.addSpace(6)

  drawParagraph(doc, cur, 'Contents', { fontSize: 10.5, style: 'bold', color: DARK, lineHeight: mmPt(13) })
  cur.addSpace(1)

  const contentsFS = 9.3
  const contentsLH = mmPt(11.5)
  drawParagraph(doc, cur, 'The Full Boardroom', { fontSize: contentsFS, color: BODY_TEXT, lineHeight: contentsLH })
  CHAPTER_TITLES.forEach((title, i) => {
    drawParagraph(doc, cur, `Chapter ${i + 1}: ${title}`, { fontSize: contentsFS, color: BODY_TEXT, lineHeight: contentsLH })
  })
}

function buildFullBoardroom(doc: jsPDF, cur: Cursor) {
  doc.addPage()
  cur.y = cur.margin

  drawParagraph(doc, cur, 'The Full Boardroom', { fontSize: 18, style: 'bold', color: DARK, lineHeight: mmPt(22) })
  cur.addSpace(2)
  drawParagraph(
    doc,
    cur,
    'Use this when you have a real decision and want it argued from several angles before you commit. This prompt convenes up to eight marketing leaders, each with a distinct perspective, to debate your specific situation and hand you a clear call. Paste the entire block below as your first message, then answer the four questions it asks. In a hurry, start your message with QUICK MODE: and it skips straight to the answer.',
    { fontSize: 9.5, color: BODY_TEXT, lineHeight: mmPt(13.5) }
  )
  cur.addSpace(5)

  const innerWidth = cur.contentWidth - PROMPT_PAD_H * 2
  const FS = 8.7
  const LH = mmPt(11.5)
  const FS_HEAD = 9.8
  const gapS = 1.4
  const gapM = 2.8

  const acc: PLine[] = []

  pushParagraph(
    doc,
    acc,
    'You are THE CMO BOARD ROOM, a standing panel of eight senior marketing leaders convened to help me make one hard marketing decision at a time. You do not give generic advice. You reason like operators who have actually built brands, run demand, launched products, and owned revenue.',
    FS,
    'normal',
    BODY_TEXT,
    LH,
    innerWidth,
    0
  )

  pushHeading(doc, acc, 'THE BOARD', FS_HEAD, DARK, LH, gapM)
  pushParagraph(
    doc,
    acc,
    'Each member has a distinct lens and a habit of pushing back. Stay in character. Disagree when your character would disagree.',
    FS,
    'normal',
    BODY_TEXT,
    LH,
    innerWidth,
    gapS
  )

  BOARD_MEMBERS.forEach((m, i) => {
    pushMixed(doc, acc, `${i + 1}. ${m.name} — `, m.desc, FS, BODY_TEXT, LH, innerWidth, gapM)
  })

  pushHeading(doc, acc, 'HOW THE ROOM RUNS', FS_HEAD, DARK, LH, gapM + 1)

  pushMixed(doc, acc, 'STEP 1, INTAKE.', ' Before any advice, ask me these four questions and wait:', FS, BODY_TEXT, LH, innerWidth, gapM)
  ;[
    'What is the decision or problem, in one or two sentences?',
    'What is your business: B2B or B2C, product or service, rough stage or revenue, and your main go-to-market motion?',
    'What have you already tried or ruled out?',
    'What does a good outcome look like, and by when?',
  ].forEach((q) => pushParagraph(doc, acc, `- ${q}`, FS, 'normal', BODY_TEXT, LH, innerWidth, gapS))

  pushParagraph(
    doc,
    acc,
    'If my answers are unclear, ask at most one follow-up, a single question, then proceed. Do not assume facts I did not give you.',
    FS,
    'normal',
    BODY_TEXT,
    LH,
    innerWidth,
    gapM
  )
  pushParagraph(
    doc,
    acc,
    'EXCEPTION: if my first message starts with "QUICK MODE:", skip intake, state the 2 or 3 assumptions you are making, and go straight to STEP 2.',
    FS,
    'normal',
    BODY_TEXT,
    LH,
    innerWidth,
    gapS
  )

  pushMixed(doc, acc, 'STEP 2, CONVENE.', ' Pick the 3 to 4 most relevant members. Name them. Skip the rest.', FS, BODY_TEXT, LH, innerWidth, gapM)
  pushMixed(
    doc,
    acc,
    'STEP 3, DEBATE.',
    ' Each selected member gives their take in their own voice, reasoning from their beliefs, not platitudes. At least one must challenge another. Name the single point where they would genuinely choose differently and argue it. If they only differ on sequence, say so. Never fake agreement or conflict.',
    FS,
    BODY_TEXT,
    LH,
    innerWidth,
    gapM
  )
  pushMixed(doc, acc, 'STEP 4, SYNTHESIZE (as the Chair).', '', FS, BODY_TEXT, LH, innerWidth, gapM)
  ;[
    'Diagnosis: what is really going on, in plain language.',
    'The decision: state the actual call in plain words first, then name exactly ONE member whose view wins and why. List preconditions separately, not as co-winners. Do not reuse a fixed template across sessions.',
    'The moves: 3 to 5 specific, sequenced actions for this week.',
    'What would break: the likeliest failure and the early signal to watch.',
    'One question back to me.',
  ].forEach((q) => pushParagraph(doc, acc, `- ${q}`, FS, 'normal', BODY_TEXT, LH, innerWidth, gapS))

  pushHeading(doc, acc, 'RULES', FS_HEAD, DARK, LH, gapM + 1)
  ;[
    'Be specific to my situation. Generic advice is a failure.',
    'Disagreement must be real. If it is only about order, say so.',
    'No flattery, no hype, no filler. Operator tone.',
    'Do not invent precise statistics or named case studies. A clearly labeled rule of thumb is fine as judgment, not data.',
    'Plain language. No em dashes. Banned words: unlock, leverage, game-changer, synergy, beachhead, flywheel, lighthouse, north star, double-click, paradigm, supercharge, and any in-group jargon.',
  ].forEach((q) => pushParagraph(doc, acc, `- ${q}`, FS, 'normal', BODY_TEXT, LH, innerWidth, gapS))

  pushParagraph(
    doc,
    acc,
    'If my first message starts with "QUICK MODE:", follow the exception. Otherwise begin with STEP 1, INTAKE: ask the four questions and nothing else.',
    FS,
    'normal',
    BODY_TEXT,
    LH,
    innerWidth,
    gapM
  )

  renderPromptBox(doc, cur, acc)
}

function buildAdvisorLines(doc: jsPDF, advisor: Advisor, innerWidth: number): PLine[] {
  const FS = 8.7
  const LH = mmPt(11.5)
  const FS_HEAD = 9.3
  const gapS = 1.4
  const gapM = 2.6
  const acc: PLine[] = []

  pushParagraph(
    doc,
    acc,
    `You are ${advisor.upperName}, ${advisor.role}. A reader brings one problem. Give your honest, opinionated take${advisor.introSuffix}`,
    FS,
    'normal',
    BODY_TEXT,
    LH,
    innerWidth,
    0
  )

  pushHeading(doc, acc, 'YOUR BELIEFS (reason only from these):', FS_HEAD, DARK, LH, gapM)
  advisor.beliefs.forEach((b) => pushParagraph(doc, acc, `- ${b}`, FS, 'normal', BODY_TEXT, LH, innerWidth, gapS))

  pushHeading(doc, acc, 'HOW YOU RESPOND:', FS_HEAD, DARK, LH, gapM)
  advisor.respond.forEach((r, i) => pushParagraph(doc, acc, `${i + 1}. ${r}`, FS, 'normal', BODY_TEXT, LH, innerWidth, gapS))

  pushParagraph(doc, acc, advisor.rules, FS, 'normal', BODY_TEXT, LH, innerWidth, gapM)
  pushParagraph(doc, acc, 'Begin by asking what problem they want your view on.', FS, 'normal', BODY_TEXT, LH, innerWidth, gapM)

  return acc
}

// Chapter N (by LESSON_CATEGORIES index) is paired with ADVISORS[CHAPTER_ADVISOR_INDEX[N]],
// per the chapter-to-advisor mapping in the brief — the two arrays are ordered differently.
const CHAPTER_ADVISOR_INDEX = [0, 3, 2, 4, 1, 5, 6, 7]

const CHAPTER_ONE_LINERS = [
  "Use this when you're working on positioning, messaging, or answering \"what do we actually do.\"",
  "Use this when you're working on brand, story, creative, or standing out in a crowded feed.",
  "Use this when you're working on pipeline, targeting accounts, or finding an edge.",
  "Use this when you're working on launches, messaging readiness, or feature-to-value translation.",
  "Use this when you're working on retention, expansion, community, or customer-marketing problems.",
  "Use this when you're working on AI search, content strategy, or using AI without getting generic.",
  "Use this when you're working on hiring, first marketing hires, team structure, or ownership.",
  "Use this when you're working on budget, channel mix, sales alignment, or proving marketing's value.",
]

const ADVISOR_PROMPT_INTRO = 'Paste this prompt to get one sharp, opinionated take on your specific situation.'

function buildChapter(doc: jsPDF, cur: Cursor, chapterNum: number) {
  const category = LESSON_CATEGORIES[chapterNum - 1]
  const advisor = ADVISORS[CHAPTER_ADVISOR_INDEX[chapterNum - 1]]
  const oneLiner = CHAPTER_ONE_LINERS[chapterNum - 1]

  doc.addPage()
  cur.y = cur.margin

  drawParagraph(doc, cur, `Chapter ${chapterNum}: ${category.title}`, { fontSize: 18, style: 'bold', color: DARK, lineHeight: mmPt(22) })
  cur.addSpace(1.5)
  drawParagraph(doc, cur, oneLiner, { fontSize: 9.5, style: 'italic', color: MUTED, lineHeight: mmPt(13) })
  cur.addSpace(5)

  drawParagraph(doc, cur, 'What Operators Know', { fontSize: 11.5, style: 'bold', color: DARK, lineHeight: mmPt(15) })
  cur.addSpace(2)

  const lessonFS = 10
  const lessonLH = mmPt(14.5)
  category.items.forEach((item, i) => drawLessonItem(doc, cur, i + 1, item, lessonFS, BODY_TEXT, lessonLH))
  cur.addSpace(6)

  const innerWidth = cur.contentWidth - PROMPT_PAD_H * 2
  const lines = buildAdvisorLines(doc, advisor, innerWidth)
  const boxHeight = promptBoxTotalHeight(lines)

  const headingLH = mmPt(15)
  const onelinerLH = mmPt(12.5)
  setFont(doc, 9, 'italic')
  const onelinerWrapped: string[] = doc.splitTextToSize(sanitizeText(ADVISOR_PROMPT_INTRO), cur.contentWidth)
  const headingBlockHeight = headingLH + 1.2 + onelinerWrapped.length * onelinerLH + 3

  ensureBlockTogether(doc, cur, headingBlockHeight + boxHeight)

  drawParagraph(doc, cur, `Your Advisor: ${advisor.name}`, { fontSize: 12.5, style: 'bold', color: DARK, lineHeight: headingLH })
  cur.addSpace(1.2)
  drawParagraph(doc, cur, ADVISOR_PROMPT_INTRO, { fontSize: 9, style: 'italic', color: MUTED, lineHeight: onelinerLH })
  cur.addSpace(3)

  renderPromptBox(doc, cur, lines)
}

function buildChapters(doc: jsPDF, cur: Cursor) {
  for (let n = 1; n <= 8; n++) buildChapter(doc, cur, n)
}

function buildClosing(doc: jsPDF, cur: Cursor) {
  cur.addSpace(6)
  cur.hr()
  cur.addSpace(6)

  drawParagraph(doc, cur, 'Built by the creator and host of The Marketing Couch podcast.', {
    fontSize: 10.5,
    style: 'bold',
    color: DARK,
    lineHeight: mmPt(14),
    align: 'center',
  })
  cur.addSpace(2)
  drawParagraph(
    doc,
    cur,
    'Want the live version that picks the right lessons for your exact situation? Try the Marketing Decision Advisor at',
    { fontSize: 9.5, color: BODY_TEXT, lineHeight: mmPt(13.5), align: 'center', maxWidth: cur.contentWidth - 20 }
  )
  cur.addSpace(1.5)

  setFont(doc, 10, 'bold')
  setTextColor(doc, ACCENT)
  const linkText = 'jaydipsikdar.com/resources/marketing-advisor'
  const linkWidth = doc.getTextWidth(linkText)
  doc.textWithLink(linkText, cur.pageWidth / 2 - linkWidth / 2, cur.y + mmPt(14) * 0.75, {
    url: 'https://www.jaydipsikdar.com/resources/marketing-advisor',
  })
  cur.addSpace(mmPt(14))

  cur.addSpace(8)
  drawParagraph(doc, cur, '© 2026 Jaydip Sikdar', {
    fontSize: 8.5,
    color: MUTED,
    lineHeight: mmPt(12),
    align: 'center',
  })
}

function drawFooters(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const lineY = pageHeight - 15
  const textY = lineY + mmPt(10)

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    setDrawColor(doc, BORDER)
    doc.setLineWidth(0.18)
    doc.line(margin, lineY, pageWidth - margin, lineY)

    setFont(doc, 7.5, 'normal')
    setTextColor(doc, LIGHT_MUTED)
    doc.text('Jaydip Sikdar  ·  jaydipsikdar.com', margin, textY)
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, textY, { align: 'right' })
  }
}

// ── Entry point ──

function generateKitPDF(): { bytes: Uint8Array; pageCount: number } {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const cur = new Cursor(doc)

  buildCoverPage(doc, cur)
  buildFullBoardroom(doc, cur)
  buildChapters(doc, cur)
  buildClosing(doc, cur)
  drawFooters(doc)

  return { bytes: new Uint8Array(doc.output('arraybuffer')), pageCount: doc.getNumberOfPages() }
}

function main() {
  const { bytes, pageCount } = generateKitPDF()
  const outPath = path.join(__dirname, '..', 'public', 'downloads', 'cmo-boardroom-kit.pdf')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, Buffer.from(bytes))

  console.log(`Wrote ${outPath} (${pageCount} pages)`)
}

main()
