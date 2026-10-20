import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"
import { clearMask, type DecorClear } from "./mask"
import { seeded } from "./random"

type Shape = "rect" | "circle" | "tri" | "squiggle"
const SHAPES: Array<Shape> = ["rect", "circle", "tri", "squiggle", "rect"]
const COLORS = [
  "var(--inv-primary)",
  "var(--inv-accent)",
  "var(--inv-secondary)",
  "color-mix(in oklab, var(--inv-primary) 55%, var(--inv-accent))",
]

function Piece({ shape, color }: { shape: Shape; color: string }) {
  switch (shape) {
    case "rect":
      return <rect x="2" y="6" width="16" height="8" rx="1.5" fill={color} />
    case "circle":
      return <circle cx="10" cy="10" r="5.5" fill={color} />
    case "tri":
      return <path d="M10 2 18 17H2Z" fill={color} />
    case "squiggle":
      return (
        <path
          d="M1 12c3-6 6 6 9 0s6 6 9 0"
          fill="none"
          stroke={color}
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      )
  }
}

/**
 * Static, seeded confetti scattered over a band. Visible without JS and in
 * reduced motion (it simply stops floating), so a party template still looks
 * like a party when the WebGL particles are off.
 */
export function ConfettiField({
  count = 46,
  seed = 7,
  clear = "center",
  className,
}: {
  count?: number
  seed?: number
  clear?: DecorClear
  className?: string
}) {
  const rand = seeded(seed)
  const pieces = Array.from({ length: count }, (_, i) => {
    const size = 10 + rand() * 16
    return {
      i,
      shape: SHAPES[Math.floor(rand() * SHAPES.length)],
      color: COLORS[Math.floor(rand() * COLORS.length)],
      style: {
        left: `${(rand() * 100).toFixed(2)}%`,
        top: `${(rand() * 100).toFixed(2)}%`,
        width: size,
        height: size,
        "--r": `${Math.round(rand() * 360)}deg`,
        "--d": `${(5 + rand() * 6).toFixed(1)}s`,
        "--delay": `${(-rand() * 6).toFixed(1)}s`,
        opacity: 0.55 + rand() * 0.4,
      } as CSSProperties,
    }
  })
  return (
    <div
      aria-hidden="true"
      className={cn("absolute inset-0", className)}
      style={clearMask(clear)}
    >
      {pieces.map((p) => (
        <svg
          key={p.i}
          viewBox="0 0 20 20"
          className="inv-anim-float absolute"
          style={p.style}
        >
          <Piece shape={p.shape} color={p.color} />
        </svg>
      ))}
    </div>
  )
}
