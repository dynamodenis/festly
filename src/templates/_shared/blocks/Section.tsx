import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import type { SectionId } from "../schema"
import { Eyebrow } from "./ui"

export type SectionTone = "plain" | "surface" | "tint"

/**
 * The props every section block accepts, so templates can restyle any block
 * the same way: copy (`eyebrow`, `title`), band color (`tone`), extra classes.
 */
export type BlockProps = {
  eyebrow?: string
  title?: string
  tone?: SectionTone
  className?: string
}

export type SectionProps = BlockProps & {
  id: SectionId | (string & {})
  intro?: string
  align?: "center" | "start"
  width?: "narrow" | "regular" | "wide"
  /** Absolutely positioned decoration behind the content. */
  decor?: ReactNode
  children: ReactNode
}

const widths = {
  narrow: "max-w-2xl",
  regular: "max-w-4xl",
  wide: "max-w-6xl",
}

const tones: Record<SectionTone, string | undefined> = {
  plain: undefined,
  surface: "inv-tone-surface",
  tint: "inv-tone-tint",
}

/** Consistent vertical rhythm, heading stack and band tone for every section. */
export function Section({
  id,
  eyebrow,
  title,
  intro,
  align = "center",
  tone = "plain",
  width = "regular",
  decor,
  className,
  children,
}: SectionProps) {
  const headingId = title ? `${id}-title` : undefined
  return (
    <section
      id={id}
      data-section={id}
      data-tone={tone}
      aria-labelledby={headingId}
      className={cn(
        "relative isolate px-5 py-20 sm:px-8 sm:py-28",
        tones[tone],
        className
      )}
    >
      {decor && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        >
          {decor}
        </div>
      )}
      <div className={cn("mx-auto", widths[width])}>
        {(eyebrow || title || intro) && (
          <header
            className={cn(
              "mb-12 flex flex-col gap-4 sm:mb-16",
              align === "center" ? "items-center text-center" : "items-start"
            )}
          >
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            {title && (
              <h2
                id={headingId}
                className="font-inv-display text-4xl leading-[1.1] text-balance sm:text-5xl"
              >
                {title}
              </h2>
            )}
            {intro && (
              <p className="max-w-prose text-base leading-relaxed text-pretty text-inv-muted sm:text-lg">
                {intro}
              </p>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  )
}
