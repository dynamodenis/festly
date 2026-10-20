import { cn } from "@/lib/utils"

/** Scalloped rosette outline as an SVG path, computed (no hand-drawn data). */
function scallopPath(
  cx: number,
  cy: number,
  r: number,
  bumps: number,
  depth: number
) {
  const points: Array<string> = []
  const steps = bumps * 8
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const rr = r - depth * (0.5 - 0.5 * Math.cos(t * bumps))
    points.push(
      `${(cx + rr * Math.cos(t)).toFixed(2)},${(cy + rr * Math.sin(t)).toFixed(2)}`
    )
  }
  return `M${points.join("L")}Z`
}

const SCALLOP = scallopPath(50, 50, 48, 18, 4)

/**
 * Embossed-foil seal with a short label (a year, initials). Used on the
 * graduation diploma card; reusable for anniversaries and corporate events.
 */
export function Seal({
  label,
  caption,
  className,
}: {
  label: string
  caption?: string
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative size-24 text-inv-primary sm:size-28", className)}
    >
      <svg
        viewBox="0 0 100 100"
        className="inv-anim-spin absolute inset-0 [--d:60s]"
      >
        <path d={SCALLOP} fill="currentColor" opacity="0.18" />
        <path d={SCALLOP} fill="none" stroke="currentColor" strokeWidth="0.9" />
      </svg>
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="50" cy="50" r="36" strokeWidth="0.8" />
        <circle
          cx="50"
          cy="50"
          r="32"
          strokeWidth="0.4"
          strokeDasharray="0.8 1.8"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-inv-display text-xl leading-none sm:text-2xl">
          {label}
        </span>
        {caption && (
          <span className="mt-1 text-[0.5rem] tracking-[0.3em] uppercase opacity-80">
            {caption}
          </span>
        )}
      </div>
    </div>
  )
}
