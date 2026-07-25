'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import { DIMENSIONS, dimensionById, type DimensionId } from '@/lib/maturityScoreData'
import type { DimensionScore } from '@/lib/maturityScoring'

// Recharts renders these purely as SVG, so CSS variables resolve fine via
// the `fill`/`stroke` string props (browsers accept var(...) in SVG paint
// attributes rendered from inline styles or attributes on modern browsers).

function ColoredAngleTick(props: {
  x?: number
  y?: number
  payload?: { value?: DimensionId }
  textAnchor?: 'inherit' | 'start' | 'middle' | 'end'
}) {
  const { x, y, payload, textAnchor } = props
  if (x === undefined || y === undefined || !payload?.value) return null
  const dimension = dimensionById(payload.value)
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      fill={dimension.color}
      fontSize={12}
      fontFamily="var(--font-inter, Inter), system-ui, sans-serif"
      fontWeight={400}
    >
      {dimension.shortName}
    </text>
  )
}

function ColoredDot(props: { cx?: number; cy?: number; payload?: { dimensionId?: DimensionId } }) {
  const { cx, cy, payload } = props
  if (cx === undefined || cy === undefined || !payload?.dimensionId) return null
  const dimension = dimensionById(payload.dimensionId)
  return <circle cx={cx} cy={cy} r={4} fill={dimension.color} stroke="white" strokeWidth={1.5} />
}

export default function MaturityScoreRadar({ dimensionScores }: { dimensionScores: DimensionScore[] }) {
  const data = DIMENSIONS.map((d) => {
    const found = dimensionScores.find((s) => s.dimensionId === d.id)
    return { dimensionId: d.id, shortName: d.id, score: found?.score ?? 0 }
  })

  return (
    <div className="w-full h-72 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="var(--border-hairline)" />
          <PolarAngleAxis dataKey="shortName" tick={<ColoredAngleTick />} />
          <PolarRadiusAxis
            domain={[0, 5]}
            tickCount={6}
            axisLine={false}
            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
          />
          <Radar
            dataKey="score"
            stroke="var(--color-primary)"
            fill="var(--color-primary)"
            fillOpacity={0.12}
            strokeWidth={2}
            dot={<ColoredDot />}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
