import { jsPDF } from 'jspdf'
import type { VendorCheckParameter, VendorCheckResult } from '@/components/ResultsReport'

type RGB = [number, number, number]
type FontStyle = 'normal' | 'bold' | 'italic'

// ── Colors (mirrors the color system in ResultsReport.tsx / the approved PDF prototype) ──

function hex(h: string): RGB {
  const n = parseInt(h.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const DARK = hex('#1a1a1a')
const BODY_TEXT = hex('#333333')
const MUTED = hex('#777777')
const LIGHT_MUTED = hex('#999999')
const BORDER = hex('#e5e5e5')
const BG_LIGHT = hex('#f9f9f9')
const BAR_BG = hex('#e8e8e8')

const RED = hex('#dc2626')
const RED_TEXT = hex('#b91c1c')
const RED_BG = hex('#fef2f2')
const RED_BORDER = hex('#fecaca')
const AMBER = hex('#d97706')
const AMBER_TEXT = hex('#b45309')
const AMBER_BG = hex('#fffbeb')
const AMBER_BORDER = hex('#fde68a')
const GREEN = hex('#16a34a')
const GREEN_TEXT = hex('#15803d')
const GREEN_BG = hex('#f0fdf4')
const GREEN_BORDER = hex('#bbf7d0')
const ACCENT = hex('#2563eb')

// ── Score helpers (same thresholds as ResultsReport.tsx) ──

function getScoreColor(score: number, maxScore = 100): RGB {
  const pct = (score / maxScore) * 100
  if (pct >= 80) return GREEN
  if (pct >= 60) return AMBER
  if (pct >= 40) return AMBER
  return RED
}

function getScoreTextColor(score: number, maxScore = 100): RGB {
  const pct = (score / maxScore) * 100
  if (pct >= 80) return GREEN_TEXT
  if (pct >= 60) return AMBER_TEXT
  if (pct >= 40) return AMBER_TEXT
  return RED_TEXT
}

function getRiskColors(riskLevel: string): { text: RGB; bg: RGB; border: RGB } {
  switch (riskLevel) {
    case 'Strong':
      return { text: GREEN_TEXT, bg: GREEN_BG, border: GREEN_BORDER }
    case 'Moderate':
    case 'Weak':
      return { text: AMBER_TEXT, bg: AMBER_BG, border: AMBER_BORDER }
    default:
      return { text: RED_TEXT, bg: RED_BG, border: RED_BORDER }
  }
}

function priorityHeading(processStage?: string): string {
  if (processStage === 'Already signed, checking what I agreed to') {
    return 'Your top 3 priorities for renegotiation'
  }
  if (processStage === 'Renewing or renegotiating') {
    return 'Your top 3 priorities for this renewal'
  }
  return 'Your top 3 priorities before signing'
}

// ── Text sanitization ──
// jsPDF's standard "helvetica" font only maps glyphs for WinAnsi (cp1252)
// encoding. Any character outside that set — most notably ₹ — has no defined
// glyph width, which corrupts jsPDF's cumulative width calculation inside
// splitTextToSize and produces lines that overrun the page edge instead of
// wrapping (visually indistinguishable from mid-sentence truncation). Every
// string that reaches jsPDF, including AI-generated content, is routed
// through here first.

const CP1252_EXTRA: Record<number, string> = {
  0x80: '€', 0x82: '‚', 0x83: 'ƒ', 0x84: '„', 0x85: '…',
  0x86: '†', 0x87: '‡', 0x88: 'ˆ', 0x89: '‰', 0x8A: 'Š',
  0x8B: '‹', 0x8C: 'Œ', 0x8E: 'Ž', 0x91: '‘', 0x92: '’',
  0x93: '“', 0x94: '”', 0x95: '•', 0x96: '–', 0x97: '—',
  0x98: '˜', 0x99: '™', 0x9A: 'š', 0x9B: '›', 0x9C: 'œ',
  0x9E: 'ž', 0x9F: 'Ÿ',
}

const WINANSI_CODEPOINTS = new Set<number>([
  ...Array.from({ length: 0x80 }, (_, i) => i), // 0x00–0x7F ASCII
  ...Object.values(CP1252_EXTRA).map((c) => c.codePointAt(0)!),
  ...Array.from({ length: 0x60 }, (_, i) => 0xa0 + i), // 0xA0–0xFF Latin-1 supplement
])

// Explicit replacements for characters commonly produced by AI-generated
// contract analysis that fall outside WinAnsi.
const CHAR_REPLACEMENTS: Record<string, string> = {
  '₹': 'Rs. ', // ₹ Indian Rupee sign
  '→': '->', // →
  '←': '<-', // ←
  '‑': '-', // non-breaking hyphen
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

function sanitizeParameter(param: VendorCheckParameter): VendorCheckParameter {
  return {
    name: sanitizeText(param.name),
    score: param.score,
    whatItSays: sanitizeText(param.whatItSays),
    whyItMatters: sanitizeText(param.whyItMatters),
    whatToPropose: sanitizeText(param.whatToPropose),
    redFlags: (param.redFlags ?? []).map(sanitizeText),
    greenFlags: param.greenFlags ? param.greenFlags.map(sanitizeText) : param.greenFlags,
  }
}

function sanitizeResult(result: VendorCheckResult): VendorCheckResult {
  return {
    overallScore: result.overallScore,
    riskLevel: sanitizeText(result.riskLevel),
    verdict: sanitizeText(result.verdict),
    vendorTypeDisclaimer: result.vendorTypeDisclaimer ? sanitizeText(result.vendorTypeDisclaimer) : result.vendorTypeDisclaimer,
    parameters: result.parameters.map(sanitizeParameter),
    topPriorities: result.topPriorities.map(sanitizeText),
  }
}

// ── Layout ──

const PT = 0.3528 // mm per point — used to convert reportlab-style leading values to mm
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

/** Draws a wrapped paragraph, breaking across pages as needed. Returns nothing — advances cur.y. */
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
  const lines: string[] = doc.splitTextToSize(text, maxWidth)
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

function progressBar(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  pct: number,
  fillColorRgb: RGB
) {
  const r = height / 2
  setFillColor(doc, BAR_BG)
  doc.roundedRect(x, y, width, height, r, r, 'F')
  const fillWidth = Math.max(height, (Math.max(0, Math.min(100, pct)) / 100) * width)
  setFillColor(doc, fillColorRgb)
  doc.roundedRect(x, y, fillWidth, height, r, r, 'F')
}

// ── Card building blocks (used for key finding cards + detail parameter cards) ──

type CardItem =
  | { kind: 'text'; text: string; fontSize: number; style?: FontStyle; color: RGB; lineHeight: number; spaceBefore?: number }
  | {
      kind: 'row'
      left: { text: string; fontSize: number; style?: FontStyle; color: RGB }
      right: { text: string; fontSize: number; style?: FontStyle; color: RGB }
      lineHeight: number
      spaceBefore?: number
    }
  | {
      kind: 'mixed'
      boldPrefix: string
      text: string
      fontSize: number
      color: RGB
      lineHeight: number
      spaceBefore?: number
    }
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
      const lines = doc.splitTextToSize(item.text, innerWidth)
      h += lines.length * item.lineHeight
    } else if (item.kind === 'row') {
      h += item.lineHeight
    } else if (item.kind === 'mixed') {
      setFont(doc, item.fontSize, 'bold')
      const boldWidth = doc.getTextWidth(item.boldPrefix)
      setFont(doc, item.fontSize, 'normal')
      const fitsOneLine = boldWidth + doc.getTextWidth(item.text) <= innerWidth
      if (fitsOneLine) {
        h += item.lineHeight
      } else {
        h += item.lineHeight // bold prefix line
        const wrapped = doc.splitTextToSize(item.text, innerWidth)
        h += wrapped.length * item.lineHeight
      }
    }
  }
  return h
}

function drawCardItems(doc: jsPDF, items: CardItem[], x: number, startY: number, innerWidth: number): number {
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
      const lines = doc.splitTextToSize(item.text, innerWidth)
      for (const line of lines) {
        doc.text(line, x, y + item.lineHeight * 0.75)
        y += item.lineHeight
      }
    } else if (item.kind === 'row') {
      setFont(doc, item.left.fontSize, item.left.style ?? 'normal')
      setTextColor(doc, item.left.color)
      doc.text(item.left.text, x, y + item.lineHeight * 0.75)
      setFont(doc, item.right.fontSize, item.right.style ?? 'normal')
      setTextColor(doc, item.right.color)
      doc.text(item.right.text, x + innerWidth, y + item.lineHeight * 0.75, { align: 'right' })
      y += item.lineHeight
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
        doc.text(item.text, x + boldWidth, y + item.lineHeight * 0.75)
        y += item.lineHeight
      } else {
        setFont(doc, item.fontSize, 'bold')
        doc.text(item.boldPrefix.trim(), x, y + item.lineHeight * 0.75)
        y += item.lineHeight
        setFont(doc, item.fontSize, 'normal')
        const wrapped = doc.splitTextToSize(item.text, innerWidth)
        for (const line of wrapped) {
          doc.text(line, x, y + item.lineHeight * 0.75)
          y += item.lineHeight
        }
      }
    }
  }
  return y
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

// ── Header (page 1 only) ──

function buildHeader(doc: jsPDF, cur: Cursor) {
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
  const titleLineHeight = mmPt(20)
  setFont(doc, 16, 'bold')
  setTextColor(doc, DARK)
  doc.text('Vendor contract check', cur.margin, cur.y + titleLineHeight * 0.75)

  setFont(doc, 9, 'normal')
  setTextColor(doc, MUTED)
  doc.text(today, cur.pageWidth - cur.margin, cur.y + titleLineHeight * 0.6, { align: 'right' })
  cur.y += titleLineHeight

  const subtitleLineHeight = mmPt(12)
  doc.text('jaydipsikdar.com', cur.margin, cur.y + subtitleLineHeight * 0.75)
  cur.y += subtitleLineHeight

  cur.addSpace(3)
  cur.hr()
}

// ── Page 1: score section ──

function buildScoreSection(doc: jsPDF, cur: Cursor, result: VendorCheckResult) {
  cur.addSpace(5)

  drawParagraph(doc, cur, 'OVERALL RISK SCORE', {
    fontSize: 8,
    style: 'bold',
    color: MUTED,
    lineHeight: mmPt(10),
  })
  cur.addSpace(2)

  const scoreColor = getScoreColor(result.overallScore)
  const risk = getRiskColors(result.riskLevel)
  const scoreRowHeight = mmPt(32)
  const scoreRowTop = cur.y

  setFont(doc, 28, 'bold')
  setTextColor(doc, scoreColor)
  doc.text(String(result.overallScore), cur.margin, scoreRowTop + scoreRowHeight * 0.75)
  const scoreWidth = doc.getTextWidth(String(result.overallScore))

  setFont(doc, 14, 'normal')
  setTextColor(doc, MUTED)
  doc.text(' / 100', cur.margin + scoreWidth, scoreRowTop + scoreRowHeight * 0.68)

  // Risk badge pill
  const badgeWidth = 21
  const badgeHeight = 7
  const badgeX = cur.margin + 47
  const badgeY = scoreRowTop + (scoreRowHeight - badgeHeight) / 2
  setFillColor(doc, risk.bg)
  setDrawColor(doc, risk.border)
  doc.setLineWidth(0.18)
  doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, badgeHeight / 2, badgeHeight / 2, 'FD')
  setFont(doc, 8, 'bold')
  setTextColor(doc, risk.text)
  doc.text(result.riskLevel, badgeX + badgeWidth / 2, badgeY + badgeHeight * 0.68, { align: 'center' })

  cur.y = scoreRowTop + scoreRowHeight
  cur.addSpace(1)

  // Progress bar
  progressBar(doc, cur.margin, cur.y, cur.contentWidth, mmPt(8), result.overallScore, scoreColor)
  cur.addSpace(mmPt(8) + 2)

  drawParagraph(doc, cur, '0 = maximum risk  ·  100 = fully protected', {
    fontSize: 8,
    color: LIGHT_MUTED,
    lineHeight: mmPt(10),
  })
  cur.addSpace(4)

  drawParagraph(doc, cur, result.verdict, {
    fontSize: 9.5,
    color: BODY_TEXT,
    lineHeight: mmPt(14),
  })

  if (result.vendorTypeDisclaimer) {
    cur.addSpace(2)
    drawParagraph(doc, cur, result.vendorTypeDisclaimer, {
      fontSize: 8,
      style: 'italic',
      color: LIGHT_MUTED,
      lineHeight: mmPt(10),
    })
  }

  cur.addSpace(4)
  cur.hr()
}

// ── Page 1: parameter breakdown bars ──

function buildParameterBars(doc: jsPDF, cur: Cursor, result: VendorCheckResult) {
  cur.addSpace(4)
  drawParagraph(doc, cur, 'Parameter breakdown', {
    fontSize: 12,
    style: 'bold',
    color: DARK,
    lineHeight: mmPt(16),
  })

  const barWidth = 45
  const scoreColWidth = 12
  const rowHeight = 8

  for (const param of result.parameters) {
    cur.ensureSpace(rowHeight)
    const color = getScoreTextColor(param.score, 20)
    const rowTop = cur.y

    setFont(doc, 9.5, 'normal')
    setTextColor(doc, BODY_TEXT)
    doc.text(param.name, cur.margin, rowTop + rowHeight * 0.6)

    const barX = cur.pageWidth - cur.margin - scoreColWidth - 4 - barWidth
    progressBar(doc, barX, rowTop + (rowHeight - mmPt(6)) / 2, barWidth, mmPt(6), (param.score / 20) * 100, color)

    setFont(doc, 9.5, 'bold')
    setTextColor(doc, color)
    doc.text(String(param.score), cur.pageWidth - cur.margin, rowTop + rowHeight * 0.6, { align: 'right' })

    cur.y = rowTop + rowHeight
  }

  cur.addSpace(4)
  cur.hr()
}

// ── Page 1: key findings ──

function buildKeyFindings(doc: jsPDF, cur: Cursor, result: VendorCheckResult) {
  cur.addSpace(4)
  drawParagraph(doc, cur, 'Key findings', {
    fontSize: 12,
    style: 'bold',
    color: DARK,
    lineHeight: mmPt(16),
  })

  const params = result.parameters
  const findings: { type: 'red' | 'amber' | 'green'; paramName: string; text: string }[] = []

  const sortedAsc = [...params].sort((a, b) => a.score - b.score)
  for (const param of sortedAsc) {
    if (param.score <= 8 && param.redFlags?.length) {
      findings.push({ type: 'red', paramName: param.name, text: param.redFlags[0] })
      break
    }
  }
  for (const param of sortedAsc) {
    if (param.score > 8 && param.score <= 12 && param.redFlags?.length) {
      findings.push({ type: 'amber', paramName: param.name, text: param.redFlags[0] })
      break
    }
  }
  const sortedDesc = [...params].sort((a, b) => b.score - a.score)
  for (const param of sortedDesc) {
    if (param.score >= 12 && param.greenFlags?.length) {
      findings.push({ type: 'green', paramName: param.name, text: param.greenFlags[0] })
      break
    }
  }

  for (const finding of findings) {
    const styleFor = {
      red: { label: 'Red flag', icon: '•', color: RED_TEXT, bg: RED_BG, border: RED_BORDER },
      amber: { label: 'Watch out', icon: '•', color: AMBER_TEXT, bg: AMBER_BG, border: AMBER_BORDER },
      green: { label: 'Looks good', icon: '•', color: GREEN_TEXT, bg: GREEN_BG, border: GREEN_BORDER },
    }[finding.type]

    const items: CardItem[] = [
      {
        kind: 'text',
        text: `${styleFor.icon}  ${styleFor.label}`,
        fontSize: 8.5,
        style: 'bold',
        color: styleFor.color,
        lineHeight: mmPt(11),
      },
      {
        kind: 'mixed',
        boldPrefix: `${finding.paramName}: `,
        text: finding.text,
        fontSize: 9,
        color: BODY_TEXT,
        lineHeight: mmPt(13),
        spaceBefore: 0.7,
      },
    ]

    drawCard(doc, cur, items, { bg: styleFor.bg, border: styleFor.border, paddingH: 3.5, paddingV: 2.8 })
    cur.addSpace(2.5)
  }
}

// ── Page 2+: detailed analysis ──

function buildDetailPages(doc: jsPDF, cur: Cursor, result: VendorCheckResult) {
  doc.addPage()
  cur.y = cur.margin

  setFont(doc, 14, 'bold')
  setTextColor(doc, DARK)
  doc.text('Detailed analysis', cur.margin, cur.y + mmPt(18) * 0.75)
  cur.y += mmPt(18) + 2.8

  for (const param of result.parameters) {
    cur.addSpace(4)
    buildDetailCard(doc, cur, param)
  }
}

function buildDetailCard(doc: jsPDF, cur: Cursor, param: VendorCheckParameter) {
  const scoreColor = getScoreTextColor(param.score, 20)
  const items: CardItem[] = [
    {
      kind: 'row',
      left: { text: param.name, fontSize: 11, style: 'bold', color: DARK },
      right: { text: `${param.score} / 20`, fontSize: 9.5, style: 'bold', color: scoreColor },
      lineHeight: mmPt(14),
    },
  ]

  for (const flag of param.redFlags ?? []) {
    if (!flag.trim()) continue
    items.push({
      kind: 'text',
      text: `• ${flag}`,
      fontSize: 8.5,
      color: RED_TEXT,
      lineHeight: mmPt(11),
    })
  }
  for (const flag of param.greenFlags ?? []) {
    if (!flag.trim()) continue
    items.push({
      kind: 'text',
      text: `• ${flag}`,
      fontSize: 8.5,
      color: GREEN_TEXT,
      lineHeight: mmPt(11),
    })
  }

  const fields: [string, string][] = [
    ['What your contract currently says:', param.whatItSays],
    ['Why this matters:', param.whyItMatters],
    ['What to propose instead:', param.whatToPropose],
  ]
  let first = true
  for (const [label, body] of fields) {
    items.push({
      kind: 'text',
      text: label,
      fontSize: 9,
      style: 'bold',
      color: BODY_TEXT,
      lineHeight: mmPt(12),
      spaceBefore: first ? 2 : 2.1,
    })
    items.push({
      kind: 'text',
      text: body,
      fontSize: 9,
      color: BODY_TEXT,
      lineHeight: mmPt(13),
      spaceBefore: 0.7,
    })
    first = false
  }

  drawCard(doc, cur, items, { bg: undefined, border: BORDER, paddingH: 2.8, paddingV: 2.8 })
}

// ── Priorities + CTA ──

function buildPriorities(doc: jsPDF, cur: Cursor, result: VendorCheckResult, processStage?: string) {
  cur.addSpace(6)
  cur.hr()
  cur.addSpace(4)

  drawParagraph(doc, cur, priorityHeading(processStage), {
    fontSize: 12,
    style: 'bold',
    color: DARK,
    lineHeight: mmPt(16),
    align: 'center',
    maxWidth: cur.contentWidth,
  })
  cur.addSpace(3)

  result.topPriorities.forEach((priority, i) => {
    drawParagraph(doc, cur, `${i + 1}. ${priority}`, {
      fontSize: 9.5,
      color: BODY_TEXT,
      lineHeight: mmPt(14),
    })
    cur.addSpace(1.4)
  })
}

function buildCTA(doc: jsPDF, cur: Cursor) {
  cur.addSpace(8)

  const paddingH = 4.2
  const paddingV = 3.5
  const innerWidth = cur.contentWidth - paddingH * 2

  const headingText = "Talk to someone who's reviewed 50+ vendor contracts"
  const bodyText =
    "Book a 30-minute conversation with Jaydip Sikdar. Walk through the specific clauses in your contract, hear what he's seen work across similar deals, and decide your next move. This is experience-sharing, not legal advice."
  const linkText = 'Rs. 999  ·  Book at jaydipsikdar.com'

  setFont(doc, 11, 'bold')
  const headingLines: string[] = doc.splitTextToSize(headingText, innerWidth)
  setFont(doc, 9, 'normal')
  const bodyLines: string[] = doc.splitTextToSize(bodyText, innerWidth)

  const headingLH = mmPt(14)
  const bodyLH = mmPt(13)
  const linkLH = mmPt(14)

  const height =
    paddingV * 2 + headingLines.length * headingLH + 1.4 + bodyLines.length * bodyLH + 2.1 + linkLH

  cur.ensureSpace(height)
  const top = cur.y

  setFillColor(doc, BG_LIGHT)
  setDrawColor(doc, ACCENT)
  doc.setLineWidth(0.35)
  doc.roundedRect(cur.margin, top, cur.contentWidth, height, 1.5, 1.5, 'FD')

  let y = top + paddingV
  setFont(doc, 11, 'bold')
  setTextColor(doc, DARK)
  for (const line of headingLines) {
    doc.text(line, cur.pageWidth / 2, y + headingLH * 0.75, { align: 'center' })
    y += headingLH
  }

  y += 1.4
  setFont(doc, 9, 'normal')
  setTextColor(doc, MUTED)
  for (const line of bodyLines) {
    doc.text(line, cur.pageWidth / 2, y + bodyLH * 0.75, { align: 'center' })
    y += bodyLH
  }

  y += 2.1
  setFont(doc, 10, 'bold')
  setTextColor(doc, ACCENT)
  const linkWidth = doc.getTextWidth(linkText)
  const linkX = cur.pageWidth / 2 - linkWidth / 2
  doc.textWithLink(linkText, linkX, y + linkLH * 0.75, { url: 'https://www.jaydipsikdar.com/contact' })

  cur.y = top + height
}

// ── Footer (every page) ──

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
    doc.text('AI-assisted analysis, not legal advice.', pageWidth - margin, textY, { align: 'right' })
  }
}

// ── Entry point ──
// Server-side only: builds the PDF and returns its bytes. Callers (the
// /api/export-pdf route) are responsible for storage/delivery — this
// function has no browser dependency.

export function generateVendorCheckPDF(rawResult: VendorCheckResult, processStage?: string): Uint8Array {
  const result = sanitizeResult(rawResult)

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const cur = new Cursor(doc)

  buildHeader(doc, cur)
  buildScoreSection(doc, cur, result)
  buildParameterBars(doc, cur, result)
  buildKeyFindings(doc, cur, result)
  buildDetailPages(doc, cur, result)
  buildPriorities(doc, cur, result, processStage)
  buildCTA(doc, cur)
  drawFooters(doc)

  return new Uint8Array(doc.output('arraybuffer'))
}
