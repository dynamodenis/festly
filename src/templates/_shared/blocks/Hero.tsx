import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { dateParts, formatLongDate } from "@/lib/format-date"
import { useInvitation } from "../context"
import { TitleFx, type TitleEffect } from "../effects/TitleFx"
import { Eyebrow } from "./ui"

export type HeroVariant = "classic" | "editorial" | "poster"

type HeroProps = {
  variant?: HeroVariant
  titleEffect?: TitleEffect
  /** Override the big line; defaults to texts.headline. */
  title?: string
  /** Extra classes for the headline, e.g. "inv-foil". */
  titleClassName?: string
  /** Small line above the title; defaults to event.subtitle. */
  kicker?: string
  /** Hide texts.message (when the template places it elsewhere). */
  hideMessage?: boolean
  className?: string
  children?: ReactNode
}

const titleSizes: Record<HeroVariant, string> = {
  classic: "text-6xl leading-[1.02] sm:text-8xl",
  editorial: "text-6xl leading-[0.98] sm:text-8xl lg:text-9xl",
  poster: "text-6xl leading-[0.95] uppercase sm:text-8xl lg:text-9xl",
}

/**
 * The opening screen behind the cover: kicker, headline, message, date.
 * It is also the focus target (`#inv-content`) the cover hands off to.
 */
export function Hero({
  variant = "classic",
  titleEffect = "none",
  title,
  titleClassName,
  kicker,
  hideMessage = false,
  className,
  children,
}: HeroProps) {
  const { config, motion, palette } = useInvitation()
  const { texts, event, datetime } = config
  const parts = dateParts(datetime.start, datetime.timezone)
  const editorial = variant === "editorial"

  return (
    <section
      id="inv-content"
      data-block="hero"
      tabIndex={-1}
      aria-label={title ?? texts.headline}
      className={cn(
        "relative flex min-h-svh flex-col justify-center px-6 py-28 outline-none",
        editorial ? "items-start text-left" : "items-center text-center",
        className
      )}
    >
      <div
        className={cn(
          "relative flex w-full flex-col gap-6",
          editorial
            ? "mx-auto max-w-5xl items-start"
            : "mx-auto max-w-4xl items-center"
        )}
      >
        <Eyebrow className="inv-anim-rise">
          {kicker ?? event.subtitle ?? event.title}
        </Eyebrow>
        <TitleFx
          kind={titleEffect}
          text={title ?? texts.headline}
          motion={motion}
          tag="h1"
          color={palette.primary}
          shineColor={palette.foreground}
          className={cn(
            "font-inv-display text-balance",
            titleSizes[variant],
            titleClassName
          )}
        />
        {!hideMessage && variant !== "poster" && (
          <p className="inv-anim-rise max-w-xl text-lg leading-relaxed text-pretty text-inv-muted [--delay:0.2s] sm:text-xl">
            {texts.message}
          </p>
        )}
        <p
          className={cn(
            "inv-anim-rise mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-inv-display text-xl text-inv-primary [--delay:0.3s] sm:text-2xl",
            !editorial && "justify-center"
          )}
        >
          <time dateTime={datetime.start}>
            {formatLongDate(datetime.start, datetime.timezone)}
          </time>
          <span aria-hidden="true" className="opacity-50">
            ·
          </span>
          <span>{parts.time}</span>
        </p>
        {children}
      </div>
    </section>
  )
}
