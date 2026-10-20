import { ClientOnly } from "@tanstack/react-router"
import { Suspense, lazy } from "react"
import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"
import type { BackgroundEffect } from "../../types"
import type { EffectiveMotion } from "../theme/motion"
import type { Palette } from "../theme/palettes"

// Every WebGL component is lazy so none of them land in the initial chunk.
const Aurora = lazy(() => import("@/components/reactbits/Aurora"))
const Silk = lazy(() => import("@/components/reactbits/Silk"))
const Particles = lazy(() => import("@/components/reactbits/Particles"))
const Iridescence = lazy(() => import("@/components/reactbits/Iridescence"))
const Waves = lazy(() => import("@/components/reactbits/Waves"))

export type BackgroundVariant = "soft" | "bold" | "confetti"

export type BackgroundFxProps = {
  kind: BackgroundEffect
  palette: Palette
  motion: EffectiveMotion
  variant?: BackgroundVariant
  /** Canvas opacity over the static gradient (0..1). */
  opacity?: number
  className?: string
}

/** The gradient everyone sees: server, no-JS, reduced motion, and under the canvas. */
export function staticBackdrop(palette: Palette): CSSProperties {
  const { primary, accent, secondary, background } = palette
  return {
    backgroundColor: background,
    backgroundImage: `radial-gradient(ellipse at 20% 0%, color-mix(in oklab, ${primary} 28%, transparent), transparent 55%), radial-gradient(ellipse at 80% 100%, color-mix(in oklab, ${accent} 22%, transparent), transparent 50%), radial-gradient(ellipse at 60% 40%, color-mix(in oklab, ${secondary} 30%, transparent), transparent 60%)`,
  }
}

function Canvas({
  kind,
  palette,
  variant,
}: Pick<BackgroundFxProps, "kind" | "palette"> & {
  variant: BackgroundVariant
}) {
  const light = palette.mode === "light"
  const stops = [palette.primary, palette.accent, palette.secondary]
  switch (kind) {
    case "aurora":
      return (
        <Aurora
          colorStops={stops}
          blend={variant === "bold" ? 0.7 : 0.45}
          amplitude={1}
          speed={0.6}
          lightMode={light}
        />
      )
    case "silk":
      return (
        <Silk
          color={light ? palette.secondary : palette.primary}
          sheenColor={palette.accent}
          speed={2}
          scale={1.1}
          noiseIntensity={0.8}
          lightMode={light}
        />
      )
    case "particles":
      return (
        <Particles
          particleColors={stops}
          particleCount={variant === "confetti" ? 260 : 140}
          particleSpread={variant === "confetti" ? 12 : 9}
          particleBaseSize={variant === "confetti" ? 140 : 90}
          shape={variant === "confetti" ? "square" : "sparkle"}
          drift={variant === "confetti" ? "down" : "none"}
          driftSpeed={variant === "confetti" ? 1.4 : 1}
          twinkle={0.4}
          alphaParticles
          lightMode={light}
        />
      )
    case "iridescence":
      return (
        <Iridescence
          color={palette.primary}
          speed={0.6}
          amplitude={0.15}
          opacity={variant === "bold" ? 0.9 : 0.6}
        />
      )
    case "waves":
      return (
        <Waves
          lineColor={palette.primary}
          accentColor={palette.accent}
          backgroundColor="transparent"
          lightMode={light}
          opacity={variant === "bold" ? 0.9 : 0.5}
        />
      )
    case "none":
      return null
  }
}

/**
 * Full-bleed background. Always renders the static gradient; layers the
 * lazy WebGL canvas on top only when motion is "full" and after hydration.
 */
export function BackgroundFx({
  kind,
  palette,
  motion,
  variant = "soft",
  opacity = 0.9,
  className,
}: BackgroundFxProps) {
  const animate = kind !== "none" && motion === "full"
  return (
    <div
      aria-hidden="true"
      data-fx={animate ? kind : "static"}
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      style={staticBackdrop(palette)}
    >
      {animate && (
        <ClientOnly fallback={null}>
          <Suspense fallback={null}>
            {/* Blend so the canvas tints the gradient instead of covering it:
                multiply on light palettes, soft-light on dark ones (a bright
                canvas can only tint, never wash out the text). */}
            <div
              className="absolute inset-0"
              style={{
                opacity,
                mixBlendMode:
                  palette.mode === "light" ? "multiply" : "soft-light",
              }}
            >
              <Canvas kind={kind} palette={palette} variant={variant} />
            </div>
          </Suspense>
        </ClientOnly>
      )}
    </div>
  )
}
