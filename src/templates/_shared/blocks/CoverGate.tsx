import { useEffect, useId, useRef, useState } from "react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useHydrated } from "@/hooks/use-hydrated"
import { formatLongDate } from "@/lib/format-date"
import { useInvitation } from "../context"
import type { CoverReveal } from "../schema"
import type { EffectiveMotion } from "../theme/motion"
import { CoverEnvelope } from "./CoverEnvelope"
import { hostNames } from "./hosts"
import { Eyebrow, InvButton } from "./ui"

export type CoverVariant = "curtain" | "split" | "minimal"

type CoverGateProps = {
  variant?: CoverVariant
  /**
   * How the cover gets out of the way. Defaults to the invitation's
   * `theme.coverReveal` (the creator's choice in the editor):
   * - `envelope`: a sealed envelope; the flap folds back and the letter slides out.
   * - `lift`: the whole screen slides up (the `variant` layouts).
   */
  reveal?: CoverReveal
  /** Hero photo: beside the text (`split`) or on the letter (`envelope`). */
  imageUrl?: string
  imageAlt?: string
  /** Ornament layer behind the text panel (flourishes, confetti, stars). */
  decor?: ReactNode
  /** Extra content above the eyebrow, e.g. a monogram or badge. Pressed into the seal for `envelope`. */
  crest?: ReactNode
  className?: string
}

/**
 * How long each reveal runs at each motion level. Must match the timeline in
 * styles.css (`.inv-env*`); the cover is removed when it elapses.
 */
const REVEAL_MS: Record<CoverReveal, Record<EffectiveMotion, number>> = {
  envelope: { full: 2400, reduced: 450, none: 0 },
  lift: { full: 850, reduced: 0, none: 0 },
}

/**
 * The "You are invited" screen.
 *
 * - Server / no-JS: an ordinary first screen (`data-state="inline"`), so the
 *   page is readable and the button simply sits above the content.
 * - Public mode after hydration: a modal gate (`role="dialog"`) that locks
 *   scrolling and takes focus. The tap is the user gesture browsers need for
 *   audio, so it also flips `opened` in context (MusicPlayer listens). The
 *   reveal plays over the page, then the gate unmounts.
 * - Preview mode: stays inline. The envelope still opens, then the page jumps
 *   to the content and the envelope reseals so it can be replayed.
 */
export function CoverGate({
  variant = "curtain",
  reveal: revealProp,
  imageUrl,
  imageAlt = "",
  decor,
  crest,
  className,
}: CoverGateProps) {
  const { config, mode, guestName, opened, open, primeMusic, motion } =
    useInvitation()
  const hydrated = useHydrated()
  const reveal = revealProp ?? config.theme.coverReveal
  const [opening, setOpening] = useState(false)
  const [gone, setGone] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const gated = hydrated && mode === "public" && !opened
  const overlay = !gone && (gated || (opening && mode === "public"))

  useEffect(() => {
    if (!overlay) return
    const root = document.documentElement
    root.classList.add("inv-scroll-lock")
    return () => root.classList.remove("inv-scroll-lock")
  }, [overlay])

  useEffect(() => {
    if (gated) buttonRef.current?.focus({ preventScroll: true })
  }, [gated])

  useEffect(() => {
    if (!opening) return
    const id = window.setTimeout(() => {
      const content = document.getElementById("inv-content")
      if (mode === "public") {
        setGone(true)
        content?.focus({ preventScroll: true })
      } else {
        // The cover has faded out, so an instant jump is invisible.
        content?.scrollIntoView({ behavior: "auto", block: "start" })
        setOpening(false)
      }
    }, REVEAL_MS[reveal][motion])
    return () => window.clearTimeout(id)
  }, [opening, mode, reveal, motion])

  if (gone) return null

  const { texts, event, datetime, hosts } = config
  const headline = texts.headline || hostNames(hosts)
  const date = formatLongDate(datetime.start, datetime.timezone)
  const envelope = reveal === "envelope"

  const handleOpen = () => {
    if (opening) return
    open()
    if (mode === "public") {
      window.scrollTo({ top: 0 })
      setOpening(true)
    } else if (envelope) {
      setOpening(true)
    } else {
      document.getElementById("inv-content")?.scrollIntoView({
        behavior: motion === "none" ? "auto" : "smooth",
        block: "start",
      })
    }
  }

  const button = (
    <InvButton
      ref={buttonRef}
      size="lg"
      className="inv-anim-rise mt-4 [--delay:0.45s]"
      onPointerDown={primeMusic}
      onClick={handleOpen}
      aria-busy={opening || undefined}
    >
      {texts.coverButtonLabel}
    </InvButton>
  )

  const decorLayer = decor && (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {decor}
    </div>
  )

  return (
    <div
      data-block="cover"
      data-reveal={reveal}
      data-state={gated ? "gated" : opening ? "opening" : "inline"}
      role={gated ? "dialog" : undefined}
      aria-modal={gated ? true : undefined}
      aria-labelledby={titleId}
      className={cn(
        "relative isolate z-50 flex min-h-svh flex-col overflow-hidden bg-inv-bg text-inv-fg",
        overlay && "fixed inset-0",
        opening && "pointer-events-none",
        !envelope &&
          "transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.7,0,0.3,1)] motion-reduce:transition-none",
        !envelope && opening && "-translate-y-full opacity-0",
        !envelope && variant === "split" && "lg:grid lg:grid-cols-2",
        className
      )}
    >
      {envelope ? (
        <div className="relative isolate flex flex-1 flex-col">
          {decorLayer}
          <div className="relative mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center sm:gap-8">
            <div className="inv-env-chrome flex flex-col items-center gap-3">
              <Eyebrow className="inv-anim-rise">{texts.coverTitle}</Eyebrow>
              <h1
                id={titleId}
                className="inv-anim-rise font-inv-display text-4xl leading-[1.05] text-balance [--delay:0.1s] sm:text-6xl"
              >
                {headline}
              </h1>
              <p className="inv-anim-rise text-sm text-inv-muted [--delay:0.2s] sm:text-base">
                {date}
                <span className="sr-only"> · {event.title}</span>
              </p>
            </div>
            <div className="inv-anim-rise [--delay:0.3s]">
              <CoverEnvelope
                crest={crest}
                guestName={guestName}
                eyebrow={texts.coverTitle}
                headline={headline}
                date={date}
                imageUrl={imageUrl}
                onOpen={handleOpen}
              />
            </div>
            <div className="inv-env-chrome">{button}</div>
          </div>
        </div>
      ) : (
        <>
          {variant === "split" && imageUrl && (
            <div className="relative h-[42svh] lg:h-auto">
              <img
                src={imageUrl}
                alt={imageAlt}
                className="absolute inset-0 h-full w-full object-cover"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-inv-bg via-inv-bg/10 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-inv-bg/30" />
            </div>
          )}

          <div className="relative isolate flex flex-1 flex-col">
            {decorLayer}
            <div
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-6 px-8 py-20 text-center",
                variant === "minimal" ? "mx-auto max-w-md" : "mx-auto max-w-2xl"
              )}
            >
              {crest && <div className="inv-anim-rise">{crest}</div>}
              <Eyebrow className="inv-anim-rise [--delay:0.1s]">
                {texts.coverTitle}
              </Eyebrow>
              <h1
                id={titleId}
                className={cn(
                  "inv-anim-rise font-inv-display leading-[1.02] text-balance [--delay:0.2s]",
                  variant === "minimal"
                    ? "text-4xl sm:text-5xl"
                    : "text-5xl sm:text-7xl"
                )}
              >
                {headline}
              </h1>
              {variant !== "minimal" && (
                <p className="inv-anim-rise text-base text-inv-muted [--delay:0.3s]">
                  {date}
                  <span className="sr-only"> · {event.title}</span>
                </p>
              )}
              {guestName && (
                <div className="inv-anim-rise mt-2 flex flex-col items-center gap-1 [--delay:0.35s]">
                  <span className="text-[0.65rem] tracking-[0.3em] text-inv-muted uppercase">
                    Dear
                  </span>
                  <span className="font-inv-display text-2xl">{guestName}</span>
                </div>
              )}
              {button}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
