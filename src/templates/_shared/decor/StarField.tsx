import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"
import { clearMask, type DecorClear } from "./mask"
import { seeded } from "./random"

/**
 * Seeded night sky: tiny dots plus a few four-point sparkles that twinkle.
 * Pure SVG + CSS, so it renders on the server and without WebGL.
 */
export function StarField({
  count = 70,
  sparkles = 7,
  seed = 11,
  clear = "center",
  className,
}: {
  count?: number
  sparkles?: number
  seed?: number
  clear?: DecorClear
  className?: string
}) {
  const rand = seeded(seed)
  const dots = Array.from({ length: count }, (_, i) => ({
    i,
    cx: rand() * 100,
    cy: rand() * 100,
    r: 0.08 + rand() * 0.18,
    style: {
      "--o": (0.35 + rand() * 0.6).toFixed(2),
      "--d": `${(2.5 + rand() * 4).toFixed(1)}s`,
      "--delay": `${(-rand() * 5).toFixed(1)}s`,
    } as CSSProperties,
  }))
  const stars = Array.from({ length: sparkles }, (_, i) => ({
    i,
    x: 4 + rand() * 92,
    y: 4 + rand() * 80,
    s: 0.9 + rand() * 1.6,
    style: {
      "--o": "0.9",
      "--d": `${(3 + rand() * 3).toFixed(1)}s`,
      "--delay": `${(-rand() * 4).toFixed(1)}s`,
    } as CSSProperties,
  }))
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn(
        "absolute inset-0 h-full w-full text-inv-primary",
        className
      )}
      style={clearMask(clear)}
    >
      {dots.map((d) => (
        <circle
          key={d.i}
          cx={d.cx}
          cy={d.cy}
          r={d.r}
          fill="currentColor"
          className="inv-anim-twinkle"
          style={d.style}
        />
      ))}
      {stars.map((s) => (
        <path
          key={`s${s.i}`}
          transform={`translate(${s.x} ${s.y}) scale(${s.s / 10})`}
          d="M0-10 2-2 10 0 2 2 0 10-2 2-10 0-2-2Z"
          fill="currentColor"
          className="inv-anim-twinkle"
          style={s.style}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  )
}
