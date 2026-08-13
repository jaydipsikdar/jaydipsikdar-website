import { jsPDF } from 'jspdf'
import {
  DIMENSIONS,
  ROLE_LANGUAGE,
  BOOTSTRAPPED_NOTES,
  STAGE_OPTIONS,
  ROLE_OPTIONS,
  FUNDING_OPTIONS,
  AI_WORKFLOWS,
  AI_STAGE_DEFINITION,
  tierForScore,
  dimensionById,
  type Qualifiers,
  type AIStageId,
} from './maturityScoreData'
import {
  WHAT_THIS_MEANS,
  RECOMMENDATION,
  benchmarkParagraph,
  ninetyDayPriorities,
  overallAssessment,
  aiReadinessPatternSummary,
  resourceGapBridge,
  strategicSequencingBridge,
  aiIntegrationMapBridge,
} from './maturityScoreReportContent'
import {
  estimateAIWorkflowAdoption,
  type DimensionScore,
  type AIAnswers,
  type AIWorkflowEstimate,
} from './maturityScoring'
import type { AIStage } from './maturityScoreData'

type RGB = [number, number, number]
type FontStyle = 'normal' | 'bold' | 'italic'

export interface MaturityScorePDFInput {
  qualifiers: Qualifiers
  dimensionScores: DimensionScore[]
  overallScore: number
  weakest: DimensionScore[]
  aiAnswers: AIAnswers
  aiReadinessScore: number
  aiReadinessStage: AIStage
}

// ── Colors (source of truth: 00-context/maturity-score-sample-report.html) ──

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
const PRIMARY_HOVER = hex('#cc3a07')
const PRIMARY_SUBTLE = hex('#ffd8c4')
const WHITE: RGB = [255, 255, 255]

// AI readiness heatmap columns, left to right (used for cell index lookup).
const AI_STAGE_ORDER: AIStageId[] = ['unaware', 'experimenting', 'functional', 'integrated']
const AI_STAGE_COLUMN_OPACITY: Record<AIStageId, number> = {
  unaware: 0.15,
  experimenting: 0.35,
  functional: 0.6,
  integrated: 0.85,
}

// ── Text sanitization (mirrors generateAdvisorPDF.ts / generateVendorCheckPDF.ts) ──

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
    if (CHAR_REPLACEMENTS[ch]) {
      out += CHAR_REPLACEMENTS[ch]
    } else if (code <= WINANSI_MAX) {
      out += ch
    } else {
      out += '?'
    }
  }
  return out
}

// ── Layout primitives (mirrors generateAdvisorPDF.ts) ──

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

// ── Radar chart (vector hexagon, mirrors the SVG in the sample report) ──
// Dimension order around the hexagon matches DIMENSIONS: positioning (top),
// demand-gen (upper-right), content (lower-right), ops (bottom),
// measurement (lower-left), team (upper-left) — same as the sample's SVG.

function hexPoint(index: number, radius: number): [number, number] {
  const angleDeg = -90 + 60 * index
  const angleRad = (angleDeg * Math.PI) / 180
  return [radius * Math.cos(angleRad), radius * Math.sin(angleRad)]
}

function drawRadarChart(doc: jsPDF, cur: Cursor, dimensionScores: DimensionScore[]) {
  const outerR = 30
  const chartHeight = outerR * 2 + 14
  cur.ensureSpace(chartHeight)
  const cx = cur.pageWidth / 2
  const cy = cur.y + outerR + 4

  // Grid rings at scores 1-5
  setDrawColor(doc, BORDER)
  doc.setLineWidth(0.15)
  for (let ring = 1; ring <= 5; ring++) {
    const r = outerR * (ring / 5)
    const pts = Array.from({ length: 6 }, (_, i) => hexPoint(i, r))
    for (let i = 0; i < 6; i++) {
      const [x1, y1] = pts[i]
      const [x2, y2] = pts[(i + 1) % 6]
      doc.line(cx + x1, cy + y1, cx + x2, cy + y2)
    }
  }
  // Spokes
  for (let i = 0; i < 6; i++) {
    const [x, y] = hexPoint(i, outerR)
    doc.line(cx, cy, cx + x, cy + y)
  }

  // Data polygon
  const scoreByDimension = new Map(dimensionScores.map((d) => [d.dimensionId, d.score]))
  const dataPoints = DIMENSIONS.map((dim, i) => {
    const score = scoreByDimension.get(dim.id) ?? 0
    return hexPoint(i, outerR * (score / 5))
  })

  doc.setLineWidth(0.5)
  setDrawColor(doc, PRIMARY)
  const gState = (doc as unknown as { GState: new (opts: { opacity: number }) => unknown }).GState
  doc.saveGraphicsState()
  doc.setGState(new gState({ opacity: 0.1 }))
  setFillColor(doc, PRIMARY)
  const segments: [number, number][] = []
  for (let i = 1; i < dataPoints.length; i++) {
    segments.push([dataPoints[i][0] - dataPoints[i - 1][0], dataPoints[i][1] - dataPoints[i - 1][1]])
  }
  doc.lines(segments, cx + dataPoints[0][0], cy + dataPoints[0][1], [1, 1], 'FD', true)
  doc.restoreGraphicsState()

  // Vertex dots + labels
  DIMENSIONS.forEach((dim, i) => {
    const [dx, dy] = dataPoints[i]
    setFillColor(doc, hex(dim.color))
    doc.circle(cx + dx, cy + dy, 1.1, 'F')

    const [lx, ly] = hexPoint(i, outerR + 8)
    const align: 'left' | 'center' | 'right' = lx > 2 ? 'left' : lx < -2 ? 'right' : 'center'
    setFont(doc, 7.5, 'normal')
    setTextColor(doc, hex(dim.color))
    doc.text(dim.shortName, cx + lx, cy + ly - 1, { align })
    setFont(doc, 6.5, 'normal')
    setTextColor(doc, TEXT_BODY)
    const score = scoreByDimension.get(dim.id) ?? 0
    doc.text(score.toFixed(1), cx + lx, cy + ly + 2.6, { align })
  })

  cur.y = cy + outerR + 12
}

// ── Header ──

function stageLabelOf(id: string): string {
  return STAGE_OPTIONS.find((s) => s.id === id)?.label ?? id
}
function roleLabelOf(id: string): string {
  return ROLE_OPTIONS.find((r) => r.id === id)?.label ?? id
}
function fundingLabelOf(id: string): string {
  return FUNDING_OPTIONS.find((f) => f.id === id)?.label ?? id
}

function buildHeader(doc: jsPDF, cur: Cursor, input: MaturityScorePDFInput) {
  const tier = tierForScore(input.overallScore)

  setFont(doc, 9, 'normal')
  setTextColor(doc, TEXT_MUTED)
  doc.text('Jaydeepp Sikdar', cur.pageWidth / 2, cur.y + 5, { align: 'center' })
  cur.addSpace(12)

  setFont(doc, 8, 'normal')
  setTextColor(doc, PRIMARY)
  doc.text('MARKETING MATURITY DIAGNOSTIC', cur.pageWidth / 2, cur.y, { align: 'center' })
  cur.addSpace(9)

  setFont(doc, 22, 'normal')
  setTextColor(doc, TEXT_BODY)
  doc.text('Your Marketing Maturity Score', cur.pageWidth / 2, cur.y, { align: 'center' })
  cur.addSpace(10)

  drawParagraph(doc, cur, tier.headline, {
    fontSize: 11,
    color: TEXT_SECONDARY,
    lineHeight: mmPt(15),
    align: 'center',
    maxWidth: 140,
  })
  cur.addSpace(4)

  // Tier badge
  const badgeH = 14
  const scoreText = input.overallScore.toFixed(1)
  setFont(doc, 20, 'normal')
  const scoreWidth = doc.getTextWidth(scoreText)
  setFont(doc, 10, 'normal')
  const labelWidth = Math.max(doc.getTextWidth(tier.label), doc.getTextWidth(`Score range: ${tier.min.toFixed(1)} - ${tier.max.toFixed(1)}`))
  const badgeW = scoreWidth + labelWidth + 12
  const badgeX = cur.pageWidth / 2 - badgeW / 2
  setFillColor(doc, hex(tier.color))
  doc.saveGraphicsState()
  const gState = (doc as unknown as { GState: new (opts: { opacity: number }) => unknown }).GState
  doc.setGState(new gState({ opacity: 0.08 }))
  doc.roundedRect(badgeX, cur.y, badgeW, badgeH, 1.5, 1.5, 'F')
  doc.restoreGraphicsState()

  setFont(doc, 20, 'normal')
  setTextColor(doc, hex(tier.color))
  doc.text(scoreText, badgeX + 5, cur.y + 9.5)
  setFont(doc, 10, 'normal')
  doc.text(tier.label, badgeX + 5 + scoreWidth + 4, cur.y + 6)
  setFont(doc, 7.5, 'normal')
  doc.text(`Score range: ${tier.min.toFixed(1)} - ${tier.max.toFixed(1)}`, badgeX + 5 + scoreWidth + 4, cur.y + 10.5)
  cur.addSpace(badgeH + 6)

  const metaText = `Role: ${roleLabelOf(input.qualifiers.role)}     Stage: ${stageLabelOf(input.qualifiers.stage)}     Funding: ${fundingLabelOf(input.qualifiers.funding)}`
  drawParagraph(doc, cur, metaText, { fontSize: 9, color: TEXT_MUTED, lineHeight: mmPt(12), align: 'center' })

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  drawParagraph(doc, cur, `Generated: ${today}`, { fontSize: 9, color: TEXT_MUTED, lineHeight: mmPt(12), align: 'center' })

  cur.addSpace(6)
  cur.hr()
  cur.addSpace(8)
}

// ── Page 1 body: radar, overall assessment, top 3 gaps ──

function buildPage1Body(doc: jsPDF, cur: Cursor, input: MaturityScorePDFInput) {
  setFont(doc, 16, 'normal')
  setTextColor(doc, TEXT_BODY)
  doc.text('Maturity profile', cur.pageWidth / 2, cur.y, { align: 'center' })
  cur.addSpace(8)

  drawRadarChart(doc, cur, input.dimensionScores)
  cur.addSpace(6)

  setFont(doc, 15, 'normal')
  setTextColor(doc, TEXT_BODY)
  doc.text('Overall assessment', cur.margin, cur.y)
  cur.addSpace(7)
  drawParagraph(doc, cur, overallAssessment(input.dimensionScores, input.qualifiers.funding), {
    fontSize: 10,
    color: TEXT_SECONDARY,
    lineHeight: mmPt(14.5),
  })
  cur.addSpace(8)

  // Priority gaps card
  const headerHeight = 10
  cur.ensureSpace(headerHeight)
  setFont(doc, 12, 'normal')
  setTextColor(doc, TEXT_BODY)
  doc.text('Your top 3 priority gaps', cur.margin, cur.y + 5)
  cur.addSpace(headerHeight)

  const paddingV = 6
  const paddingH = 7
  const innerX = cur.margin + paddingH
  const innerWidth = cur.contentWidth - paddingH * 2

  // Measure total card height first, without touching cur.y, so the
  // page-break check (ensureSpace) runs before we capture the card's
  // top position. Capturing cardTop before ensureSpace would leave it
  // pointing at the previous page's stale y if a page break occurs here.
  let measuredHeight = paddingV * 2
  for (const gap of input.weakest.slice(0, 3)) {
    const gapTier = tierForScore(gap.score)
    const firstSentence = WHAT_THIS_MEANS[gap.dimensionId][gapTier.id].split('. ')[0] + '.'

    setFont(doc, 9, 'normal')
    const descLines: string[] = doc.splitTextToSize(sanitizeText(firstSentence), innerWidth - 8)
    measuredHeight += 5 + 5 + descLines.length * mmPt(13) + 4
  }
  const cardHeight = measuredHeight
  cur.ensureSpace(cardHeight)
  const cardTop = cur.y

  setFillColor(doc, WHITE)
  setDrawColor(doc, BORDER)
  doc.setLineWidth(0.18)
  doc.roundedRect(cur.margin, cardTop, cur.contentWidth, cardHeight, 2, 2, 'FD')

  let y = cardTop + paddingV
  input.weakest.slice(0, 3).forEach((gap, idx) => {
    const dimension = dimensionById(gap.dimensionId)
    const gapTier = tierForScore(gap.score)
    const firstSentence = WHAT_THIS_MEANS[gap.dimensionId][gapTier.id].split('. ')[0] + '.'

    setFont(doc, 10, 'normal')
    setTextColor(doc, PRIMARY)
    doc.text(String(idx + 1), innerX, y + 4)

    setFont(doc, 10.5, 'normal')
    setTextColor(doc, TEXT_BODY)
    doc.text(dimension.name, innerX + 8, y + 4)
    y += 5

    setFont(doc, 8.5, 'normal')
    setTextColor(doc, TEXT_MUTED)
    doc.text(`Score: ${gap.score.toFixed(1)} / 5.0 - ${gapTier.label}`, innerX + 8, y + 3)
    y += 5

    setFont(doc, 9, 'normal')
    setTextColor(doc, TEXT_SECONDARY)
    const descLines: string[] = doc.splitTextToSize(sanitizeText(firstSentence), innerWidth - 8)
    for (const line of descLines) {
      doc.text(line, innerX + 8, y + mmPt(13) * 0.7)
      y += mmPt(13)
    }
    y += 4

    if (idx < 2) {
      setDrawColor(doc, BORDER)
      doc.setLineWidth(0.15)
      doc.line(innerX, y - 2, innerX + innerWidth, y - 2)
    }
  })

  cur.y = cardTop + cardHeight
}

// ── Page 2: dimension breakdowns ──

function buildDimensionBreakdowns(doc: jsPDF, cur: Cursor, input: MaturityScorePDFInput) {
  setFont(doc, 20, 'normal')
  setTextColor(doc, TEXT_BODY)
  doc.text('Dimension breakdown', cur.margin, cur.y + 6)
  cur.addSpace(16)

  const scoreByDimension = new Map(input.dimensionScores.map((d) => [d.dimensionId, d.score]))
  const isBootstrapped = input.qualifiers.funding === 'bootstrapped'

  DIMENSIONS.forEach((dim, idx) => {
    const score = scoreByDimension.get(dim.id) ?? 0
    const dimTier = tierForScore(score)
    const color = hex(dim.color)

    cur.ensureSpace(20)

    // Colored left border + title row
    const rowTop = cur.y
    setFont(doc, 13, 'normal')
    const titleLH = mmPt(16)
    cur.ensureSpace(titleLH)

    setDrawColor(doc, color)
    doc.setLineWidth(1)
    doc.line(cur.margin, rowTop, cur.margin, rowTop + titleLH)

    setTextColor(doc, TEXT_BODY)
    doc.text(dim.name, cur.margin + 4, rowTop + titleLH * 0.7)

    const badgeText = `${score.toFixed(1)}  ${dimTier.label}`
    setFont(doc, 10, 'normal')
    const badgeTextWidth = doc.getTextWidth(badgeText)
    const badgeW = badgeTextWidth + 8
    const badgeX = cur.pageWidth - cur.margin - badgeW
    setFillColor(doc, color)
    doc.saveGraphicsState()
    const gState = (doc as unknown as { GState: new (opts: { opacity: number }) => unknown }).GState
    doc.setGState(new gState({ opacity: 0.08 }))
    doc.roundedRect(badgeX, rowTop + 1, badgeW, titleLH - 2, 1.2, 1.2, 'F')
    doc.restoreGraphicsState()
    setTextColor(doc, color)
    doc.text(badgeText, badgeX + 4, rowTop + titleLH * 0.65)

    cur.y = rowTop + titleLH + 4

    setFont(doc, 10, 'normal')
    setTextColor(doc, TEXT_BODY)
    doc.text('What this means', cur.margin, cur.y + 3.5)
    cur.addSpace(6.5)
    drawParagraph(doc, cur, WHAT_THIS_MEANS[dim.id][dimTier.id], {
      fontSize: 9.5,
      color: TEXT_SECONDARY,
      lineHeight: mmPt(14),
    })
    cur.addSpace(4)

    setFont(doc, 10, 'normal')
    setTextColor(doc, TEXT_BODY)
    doc.text('Recommendation', cur.margin, cur.y + 3.5)
    cur.addSpace(6.5)
    const roleSentence = ROLE_LANGUAGE[input.qualifiers.role](dim.name.toLowerCase())
    drawParagraph(doc, cur, `${RECOMMENDATION[dim.id][dimTier.id]} ${roleSentence}`, {
      fontSize: 9.5,
      color: TEXT_SECONDARY,
      lineHeight: mmPt(14),
    })

    if (isBootstrapped) {
      cur.addSpace(3)
      const note = BOOTSTRAPPED_NOTES[dim.id]
      setFont(doc, 8.5, 'normal')
      const noteLines: string[] = doc.splitTextToSize(sanitizeText(note), cur.contentWidth - 10)
      const noteHeight = 6 + noteLines.length * mmPt(12.5) + 4
      cur.ensureSpace(noteHeight)
      const noteTop = cur.y
      setFillColor(doc, SURFACE_SOFT)
      doc.rect(cur.margin, noteTop, cur.contentWidth, noteHeight, 'F')
      setDrawColor(doc, PRIMARY)
      doc.setLineWidth(1)
      doc.line(cur.margin, noteTop, cur.margin, noteTop + noteHeight)

      setFont(doc, 7.5, 'normal')
      setTextColor(doc, PRIMARY)
      doc.text('CONTEXT FOR BOOTSTRAPPED COMPANIES', cur.margin + 4, noteTop + 4.5)

      setFont(doc, 8.5, 'normal')
      setTextColor(doc, TEXT_BODY)
      let noteY = noteTop + 9
      for (const line of noteLines) {
        doc.text(line, cur.margin + 4, noteY)
        noteY += mmPt(12.5)
      }
      cur.y = noteTop + noteHeight
    }

    cur.addSpace(8)
    if (idx < DIMENSIONS.length - 1) {
      cur.hr()
      cur.addSpace(8)
    }
  })
}

// ── AI readiness overlay: score, stage, 6x4 adoption heatmap ──

const HEATMAP_ROW_LABEL_WIDTH = 44
const HEATMAP_ROW_HEIGHT = 13
const HEATMAP_STAGE_LABELS: Record<AIStageId, string> = {
  unaware: 'Unaware',
  experimenting: 'Experimenting',
  functional: 'Functional',
  integrated: 'Integrated',
}

function fillRectWithOpacity(doc: jsPDF, x: number, y: number, w: number, h: number, color: RGB, opacity: number) {
  setFillColor(doc, color)
  doc.saveGraphicsState()
  const gState = (doc as unknown as { GState: new (opts: { opacity: number }) => unknown }).GState
  doc.setGState(new gState({ opacity }))
  doc.rect(x, y, w, h, 'F')
  doc.restoreGraphicsState()
}

function drawAIReadinessHeatmap(doc: jsPDF, cur: Cursor, estimates: AIWorkflowEstimate[]) {
  const gridX = cur.margin + HEATMAP_ROW_LABEL_WIDTH
  const gridWidth = cur.contentWidth - HEATMAP_ROW_LABEL_WIDTH
  const colWidth = gridWidth / 4

  // Column headers
  cur.ensureSpace(7)
  setFont(doc, 8, 'normal')
  setTextColor(doc, TEXT_SECONDARY)
  AI_STAGE_ORDER.forEach((stageId, i) => {
    const cx = gridX + colWidth * i + colWidth / 2
    doc.text(HEATMAP_STAGE_LABELS[stageId], cx, cur.y + 3.5, { align: 'center' })
  })
  cur.addSpace(9)

  // Rows: one per workflow, gradient cells + a dot marking the assessed stage
  AI_WORKFLOWS.forEach((workflow) => {
    const estimate = estimates.find((e) => e.workflowId === workflow.id)
    if (!estimate) return

    cur.ensureSpace(HEATMAP_ROW_HEIGHT)
    const rowTop = cur.y

    setFont(doc, 9, 'normal')
    setTextColor(doc, TEXT_BODY)
    const labelLines: string[] = doc.splitTextToSize(workflow.name, HEATMAP_ROW_LABEL_WIDTH - 4)
    const labelBlockHeight = labelLines.length * mmPt(11)
    let ly = rowTop + (HEATMAP_ROW_HEIGHT - labelBlockHeight) / 2 + mmPt(11) * 0.75
    for (const line of labelLines) {
      doc.text(line, cur.margin, ly)
      ly += mmPt(11)
    }

    AI_STAGE_ORDER.forEach((stageId, col) => {
      fillRectWithOpacity(
        doc,
        gridX + colWidth * col + 1,
        rowTop,
        colWidth - 2,
        HEATMAP_ROW_HEIGHT - 2,
        PRIMARY_SUBTLE,
        AI_STAGE_COLUMN_OPACITY[stageId]
      )
    })

    const stageIndex = AI_STAGE_ORDER.indexOf(estimate.stage.id)
    const dotX = gridX + colWidth * stageIndex + colWidth / 2
    const dotY = rowTop + (HEATMAP_ROW_HEIGHT - 2) / 2
    setFillColor(doc, PRIMARY)
    doc.circle(dotX, dotY, 2.2, 'F')

    cur.y = rowTop + HEATMAP_ROW_HEIGHT
  })

  // Legend
  cur.addSpace(4)
  cur.ensureSpace(6)
  setFillColor(doc, PRIMARY)
  doc.circle(cur.margin + 1.5, cur.y + 1.8, 1.6, 'F')
  setFont(doc, 8, 'normal')
  setTextColor(doc, TEXT_MUTED)
  doc.text('Your AI adoption stage in each workflow', cur.margin + 6, cur.y + 2.8)
  cur.addSpace(9)
}

function buildAIReadinessOverlay(doc: jsPDF, cur: Cursor, input: MaturityScorePDFInput) {
  setFont(doc, 8, 'normal')
  setTextColor(doc, PRIMARY)
  cur.ensureSpace(4)
  doc.text('AI READINESS', cur.margin, cur.y + 3.5)
  cur.addSpace(7)

  setFont(doc, 20, 'normal')
  setTextColor(doc, TEXT_BODY)
  doc.text('Where AI fits into your marketing today', cur.margin, cur.y + 6)
  cur.addSpace(11)

  const stage = input.aiReadinessStage
  drawParagraph(
    doc,
    cur,
    `AI readiness score: ${input.aiReadinessScore.toFixed(1)}, ${stage.label}. ${AI_STAGE_DEFINITION[stage.id]}`,
    { fontSize: 10, color: TEXT_SECONDARY, lineHeight: mmPt(14.5) }
  )
  cur.addSpace(9)

  const estimates = estimateAIWorkflowAdoption(input.aiAnswers)
  drawAIReadinessHeatmap(doc, cur, estimates)

  drawParagraph(doc, cur, aiReadinessPatternSummary(estimates), {
    fontSize: 10,
    color: TEXT_SECONDARY,
    lineHeight: mmPt(14.5),
  })
  cur.addSpace(4)
  drawParagraph(
    doc,
    cur,
    "This overlay does not affect your 6-dimension maturity score. It's a separate, non-scored read on where AI is (and isn't) embedded in how your marketing work gets done.",
    { fontSize: 8.5, color: TEXT_MUTED, lineHeight: mmPt(12.5) }
  )
}

// ── Consulting bridge sections ──

function buildConsultingBridge(
  doc: jsPDF,
  cur: Cursor,
  eyebrow: string,
  title: string,
  body: string,
  prompt: string
) {
  cur.ensureSpace(16)
  setFont(doc, 8, 'normal')
  setTextColor(doc, PRIMARY)
  doc.text(eyebrow.toUpperCase(), cur.margin, cur.y + 3.5)
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
  cur.addSpace(10)
}

function buildConsultingBridges(doc: jsPDF, cur: Cursor, input: MaturityScorePDFInput) {
  setFont(doc, 20, 'normal')
  setTextColor(doc, TEXT_BODY)
  cur.ensureSpace(12)
  doc.text(sanitizeText("What this report can and can't tell you"), cur.margin, cur.y + 6)
  cur.addSpace(16)

  const gap = resourceGapBridge(input.dimensionScores)
  buildConsultingBridge(doc, cur, 'Consulting bridge', 'Your resource gap', gap.body, gap.prompt)
  cur.hr()
  cur.addSpace(10)

  const sequencing = strategicSequencingBridge(input.weakest, input.qualifiers.funding)
  buildConsultingBridge(doc, cur, 'Consulting bridge', 'Strategic sequencing', sequencing.body, sequencing.prompt)
  cur.hr()
  cur.addSpace(10)

  const aiMap = aiIntegrationMapBridge(input.weakest, input.aiAnswers)
  buildConsultingBridge(doc, cur, 'Consulting bridge', 'AI integration map', aiMap.body, aiMap.prompt)
}

// ── Page 3: benchmarks, 90-day priorities, CTA, footer ──

function buildBenchmarksAndPriorities(doc: jsPDF, cur: Cursor, input: MaturityScorePDFInput) {
  const benchmarkText = benchmarkParagraph(input.qualifiers.stage, input.qualifiers.funding, input.overallScore)

  setFont(doc, 9.5, 'normal')
  const benchLines: string[] = doc.splitTextToSize(sanitizeText(benchmarkText), cur.contentWidth - 20)
  const benchHeight = 10 + benchLines.length * mmPt(14) + 10
  cur.ensureSpace(benchHeight)
  const benchTop = cur.y
  setFillColor(doc, SURFACE_CREAM)
  doc.roundedRect(cur.margin, benchTop, cur.contentWidth, benchHeight, 2, 2, 'F')

  setFont(doc, 13, 'normal')
  setTextColor(doc, TEXT_BODY)
  doc.text('What companies at your stage typically look like', cur.margin + 10, benchTop + 10)

  setFont(doc, 9.5, 'normal')
  setTextColor(doc, TEXT_SECONDARY)
  let by = benchTop + 17
  for (const line of benchLines) {
    doc.text(line, cur.margin + 10, by)
    by += mmPt(14)
  }
  cur.y = benchTop + benchHeight
  cur.addSpace(10)

  setFont(doc, 20, 'normal')
  setTextColor(doc, TEXT_BODY)
  cur.ensureSpace(12)
  doc.text('Your next 90 days', cur.margin, cur.y + 6)
  cur.addSpace(14)

  const priorities = ninetyDayPriorities(input.weakest)
  priorities.forEach((priority, idx) => {
    setFont(doc, 18, 'normal')
    const numWidth = 10
    setFont(doc, 10.5, 'normal')
    const titleLines: string[] = doc.splitTextToSize(sanitizeText(priority.title), cur.contentWidth - numWidth - 4)
    setFont(doc, 9, 'normal')
    const detailLines: string[] = doc.splitTextToSize(sanitizeText(priority.detail), cur.contentWidth - numWidth - 4)
    const blockHeight = titleLines.length * mmPt(13) + 2 + detailLines.length * mmPt(12.5) + 8

    cur.ensureSpace(blockHeight)
    const top = cur.y

    setFont(doc, 18, 'normal')
    setTextColor(doc, PRIMARY)
    doc.text(String(idx + 1), cur.margin, top + 6)

    let ty = top + 4
    setFont(doc, 10.5, 'normal')
    setTextColor(doc, TEXT_BODY)
    for (const line of titleLines) {
      doc.text(line, cur.margin + numWidth, ty)
      ty += mmPt(13)
    }
    ty += 1.5
    setFont(doc, 9, 'normal')
    setTextColor(doc, TEXT_SECONDARY)
    for (const line of detailLines) {
      doc.text(line, cur.margin + numWidth, ty)
      ty += mmPt(12.5)
    }

    cur.y = top + blockHeight
    if (idx < priorities.length - 1) {
      setDrawColor(doc, BORDER)
      doc.setLineWidth(0.15)
      doc.line(cur.margin, cur.y - 3, cur.pageWidth - cur.margin, cur.y - 3)
    }
  })

  cur.addSpace(6)
  buildCTA(doc, cur)
  buildFooter(doc, cur)
}

function buildCTA(doc: jsPDF, cur: Cursor) {
  const paddingV = 8
  const headingLH = mmPt(15)
  const bodyLH = mmPt(13)
  const bodyLines = doc.splitTextToSize(
    "Book a 60-minute consultation. We'll review your scores, pressure-test the priorities, and help you identify the top 3 most important next steps.",
    cur.contentWidth - 30
  )
  const btnH = 9
  const height = paddingV * 2 + headingLH + bodyLines.length * bodyLH + 5 + btnH

  cur.ensureSpace(height)
  const top = cur.y
  setFillColor(doc, SURFACE_SOFT)
  setDrawColor(doc, BORDER)
  doc.setLineWidth(0.18)
  doc.roundedRect(cur.margin, top, cur.contentWidth, height, 2, 2, 'FD')

  let y = top + paddingV
  setFont(doc, 13, 'normal')
  setTextColor(doc, TEXT_BODY)
  doc.text('Want to walk through these results?', cur.pageWidth / 2, y + headingLH * 0.6, { align: 'center' })
  y += headingLH

  setFont(doc, 9.5, 'normal')
  setTextColor(doc, TEXT_SECONDARY)
  for (const line of bodyLines) {
    doc.text(line, cur.pageWidth / 2, y + bodyLH * 0.7, { align: 'center' })
    y += bodyLH
  }
  y += 5

  const btnText = 'Book a consultation ->'
  setFont(doc, 10.5, 'normal')
  const btnTextWidth = doc.getTextWidth(btnText)
  const btnW = btnTextWidth + 16
  const btnX = cur.pageWidth / 2 - btnW / 2
  setFillColor(doc, PRIMARY)
  doc.roundedRect(btnX, y, btnW, btnH, btnH / 2, btnH / 2, 'F')
  setTextColor(doc, WHITE)
  doc.textWithLink(btnText, btnX + 8, y + btnH * 0.65, {
    url: 'https://jaydipsikdar.com/contact?utm_source=maturity-score&utm_medium=pdf&utm_campaign=consulting',
  })

  cur.y = top + height
  cur.addSpace(10)
}

function buildFooter(doc: jsPDF, cur: Cursor) {
  cur.hr()
  cur.addSpace(8)

  setFont(doc, 11, 'normal')
  setTextColor(doc, TEXT_BODY)
  doc.text('Jaydeepp Sikdar', cur.pageWidth / 2, cur.y, { align: 'center' })
  cur.addSpace(6)

  setFont(doc, 9, 'normal')
  setTextColor(doc, TEXT_MUTED)
  doc.text('CMO turned builder', cur.pageWidth / 2, cur.y, { align: 'center' })
  cur.addSpace(5)

  setFont(doc, 9, 'normal')
  setTextColor(doc, PRIMARY)
  const siteLinkWidth = doc.getTextWidth('jaydipsikdar.com')
  doc.textWithLink('jaydipsikdar.com', cur.pageWidth / 2 - siteLinkWidth / 2, cur.y, {
    url: 'https://jaydipsikdar.com',
  })
  cur.addSpace(8)

  setFont(doc, 8.5, 'normal')
  setTextColor(doc, TEXT_MUTED)
  const resourcesText =
    "Free diagnostic tools, decision frameworks, and resources for B2B marketing leaders, built from 20+ years across IBM, Adobe, MoEngage, and early-stage startups. Explore all resources at jaydipsikdar.com/resources."
  const lines: string[] = doc.splitTextToSize(resourcesText, 130)
  for (const line of lines) {
    doc.text(line, cur.pageWidth / 2, cur.y, { align: 'center' })
    cur.addSpace(mmPt(12))
  }
}

// ── Per-page footer (page number + URL, not a watermark) ──

function addPageFooters(doc: jsPDF) {
  const totalPages = (doc.internal as unknown as { getNumberOfPages(): number }).getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    setFont(doc, 7.5, 'normal')
    setTextColor(doc, TEXT_MUTED)
    doc.text(`Page ${i} of ${totalPages}`, 20, pageHeight - 10)
    doc.text('jaydipsikdar.com/resources/marketing-maturity-score', pageWidth - 20, pageHeight - 10, {
      align: 'right',
    })
  }
}

// ── Entry point ──

export function generateMaturityScorePDF(input: MaturityScorePDFInput): Uint8Array {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const cur = new Cursor(doc)

  buildHeader(doc, cur, input)
  buildPage1Body(doc, cur, input)

  cur.newPage()
  buildDimensionBreakdowns(doc, cur, input)

  cur.newPage()
  buildAIReadinessOverlay(doc, cur, input)

  cur.newPage()
  buildConsultingBridges(doc, cur, input)

  cur.newPage()
  buildBenchmarksAndPriorities(doc, cur, input)

  addPageFooters(doc)

  return new Uint8Array(doc.output('arraybuffer'))
}
