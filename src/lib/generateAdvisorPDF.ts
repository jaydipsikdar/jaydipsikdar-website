import { jsPDF } from 'jspdf'
import type { AdvisorMove, MarketingAdvisorResult } from '@/components/AdvisorResults'
import type { MarketingCategory } from '@/components/CategorySelect'

type RGB = [number, number, number]
type FontStyle = 'normal' | 'bold' | 'italic'

// ── Colors (site brand palette: cream bg, dark text, orange accent) ──

function hex(h: string): RGB {
  const n = parseInt(h.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const DARK = hex('#1a1a1a')
const BODY_TEXT = hex('#333333')
const MUTED = hex('#777777')
const LIGHT_MUTED = hex('#999999')
const BORDER = hex('#e5e5e5')
const BG_LIGHT = hex('#fff8f0')
const ACCENT = hex('#e8450a')
const ACCENT_BG = hex('#fdeee8')
const AMBER_TEXT = hex('#b45309')
const AMBER_BG = hex('#fffbeb')
const AMBER_BORDER = hex('#fde68a')
const AMBER_BADGE = hex('#fbbf24')
const GRAY_BADGE = hex('#f3f4f6')
const WHITE: RGB = [255, 255, 255]

const CATEGORY_LABELS: Record<MarketingCategory, string> = {
  positioning: 'Positioning & Messaging',
  brand: 'Brand Strategy',
  'customer-growth': 'Customer Growth & Retention',
  'ai-marketing': 'AI for Marketing',
  launch: 'Launch & Go-to-Market',
}

function categoryLabel(category: MarketingCategory): string {
  return CATEGORY_LABELS[category] ?? category
}

// ── Text sanitization ──
// jsPDF's standard "helvetica" font only maps glyphs for WinAnsi (cp1252)
// encoding. Every string reaching jsPDF, including AI-generated content, is
// routed through here first. Mirrors generateVendorCheckPDF.ts.

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

function sanitizeMove(move: AdvisorMove): AdvisorMove {
  return {
    order: move.order,
    action: sanitizeText(move.action),
    why: sanitizeText(move.why),
    timeframe: sanitizeText(move.timeframe),
    lessonTag: sanitizeText(move.lessonTag),
  }
}

function sanitizeResult(result: MarketingAdvisorResult): MarketingAdvisorResult {
  return {
    category: result.category,
    userRole: sanitizeText(result.userRole),
    businessStage: sanitizeText(result.businessStage),
    primaryChallenge: sanitizeText(result.primaryChallenge),
    description: sanitizeText(result.description),
    diagnosis: sanitizeText(result.diagnosis),
    firstThingToFix: sanitizeText(result.firstThingToFix),
    moves: result.moves.map(sanitizeMove),
    whatWouldBreak: sanitizeText(result.whatWouldBreak),
    oneQuestion: sanitizeText(result.oneQuestion),
  }
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

// ── Icon badges ──
// Small hand-drawn vector icons (jsPDF primitives only — no icon fonts or
// unicode glyphs, so they render identically everywhere). Mirrors the
// icon set used on-screen in AdvisorIcons.tsx, simplified for print.

type IconKind = 'search' | 'target' | 'checklist' | 'alert' | 'question'

const BADGE_D = 6.5

function drawIconGlyph(doc: jsPDF, kind: IconKind, cx: number, cy: number, r: number, color: RGB) {
  setDrawColor(doc, color)
  doc.setLineWidth(0.5)
  if (kind === 'search') {
    const lensR = r * 0.5
    const lensCx = cx - r * 0.18
    const lensCy = cy - r * 0.18
    doc.circle(lensCx, lensCy, lensR, 'S')
    doc.line(lensCx + lensR * 0.75, lensCy + lensR * 0.75, cx + r * 0.55, cy + r * 0.55)
  } else if (kind === 'target') {
    doc.circle(cx, cy, r * 0.75, 'S')
    doc.circle(cx, cy, r * 0.4, 'S')
    setFillColor(doc, color)
    doc.circle(cx, cy, r * 0.14, 'F')
  } else if (kind === 'checklist') {
    const w = r * 1.15
    const startX = cx - w / 2
    for (const dy of [-r * 0.4, 0, r * 0.4]) {
      doc.line(startX, cy + dy, startX + w, cy + dy)
    }
  } else if (kind === 'alert') {
    const size = r * 1.25
    doc.triangle(cx, cy - size * 0.62, cx - size * 0.56, cy + size * 0.46, cx + size * 0.56, cy + size * 0.46, 'S')
    doc.line(cx, cy - size * 0.12, cx, cy + size * 0.12)
    setFillColor(doc, color)
    doc.circle(cx, cy + size * 0.32, 0.45, 'F')
  } else if (kind === 'question') {
    setFont(doc, r * 3, 'bold')
    setTextColor(doc, color)
    doc.text('?', cx, cy + r * 0.45, { align: 'center' })
  }
}

function drawIconHeading(
  doc: jsPDF,
  cur: Cursor,
  opts: { icon: IconKind; badgeBg: RGB; iconColor: RGB; text: string; fontSize: number; textColor: RGB; lineHeight: number }
) {
  const rowHeight = Math.max(BADGE_D, opts.lineHeight)
  cur.ensureSpace(rowHeight)
  const topY = cur.y
  const cx = cur.margin + BADGE_D / 2
  const cy = topY + BADGE_D / 2

  setFillColor(doc, opts.badgeBg)
  doc.circle(cx, cy, BADGE_D / 2, 'F')
  drawIconGlyph(doc, opts.icon, cx, cy, BADGE_D / 2 * 0.62, opts.iconColor)

  setFont(doc, opts.fontSize, 'bold')
  setTextColor(doc, opts.textColor)
  doc.text(opts.text, cur.margin + BADGE_D + 3, cy + opts.fontSize * 0.14)

  cur.y = topY + rowHeight
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
  | {
      kind: 'iconHeading'
      icon: IconKind
      badgeBg: RGB
      iconColor: RGB
      text: string
      fontSize: number
      textColor: RGB
      lineHeight: number
      spaceBefore?: number
    }
  | {
      kind: 'pill'
      text: string
      fontSize: number
      textColor: RGB
      bgColor: RGB
      lineHeight: number
      paddingH: number
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
        h += item.lineHeight
        const wrapped = doc.splitTextToSize(item.text, innerWidth)
        h += wrapped.length * item.lineHeight
      }
    } else if (item.kind === 'iconHeading') {
      h += Math.max(BADGE_D, item.lineHeight)
    } else if (item.kind === 'pill') {
      h += item.lineHeight
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
    } else if (item.kind === 'iconHeading') {
      const rowHeight = Math.max(BADGE_D, item.lineHeight)
      const cx = x + BADGE_D / 2
      const cy = y + BADGE_D / 2
      setFillColor(doc, item.badgeBg)
      doc.circle(cx, cy, BADGE_D / 2, 'F')
      drawIconGlyph(doc, item.icon, cx, cy, (BADGE_D / 2) * 0.62, item.iconColor)
      setFont(doc, item.fontSize, 'bold')
      setTextColor(doc, item.textColor)
      doc.text(item.text, x + BADGE_D + 3, cy + item.fontSize * 0.14)
      y += rowHeight
    } else if (item.kind === 'pill') {
      const textWidth = doc.getTextWidth(item.text)
      const pillWidth = Math.min(textWidth + item.paddingH * 2, innerWidth)
      const pillHeight = item.lineHeight - 1
      setFillColor(doc, item.bgColor)
      doc.roundedRect(x, y, pillWidth, pillHeight, pillHeight / 2, pillHeight / 2, 'F')
      setFont(doc, item.fontSize, 'bold')
      setTextColor(doc, item.textColor)
      doc.text(item.text, x + item.paddingH, y + pillHeight * 0.68)
      y += item.lineHeight
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
  doc.text('Marketing Decision Advisor Report', cur.margin, cur.y + titleLineHeight * 0.75)

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

// ── Page 1: category badge + context ──

function buildContextSection(doc: jsPDF, cur: Cursor, result: MarketingAdvisorResult) {
  cur.addSpace(5)

  const badgeText = categoryLabel(result.category)
  setFont(doc, 9, 'bold')
  const badgePaddingH = 3.5
  const badgeHeight = 7
  const badgeWidth = doc.getTextWidth(badgeText) + badgePaddingH * 2
  setFillColor(doc, ACCENT)
  doc.roundedRect(cur.margin, cur.y, badgeWidth, badgeHeight, badgeHeight / 2, badgeHeight / 2, 'F')
  setTextColor(doc, [255, 255, 255])
  doc.text(badgeText, cur.margin + badgePaddingH, cur.y + badgeHeight * 0.68)
  cur.addSpace(badgeHeight + 3)

  drawParagraph(doc, cur, `${result.userRole} · ${result.businessStage}`, {
    fontSize: 9,
    color: MUTED,
    lineHeight: mmPt(12),
  })

  cur.addSpace(3)
  cur.hr()
}

// ── Page 1: diagnosis + first thing to fix ──

function buildDiagnosisSection(doc: jsPDF, cur: Cursor, result: MarketingAdvisorResult) {
  cur.addSpace(4)
  drawIconHeading(doc, cur, {
    icon: 'search',
    badgeBg: GRAY_BADGE,
    iconColor: MUTED,
    text: 'Diagnosis',
    fontSize: 12,
    textColor: DARK,
    lineHeight: mmPt(16),
  })
  cur.addSpace(2)
  drawParagraph(doc, cur, result.diagnosis, {
    fontSize: 9.5,
    color: BODY_TEXT,
    lineHeight: mmPt(14),
  })

  cur.addSpace(5)

  const items: CardItem[] = [
    {
      kind: 'iconHeading',
      icon: 'target',
      badgeBg: ACCENT,
      iconColor: WHITE,
      text: 'The First Thing to Fix',
      fontSize: 11,
      textColor: DARK,
      lineHeight: mmPt(14),
    },
    {
      kind: 'text',
      text: result.firstThingToFix,
      fontSize: 9.5,
      color: BODY_TEXT,
      lineHeight: mmPt(14),
      spaceBefore: 2,
    },
  ]
  drawCard(doc, cur, items, { bg: ACCENT_BG, border: ACCENT, paddingH: 4, paddingV: 3.5 })

  cur.addSpace(6)
  cur.hr()
}

// ── Page 1: one question to sit with ──

function buildOneQuestion(doc: jsPDF, cur: Cursor, result: MarketingAdvisorResult) {
  cur.addSpace(5)

  const iconR = 3.4
  cur.ensureSpace(iconR * 2)
  setFillColor(doc, ACCENT_BG)
  doc.circle(cur.pageWidth / 2, cur.y + iconR, iconR, 'F')
  drawIconGlyph(doc, 'question', cur.pageWidth / 2, cur.y + iconR, iconR * 0.62, ACCENT)
  cur.addSpace(iconR * 2 + 2)

  drawParagraph(doc, cur, 'ONE QUESTION TO SIT WITH', {
    fontSize: 8,
    style: 'bold',
    color: MUTED,
    lineHeight: mmPt(10),
    align: 'center',
  })
  cur.addSpace(2)
  drawParagraph(doc, cur, result.oneQuestion, {
    fontSize: 12,
    style: 'italic',
    color: DARK,
    lineHeight: mmPt(16),
    align: 'center',
  })
}

// ── Detailed moves (flows onto page 2+ only as content overflows) ──

function buildMovesPages(doc: jsPDF, cur: Cursor, result: MarketingAdvisorResult) {
  cur.addSpace(6)
  cur.hr()
  cur.addSpace(6)

  drawIconHeading(doc, cur, {
    icon: 'checklist',
    badgeBg: ACCENT,
    iconColor: WHITE,
    text: 'Your Moves',
    fontSize: 14,
    textColor: DARK,
    lineHeight: mmPt(18),
  })
  cur.addSpace(2.8)

  for (const move of result.moves) {
    cur.addSpace(4)
    buildMoveCard(doc, cur, move)
  }

  cur.addSpace(6)
  cur.hr()
  cur.addSpace(4)

  const items: CardItem[] = [
    {
      kind: 'iconHeading',
      icon: 'alert',
      badgeBg: AMBER_BADGE,
      iconColor: WHITE,
      text: 'What Would Break This',
      fontSize: 11,
      textColor: DARK,
      lineHeight: mmPt(14),
    },
    {
      kind: 'text',
      text: result.whatWouldBreak,
      fontSize: 9.5,
      color: BODY_TEXT,
      lineHeight: mmPt(14),
      spaceBefore: 2,
    },
  ]
  drawCard(doc, cur, items, { bg: AMBER_BG, border: AMBER_BORDER, paddingH: 4, paddingV: 3.5 })
}

function buildMoveCard(doc: jsPDF, cur: Cursor, move: AdvisorMove) {
  const items: CardItem[] = [
    {
      kind: 'row',
      left: { text: `Move ${move.order}`, fontSize: 8.5, style: 'bold', color: MUTED },
      right: { text: move.timeframe, fontSize: 8.5, style: 'bold', color: ACCENT },
      lineHeight: mmPt(11),
    },
    {
      kind: 'text',
      text: move.action,
      fontSize: 10.5,
      style: 'bold',
      color: DARK,
      lineHeight: mmPt(14),
      spaceBefore: 1,
    },
    {
      kind: 'pill',
      text: move.lessonTag,
      fontSize: 7.5,
      textColor: ACCENT,
      bgColor: ACCENT_BG,
      lineHeight: mmPt(11),
      paddingH: 2.2,
      spaceBefore: 1.6,
    },
    {
      kind: 'mixed',
      boldPrefix: 'Why: ',
      text: move.why,
      fontSize: 9,
      color: BODY_TEXT,
      lineHeight: mmPt(13),
      spaceBefore: 1.6,
    },
  ]
  drawCard(doc, cur, items, { bg: undefined, border: BORDER, paddingH: 3.5, paddingV: 3 })
  cur.addSpace(3)
}

// ── Final CTA ──

function buildCTA(doc: jsPDF, cur: Cursor) {
  cur.addSpace(8)

  const paddingV = 3.5

  const headingText = 'Want to talk through this?'
  const linkText = 'Visit jaydipsikdar.com/contact'

  const headingLH = mmPt(14)
  const linkLH = mmPt(14)
  const height = paddingV * 2 + headingLH + 1.4 + linkLH

  cur.ensureSpace(height)
  const top = cur.y

  setFillColor(doc, BG_LIGHT)
  setDrawColor(doc, ACCENT)
  doc.setLineWidth(0.35)
  doc.roundedRect(cur.margin, top, cur.contentWidth, height, 1.5, 1.5, 'FD')

  let y = top + paddingV
  setFont(doc, 11, 'bold')
  setTextColor(doc, DARK)
  doc.text(headingText, cur.pageWidth / 2, y + headingLH * 0.75, { align: 'center' })
  y += headingLH + 1.4

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
    doc.text('jaydipsikdar.com', margin, textY)
    doc.text(
      'AI-assisted analysis built from 213 operator lessons, 21 CMO interviews. Not a substitute for professional advice.',
      pageWidth - margin,
      textY,
      { align: 'right' }
    )
  }
}

// ── Entry point ──

export function generateAdvisorPDF(rawResult: MarketingAdvisorResult): Uint8Array {
  const result = sanitizeResult(rawResult)

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const cur = new Cursor(doc)

  buildHeader(doc, cur)
  buildContextSection(doc, cur, result)
  buildDiagnosisSection(doc, cur, result)
  buildOneQuestion(doc, cur, result)
  buildMovesPages(doc, cur, result)
  buildCTA(doc, cur)
  drawFooters(doc)

  return new Uint8Array(doc.output('arraybuffer'))
}
