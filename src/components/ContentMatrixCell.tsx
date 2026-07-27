'use client'

import { themeById, structureById, channelById, type MatrixCell } from '@/lib/contentOfficeData'
import { hexToRgba } from '@/lib/colorUtils'

export default function ContentMatrixCell({ cell, className = '' }: { cell: MatrixCell; className?: string }) {
  const theme = themeById(cell.theme)
  const structure = structureById(cell.structure)

  return (
    <div className={`rounded-[var(--radius-lg)] border border-[color:var(--border-hairline)] bg-white p-8 ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <span
          className="text-[10px] font-normal uppercase tracking-[0.1px] font-sans"
          style={{ color: theme.color }}
        >
          {theme.name}
        </span>
        <span
          className="px-2.5 py-1 rounded-[var(--radius-pill)] text-[11px] font-normal font-sans whitespace-nowrap"
          style={{ background: hexToRgba(theme.color, 0.1), color: theme.color }}
        >
          {structure.name}
        </span>
      </div>

      <p className="text-[16px] font-light font-sans leading-[1.4] text-[color:var(--text-body)] mb-4">
        {cell.contentIdea}
      </p>

      <div className="flex flex-col gap-1.5">
        {cell.channelMapping.map((m) => (
          <p key={m.channel} className="text-[13px] font-light font-sans leading-[1.4] text-[color:var(--text-secondary)]">
            <span className="font-normal text-[color:var(--text-muted)]">{channelById(m.channel).name}: </span>
            {m.guidance}
          </p>
        ))}
      </div>
    </div>
  )
}
