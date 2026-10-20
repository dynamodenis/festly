import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import type { MotionLevel } from "../schema"

/**
 * What a block may animate right now.
 * - `full`: WebGL backgrounds, text splits, scroll reveals
 * - `reduced`: no WebGL/canvas; gentle CSS fades and text reveals only
 * - `none`: static markup
 * The OS "reduce motion" setting always wins and collapses to `none`.
 */
export type EffectiveMotion = MotionLevel

export function effectiveMotion(
  level: MotionLevel,
  prefersReduced: boolean
): EffectiveMotion {
  if (prefersReduced) return "none"
  return level
}

export function useEffectiveMotion(level: MotionLevel): EffectiveMotion {
  const prefersReduced = usePrefersReducedMotion()
  return effectiveMotion(level, prefersReduced)
}
