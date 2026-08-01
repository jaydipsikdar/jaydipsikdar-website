import { jsPDF } from 'jspdf'
import {
  THEMES,
  themeById,
  structureById,
  channelById,
  type ContentOfficeResult,
  type MatrixCell,
} from './contentOfficeData'
// PDFs can't trigger the Razorpay Checkout SDK, so these CTAs route to the
// /contact page instead, where the payment flow lives.
const CONTACT_URL = 'https://jaydipsikdar.com/contact'

type RGB = [number, number, number]
type FontStyle = 'normal' | 'bold' | 'italic'

// ── Colors (docs/brand/design.md) ──

function hex(h: string): RGB {
  const n = parseInt(h.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const TEXT_BODY = hex('#13233d')
const TEXT_SECONDARY = hex('#34465d')
const TEXT_MUTED = hex('#6d7d91')
const BORDER = hex('#e0e7ef')
const SURFACE_SOFT = hex('#f6f9fc')
const SURFACE_CREAM = hex('#f7eddc')
const PRIMARY = hex('#e84500')
const OCHRE = hex('#b57738')
const ROSE = hex('#df4770')
const PINK = hex('#ef7bc2')
const WHITE: RGB = [255, 255, 255]

// ── Text sanitization (mirrors generateMaturityScorePDF.ts) ──

const CHAR_REPLACEMENTS: Record<string, string> = {
  '₹': 'Rs. ',
  '→': '->',
  '←': '<-',
  '–': '-',
  '—': '-',
  '‘': "'",
  '’': "'",
  '“': '"',
  '”': '"',
}
const WINANSI_MAX = 0xff

function sanitizeText(text: string): string {
  if (!text) return text
  let out = ''
  for (const ch of text) {
    const code = ch.codePointAt(0)!
    if (CHAR_REPLACEMENTS[ch]) out += CHAR_REPLACEMENTS[ch]
    else if (code <= WINANSI_MAX) out += ch
    else out += '?'
  }
  return out
}

// ── Layout primitives ──

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

  newPage() {
    this.doc.addPage()
    this.y = this.margin
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
  opts: { fontSize: number; style?: FontStyle; color: RGB; lineHeight: number; x?: number; maxWidth?: number; align?: 'left' | 'center' | 'right' }
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

function withOpacity(doc: jsPDF, opacity: number, draw: () => void) {
  const gState = (doc as unknown as { GState: new (opts: { opacity: number }) => unknown }).GState
  doc.saveGraphicsState()
  doc.setGState(new gState({ opacity }))
  draw()
  doc.restoreGraphicsState()
}

// ── Atmospheric color field (authored fresh: soft ochre/rose/pink washes) ──

function drawColorField(doc: jsPDF, cur: Cursor) {
  const bandHeight = 46
  withOpacity(doc, 0.09, () => {
    setFillColor(doc, OCHRE)
    doc.circle(cur.margin - 5, 6, 30, 'F')
  })
  withOpacity(doc, 0.08, () => {
    setFillColor(doc, ROSE)
    doc.circle(cur.pageWidth - cur.margin + 10, 2, 26, 'F')
  })
  withOpacity(doc, 0.07, () => {
    setFillColor(doc, PINK)
    doc.circle(cur.pageWidth / 2 + 30, bandHeight - 4, 22, 'F')
  })
}

// ── Header ──

function buildHeader(doc: jsPDF, cur: Cursor, result: ContentOfficeResult) {
  drawColorField(doc, cur)

  setFont(doc, 9, 'normal')
  setTextColor(doc, TEXT_MUTED)
  doc.text('Jaydeepp Sikdar', cur.pageWidth / 2, cur.y + 5, { align: 'center' })
  cur.addSpace(12)

  setFont(doc, 8, 'normal')
  setTextColor(doc, PRIMARY)
  doc.text("JAYDEEPP'S CONTENT OFFICE", cur.pageWidth / 2, cur.y, { align: 'center' })
  cur.addSpace(9)

  setFont(doc, 22, 'normal')
  setTextColor(doc, TEXT_BODY)
  doc.text('Your content system', cur.pageWidth / 2, cur.y, { align: 'center' })
  cur.addSpace(10)

  drawParagraph(doc, cur, result.inputs.role, {
    fontSize: 11,
    color: TEXT_SECONDARY,
    lineHeight: mmPt(15),
    align: 'center',
    maxWidth: 150,
  })

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  drawParagraph(doc, cur, `Generated: ${today}`, { fontSize: 9, color: TEXT_MUTED, lineHeight: mmPt(12), align: 'center' })

  cur.addSpace(4)
  cur.hr()
  cur.addSpace(8)
}

// ── Section 1: profile ──

function buildProfile(doc: jsPDF, cur: Cursor, result: ContentOfficeResult) {
  setFont(doc, 16, 'normal')
  setTextColor(doc, TEXT_BODY)
  cur.ensureSpace(10)
  doc.text('Your content profile', cur.margin, cur.y + 4)
  cur.addSpace(10)

  drawParagraph(doc, cur, result.profile, { fontSize: 10, color: TEXT_SECONDARY, lineHeight: mmPt(14.5) })
  cur.addSpace(8)
}

// ── Section 2: full matrix, one mini-card per cell, grouped by pillar ──

function drawMatrixCell(doc: jsPDF, cur: Cursor, cell: MatrixCell) {
  const theme = themeById(cell.theme)
  const structure = structureById(cell.structure)
  const paddingV = 5
  const paddingH = 6
  const innerWidth = cur.contentWidth - paddingH * 2

  setFont(doc, 10, 'normal')
  const titleLines: string[] = doc.splitTextToSize(sanitizeText(cell.contentIdea), innerWidth)
  const titleLH = mmPt(13.5)

  setFont(doc, 8.5, 'normal')
  const channelLineGroups = cell.channelMapping.map((m) => {
    const label = `${channelById(m.channel).name}: ${m.guidance}`
    return doc.splitTextToSize(sanitizeText(label), innerWidth) as string[]
  })
  const channelLH = mmPt(11.5)
  const channelLineCount = channelLineGroups.reduce((sum, lines) => sum + lines.length, 0)

  const themeRowH = 6
  const titleBlockH = titleLines.length * titleLH
  const channelBlockH = channelLineCount * channelLH
  const cardHeight = paddingV * 2 + themeRowH + titleBlockH + 2 + channelBlockH

  cur.ensureSpace(cardHeight)
  const top = cur.y

  setFillColor(doc, WHITE)
  setDrawColor(doc, BORDER)
  doc.setLineWidth(0.18)
  doc.roundedRect(cur.margin, top, cur.contentWidth, cardHeight, 2, 2, 'FD')

  const innerX = cur.margin + paddingH
  let y = top + paddingV

  setFont(doc, 7.5, 'normal')
  setTextColor(doc, hex(theme.color))
  doc.text(theme.name.toUpperCase(), innerX, y + 3.5)

  const badgeText = structure.name
  const badgeW = doc.getTextWidth(badgeText) + 6
  const badgeX = cur.margin + cur.contentWidth - paddingH - badgeW
  withOpacity(doc, 0.1, () => {
    setFillColor(doc, hex(theme.color))
    doc.roundedRect(badgeX, y - 1, badgeW, 5.5, 1.2, 1.2, 'F')
  })
  setTextColor(doc, hex(theme.color))
  doc.text(badgeText, badgeX + 3, y + 3)
  y += themeRowH

  setFont(doc, 10, 'normal')
  setTextColor(doc, TEXT_BODY)
  for (const line of titleLines) {
    doc.text(line, innerX, y + titleLH * 0.7)
    y += titleLH
  }
  y += 2

  setFont(doc, 8.5, 'normal')
  setTextColor(doc, TEXT_SECONDARY)
  for (const group of channelLineGroups) {
    for (const line of group) {
      doc.text(line, innerX, y + channelLH * 0.75)
      y += channelLH
    }
  }

  cur.y = top + cardHeight + 4
}

function buildMatrix(doc: jsPDF, cur: Cursor, result: ContentOfficeResult) {
  setFont(doc, 20, 'normal')
  setTextColor(doc, TEXT_BODY)
  cur.ensureSpace(12)
  doc.text('Your content matrix', cur.margin, cur.y + 6)
  cur.addSpace(14)

  result.pillars.forEach((pillar, pi) => {
    setFont(doc, 13, 'normal')
    setTextColor(doc, TEXT_BODY)
    cur.ensureSpace(10)
    doc.text(sanitizeText(pillar.pillar), cur.margin, cur.y + 4)
    cur.addSpace(9)

    for (const cell of pillar.cells) {
      drawMatrixCell(doc, cur, cell)
    }

    if (pi < result.pillars.length - 1) cur.addSpace(2)
  })
}

// ── Section 3: starter sequence ──

function buildStarterSequence(doc: jsPDF, cur: Cursor, result: ContentOfficeResult) {
  setFont(doc, 20, 'normal')
  setTextColor(doc, TEXT_BODY)
  cur.ensureSpace(12)
  doc.text('Your starter sequence', cur.margin, cur.y + 6)
  cur.addSpace(14)

  result.starterSequence.forEach((post) => {
    setFont(doc, 8.5, 'normal')
    const metaText = `${post.pillar} - ${themeById(post.theme).name}`
    setFont(doc, 10, 'normal')
    const ideaLines: string[] = doc.splitTextToSize(sanitizeText(post.contentIdea), cur.contentWidth - 12)
    const blockHeight = 5 + ideaLines.length * mmPt(13) + 5

    cur.ensureSpace(blockHeight)
    const top = cur.y

    setFont(doc, 12, 'normal')
    setTextColor(doc, PRIMARY)
    doc.text(String(post.order), cur.margin, top + 5)

    setFont(doc, 8.5, 'normal')
    setTextColor(doc, TEXT_MUTED)
    doc.text(sanitizeText(metaText), cur.margin + 10, top + 4)

    setFont(doc, 10, 'normal')
    setTextColor(doc, TEXT_BODY)
    let ty = top + 9.5
    for (const line of ideaLines) {
      doc.text(line, cur.margin + 10, ty)
      ty += mmPt(13)
    }

    cur.y = top + blockHeight
    setDrawColor(doc, BORDER)
    doc.setLineWidth(0.15)
    doc.line(cur.margin, cur.y - 2, cur.pageWidth - cur.margin, cur.y - 2)
  })
  cur.addSpace(6)
}

// ── Sections 4-6: gaps, channel fit, rhythm ──

function buildAnalysisSection(doc: jsPDF, cur: Cursor, title: string, body: string, extraLines: string[]) {
  setFont(doc, 20, 'normal')
  setTextColor(doc, TEXT_BODY)
  cur.ensureSpace(12)
  doc.text(title, cur.margin, cur.y + 6)
  cur.addSpace(14)

  drawParagraph(doc, cur, body, { fontSize: 10, color: TEXT_SECONDARY, lineHeight: mmPt(14.5) })
  cur.addSpace(3)
  for (const line of extraLines) {
    drawParagraph(doc, cur, line, { fontSize: 9.5, color: TEXT_BODY, lineHeight: mmPt(13.5) })
  }
  cur.addSpace(6)
}

// ── Section 7: consulting bridges ──

function bridgeUrl(campaign: string): string {
  return `${CONTACT_URL}?utm_source=content-office&utm_medium=pdf&utm_campaign=${campaign}`
}

function buildConsultingBridge(doc: jsPDF, cur: Cursor, title: string, body: string, prompt: string, campaign: string) {
  cur.ensureSpace(16)
  setFont(doc, 8, 'normal')
  setTextColor(doc, PRIMARY)
  doc.text('CONSULTING BRIDGE', cur.margin, cur.y + 3.5)
  cur.addSpace(7)

  setFont(doc, 14, 'normal')
  setTextColor(doc, TEXT_BODY)
  doc.text(title, cur.margin, cur.y + 4)
  cur.addSpace(9)

  drawParagraph(doc, cur, body, { fontSize: 9.5, color: TEXT_SECONDARY, lineHeight: mmPt(14) })
  cur.addSpace(4)

  setFont(doc, 9, 'italic')
  const promptLines: string[] = doc.splitTextToSize(sanitizeText(prompt), cur.contentWidth - 10)
  const promptHeight = 6 + promptLines.length * mmPt(13) + 5
  cur.ensureSpace(promptHeight)
  const top = cur.y
  setFillColor(doc, SURFACE_SOFT)
  doc.rect(cur.margin, top, cur.contentWidth, promptHeight, 'F')
  setDrawColor(doc, PRIMARY)
  doc.setLineWidth(1)
  doc.line(cur.margin, top, cur.margin, top + promptHeight)

  setFont(doc, 9, 'italic')
  setTextColor(doc, TEXT_BODY)
  let py = top + 6
  for (const line of promptLines) {
    doc.text(line, cur.margin + 5, py)
    py += mmPt(13)
  }
  cur.y = top + promptHeight
  cur.addSpace(5)

  const btnText = 'Book a consulting session at jaydipsikdar.com/contact'
  setFont(doc, 10, 'normal')
  const btnW = doc.getTextWidth(btnText) + 14
  setFillColor(doc, PRIMARY)
  doc.roundedRect(cur.margin, cur.y, btnW, 9, 4.5, 4.5, 'F')
  setTextColor(doc, WHITE)
  doc.textWithLink(btnText, cur.margin + 7, cur.y + 6, { url: bridgeUrl(campaign) })
  cur.addSpace(15)
}

function joinList(items: string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

function buildBridges(doc: jsPDF, cur: Cursor, result: ContentOfficeResult) {
  const pillarNames = result.pillars.map((p) => p.pillar)
  const totalIdeas = result.pillars.length * 10

  buildConsultingBridge(
    doc,
    cur,
    'The missing pillar',
    sanitizeText(`Your ${pillarNames.length === 2 ? 'two' : 'three'} pillars cover ${joinList(pillarNames)}. ${result.gaps.missingPillarNote}`),
    'Want help identifying your fourth pillar and pressure-testing these? Set up a 60-minute conversation. Rs. 999.',
    'bridge-1'
  )
  cur.hr()
  cur.addSpace(10)

  buildConsultingBridge(
    doc,
    cur,
    'The prioritization question',
    `Your matrix gives you ${totalIdeas} content ideas. The question isn't what to create, it's what to skip. Prioritization depends on your sales cycle length, your current pipeline, and whether you're building an audience or converting one you already have.`,
    "If you want a second pair of eyes on which ideas to prioritize for your specific situation, I'm happy to walk through it. 60 minutes, Rs. 999.",
    'bridge-2'
  )
  cur.hr()
  cur.addSpace(10)

  buildConsultingBridge(
    doc,
    cur,
    'The system design',
    "A content system involves more than ideas. It's a workflow: ideation, creation, review, distribution, measurement. The right system depends on whether you're doing this solo, with a VA, or with a team.",
    "Some people take this matrix and run with it. Others want help designing the workflow around it. Set up a conversation and we'll build your content operating system together. 60 minutes, Rs. 999.",
    'bridge-3'
  )
}

// ── Footer ──

function buildFooter(doc: jsPDF, cur: Cursor) {
  cur.ensureSpace(50)
  cur.hr()
  cur.addSpace(8)

  setFont(doc, 11, 'normal')
  setTextColor(doc, TEXT_BODY)
  doc.text('Jaydeepp Sikdar', cur.pageWidth / 2, cur.y, { align: 'center' })
  cur.addSpace(6)

  setFont(doc, 9, 'normal')
  setTextColor(doc, TEXT_MUTED)
  doc.text('CMO turned builder', cur.pageWidth / 2, cur.y, { align: 'center' })
  cur.addSpace(8)

  const cardHeight = 24
  const top = cur.y
  setFillColor(doc, SURFACE_CREAM)
  doc.roundedRect(cur.margin, top, cur.contentWidth, cardHeight, 2, 2, 'F')
  setFont(doc, 10, 'normal')
  setTextColor(doc, TEXT_BODY)
  doc.text('Want to assess your full marketing maturity?', cur.pageWidth / 2, top + 9, { align: 'center' })
  setFont(doc, 9.5, 'normal')
  setTextColor(doc, PRIMARY)
  const linkText = 'Take the Marketing Maturity Score at jaydipsikdar.com/resources/marketing-maturity-score'
  doc.textWithLink(linkText, cur.pageWidth / 2 - doc.getTextWidth(linkText) / 2, top + 16, {
    url: 'https://www.jaydipsikdar.com/resources/marketing-maturity-score',
  })
  cur.y = top + cardHeight + 8

  setFont(doc, 8.5, 'normal')
  setTextColor(doc, TEXT_MUTED)
  const resourcesText =
    'Free diagnostic tools, decision frameworks, and resources for B2B marketing leaders, built from 20+ years across IBM, Adobe, MoEngage, and early-stage startups. Explore all resources at jaydipsikdar.com/resources.'
  const lines: string[] = doc.splitTextToSize(resourcesText, 130)
  for (const line of lines) {
    doc.text(line, cur.pageWidth / 2, cur.y, { align: 'center' })
    cur.addSpace(mmPt(12))
  }
}

function addPageFooters(doc: jsPDF) {
  const totalPages = (doc.internal as unknown as { getNumberOfPages(): number }).getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    setFont(doc, 7.5, 'normal')
    setTextColor(doc, TEXT_MUTED)
    doc.text(`Page ${i} of ${totalPages}`, 20, pageHeight - 10)
    doc.text('jaydipsikdar.com/resources/content-office', pageWidth - 20, pageHeight - 10, { align: 'right' })
  }
}

// ── Entry point ──

export function generateContentOfficePDF(result: ContentOfficeResult): Uint8Array {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const cur = new Cursor(doc)

  buildHeader(doc, cur, result)
  buildProfile(doc, cur, result)

  cur.newPage()
  buildMatrix(doc, cur, result)

  cur.newPage()
  buildStarterSequence(doc, cur, result)

  cur.newPage()
  buildAnalysisSection(doc, cur, 'Content gaps and opportunities', result.gaps.body, [
    `Themes you're probably underusing: ${joinList(result.gaps.underusedThemes.map((t) => themeById(t).name))}.`,
    `Structures worth trying: ${joinList(result.gaps.avoidedStructures.map((s) => structureById(s).name))}.`,
  ])
  buildAnalysisSection(doc, cur, 'Channel-content fit analysis', result.channelFit.body, [
    result.channelFit.mismatchedChannels.length > 0
      ? `Worth reconsidering: ${joinList(result.channelFit.mismatchedChannels.map((c) => channelById(c).name))}.`
      : '',
    `Themes that would perform on channels you're not using yet: ${joinList(result.channelFit.opportunityThemes.map((t) => themeById(t).name))}.`,
    result.channelFit.capacityNote,
  ].filter(Boolean))
  const cadenceSentence = result.rhythm.cadence.replace(/[.\s]+$/, '') + '.'
  buildAnalysisSection(doc, cur, 'Your content rhythm', `${cadenceSentence} ${result.rhythm.body}`, [result.rhythm.disclaimer])

  cur.newPage()
  buildBridges(doc, cur, result)
  buildFooter(doc, cur)

  addPageFooters(doc)

  return new Uint8Array(doc.output('arraybuffer'))
}
