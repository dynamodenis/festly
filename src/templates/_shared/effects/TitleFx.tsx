import { ClientOnly } from "@tanstack/react-router"
import { Suspense, createElement, lazy } from "react"
import { cn } from "@/lib/utils"
import type { EffectiveMotion } from "../theme/motion"

const SplitText = lazy(() => import("@/components/reactbits/SplitText"))
const ShinyText = lazy(() => import("@/components/reactbits/ShinyText"))

export type TitleEffect = "split" | "blur" | "shiny" | "none"
type Tag = "h1" | "h2" | "h3" | "p" | "span"

export type TitleFxProps = {
  kind: TitleEffect
  text: string
  motion: EffectiveMotion
  tag?: Tag
  className?: string
  /** Shine colors for `shiny`. */
  color?: string
  shineColor?: string
}

/**
 * Animated heading. The plain heading is both the SSR output and the fallback
 * for no-JS and reduced motion, so every reader gets the same text in the
 * same tag. `split` (characters rise) needs motion "full"; `blur` (words
 * un-blur) and `shiny` (a light sweep) are gentle enough for "reduced".
 *
 * Both split and blur use ReactBits SplitText, which renders the given tag
 * itself, so the heading never wraps a block element (valid h1 content).
 */
export function TitleFx({
  kind,
  text,
  motion,
  tag = "h1",
  className,
  color,
  shineColor,
}: TitleFxProps) {
  const plain = createElement(tag, { className }, text)
  const allowed =
    motion === "full" || (motion === "reduced" && kind !== "split")
  if (kind === "none" || !allowed) return plain

  return (
    <ClientOnly fallback={plain}>
      <Suspense fallback={plain}>
        {kind === "shiny" ? (
          createElement(
            tag,
            { className },
            <ShinyText
              text={text}
              color={color}
              shineColor={shineColor}
              speed={3.5}
              delay={1.2}
            />
          )
        ) : (
          <SplitText
            text={text}
            tag={tag}
            className={cn("block", className)}
            splitType={kind === "split" ? "chars" : "words"}
            effect={kind === "split" ? "rise" : "blur"}
            delay={kind === "split" ? 35 : 90}
            duration={kind === "split" ? 0.9 : 1.1}
            trigger="load"
            textAlign="inherit"
          />
        )}
      </Suspense>
    </ClientOnly>
  )
}
