/**
 * Atmospheric color field for the homepage hero (DESIGN.md Section 6/8).
 * Authored fresh for this site: a cream base with five blurred radial
 * forms in cream, ochre, peach, ember, rose, and pink drifting across the
 * upper third. Full-bleed, sits behind hero content, never traced from
 * another project.
 */
export default function ColorField({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden bg-surface-cream ${className}`}
    >
      <div
        className="absolute -left-[12%] -top-[28%] h-[62%] w-[46%] rounded-full opacity-70 blur-[90px]"
        style={{ background: 'radial-gradient(circle at 40% 40%, #ffd8c4, transparent 70%)' }}
      />
      <div
        className="absolute left-[18%] -top-[10%] h-[50%] w-[38%] rounded-full opacity-60 blur-[100px]"
        style={{ background: 'radial-gradient(circle at 50% 50%, #e84500, transparent 72%)' }}
      />
      <div
        className="absolute right-[6%] -top-[18%] h-[58%] w-[42%] rounded-full opacity-60 blur-[110px]"
        style={{ background: 'radial-gradient(circle at 50% 50%, #df4770, transparent 72%)' }}
      />
      <div
        className="absolute -right-[8%] top-[8%] h-[46%] w-[34%] rounded-full opacity-50 blur-[95px]"
        style={{ background: 'radial-gradient(circle at 50% 50%, #ef7bc2, transparent 74%)' }}
      />
      <div
        className="absolute left-[2%] top-[18%] h-[40%] w-[30%] rounded-full opacity-50 blur-[85px]"
        style={{ background: 'radial-gradient(circle at 50% 50%, #b57738, transparent 74%)' }}
      />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-white" />
    </div>
  )
}
