'use client'

import { DIMENSIONS, type DimensionId } from '@/lib/maturityScoreData'
import type { DimensionScore } from '@/lib/maturityScoring'

// Custom SVG radar (not Recharts) so individual spokes can render dashed
// while pending and dots can ease into position with a plain CSS
// transition on cx/cy — this is the same chart used as the live progress
// indicator during the assessment and as the final chart on the results
// preview and PDF, just with different `revealed` sets.

const DIMENSION_ABBREV: Record<DimensionId, string> = {
  positioning: 'POS',
  'demand-gen': 'DEM',
  content: 'CNT',
  ops: 'OPS',
  measurement: 'MSR',
  team: 'TEAM',
}

function hexPoint(index: number, radius: number, cx: number, cy: number): [number, number] {
  const angleDeg = -90 + 60 * index
  const angleRad = (angleDeg * Math.PI) / 180
  return [cx + radius * Math.cos(angleRad), cy + radius * Math.sin(angleRad)]
}

interface MaturityScoreLiveRadarProps {
  dimensionScores: DimensionScore[]
  revealed?: DimensionId[] | 'all'
  size?: number
  className?: string
}

export default function MaturityScoreLiveRadar({
  dimensionScores,
  revealed = 'all',
  size = 160,
  className,
}: MaturityScoreLiveRadarProps) {
  const cx = 110
  const cy = 110
  const outerR = 74

  const scoreByDim = new Map(dimensionScores.map((d) => [d.dimensionId, d.score]))
  const isRevealed = (id: DimensionId) => revealed === 'all' || revealed.includes(id)

  const vertices = DIMENSIONS.map((dim, i) => {
    const dimRevealed = isRevealed(dim.id)
    const score = dimRevealed ? scoreByDim.get(dim.id) ?? 0 : 0
    const [x, y] = hexPoint(i, outerR * (score / 5), cx, cy)
    return { dim, x, y, revealed: dimRevealed }
  })

  const polygonPoints = vertices.map((v) => `${v.x},${v.y}`).join(' ')

  return (
    <svg
      viewBox="0 0 220 220"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Marketing maturity radar chart"
    >
      {/* Grid rings at scores 1-5 */}
      {[1, 2, 3, 4, 5].map((ring) => (
        <polygon
          key={ring}
          points={DIMENSIONS.map((_, i) => hexPoint(i, outerR * (ring / 5), cx, cy).join(',')).join(' ')}
          fill="none"
          stroke="var(--border-hairline)"
          strokeWidth={1}
        />
      ))}

      {/* Spokes: solid once that dimension is revealed, dashed while pending */}
      {DIMENSIONS.map((dim, i) => {
        const [x, y] = hexPoint(i, outerR, cx, cy)
        const dimRevealed = isRevealed(dim.id)
        return (
          <line
            key={dim.id}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="var(--border-hairline)"
            strokeWidth={1}
            strokeDasharray={dimRevealed ? undefined : '2 3'}
          />
        )
      })}

      {/* Data area */}
      <polygon
        points={polygonPoints}
        fill="var(--color-primary-soft)"
        fillOpacity={0.18}
        stroke="var(--color-primary-soft)"
        strokeWidth={1.5}
      />

      {/* Vertex dots — ease into position as each dimension completes */}
      {vertices.map((v) => (
        <circle
          key={v.dim.id}
          cx={v.x}
          cy={v.y}
          r={v.revealed ? 3.5 : 0}
          fill={v.dim.color}
          stroke="white"
          strokeWidth={1.2}
          style={{ transition: 'cx 170ms ease-out, cy 170ms ease-out, r 170ms ease-out' }}
        />
      ))}

      {/* Spoke labels */}
      {DIMENSIONS.map((dim, i) => {
        const [x, y] = hexPoint(i, outerR + 16, cx, cy)
        const dimRevealed = isRevealed(dim.id)
        return (
          <text
            key={dim.id}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={10}
            fontWeight={400}
            letterSpacing="0.1px"
            fill={dimRevealed ? dim.color : 'var(--text-muted)'}
          >
            {DIMENSION_ABBREV[dim.id]}
          </text>
        )
      })}
    </svg>
  )
}
