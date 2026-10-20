import type { CSSProperties } from "react"

export type DecorClear = "center" | "none"

/**
 * Decor sits behind text but still competes with it. `center` fades the
 * layer out in an ellipse around the middle of its box (where headlines live)
 * so ornaments frame the copy instead of crossing it.
 */
export function clearMask(clear: DecorClear): CSSProperties | undefined {
  if (clear === "none") return undefined
  const mask =
    "radial-gradient(ellipse 46% 40% at 50% 50%, transparent 45%, black 100%)"
  return { maskImage: mask, WebkitMaskImage: mask }
}
