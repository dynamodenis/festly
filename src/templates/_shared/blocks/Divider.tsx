import { cn } from "@/lib/utils"
import type { OrnamentKind } from "../../types"
import { useInvitation } from "../context"

const paths: Record<OrnamentKind, React.ReactNode> = {
  leaf: (
    <>
      <path d="M6 16h50M104 16h50" strokeLinecap="round" />
      <path d="M80 5c7 3.5 11 7.5 11 11s-4 7.5-11 11c-7-3.5-11-7.5-11-11s4-7.5 11-11Z" />
      <path d="M80 6v20" />
      <path
        d="M65 16c-3-4-7-5-11-2.5M95 16c3-4 7-5 11-2.5M65 16c-3 4-7 5-11 2.5M95 16c3 4 7 5 11 2.5"
        strokeLinecap="round"
      />
    </>
  ),
  line: <path d="M20 16h120" strokeLinecap="round" />,
  dots: (
    <g fill="currentColor" stroke="none">
      <circle cx="56" cy="16" r="1.6" />
      <circle cx="68" cy="16" r="2.2" />
      <circle cx="80" cy="16" r="3.2" />
      <circle cx="92" cy="16" r="2.2" />
      <circle cx="104" cy="16" r="1.6" />
    </g>
  ),
  wave: (
    <path
      d="M4 16c10-8 20-8 30 0s20 8 30 0 20-8 30 0 20 8 30 0 20-8 30 0"
      strokeLinecap="round"
    />
  ),
  star: (
    <>
      <path d="M8 16h56M96 16h56" strokeLinecap="round" />
      <path
        d="M80 4l2.6 9.4L92 16l-9.4 2.6L80 28l-2.6-9.4L68 16l9.4-2.6Z"
        fill="currentColor"
        stroke="none"
      />
    </>
  ),
  diamond: (
    <>
      <path d="M10 16h58M92 16h58" strokeLinecap="round" />
      <path d="M80 8l8 8-8 8-8-8Z" />
      <path d="M80 12l4 4-4 4-4-4Z" fill="currentColor" stroke="none" />
    </>
  ),
}

/**
 * Decorative separator in the invitation's primary color. Without `kind` it
 * uses the invitation's ornament (theme.ornament, else the template default).
 */
export function Divider({
  kind,
  className,
}: {
  kind?: OrnamentKind
  className?: string
}) {
  const { ornament } = useInvitation()
  return (
    <svg
      aria-hidden="true"
      data-ornament={kind ?? ornament}
      className={cn("mx-auto my-6 h-8 w-44 text-inv-primary", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      viewBox="0 0 160 32"
    >
      {paths[kind ?? ornament]}
    </svg>
  )
}
