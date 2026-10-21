import { useEffect, useId, useRef, useState } from "react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useHydrated } from "@/hooks/use-hydrated"
import { formatLongDate } from "@/lib/format-date"
import { useInvitation } from "../context"
import { hostNames } from "./hosts"
import { Eyebrow, InvButton } from "./ui"

export type CoverVariant = "curtain" | "split" | "minimal"

type CoverGateProps = {
  variant?: CoverVariant
  /** Hero photo for the `split` variant. */
  imageUrl?: string
  imageAlt?: string
  /** Ornament layer behind the text panel (flourishes, confetti, stars). */
  decor?: ReactNode
  /** Extra content above the eyebrow, e.g. a monogram or badge. */
  crest?: ReactNode
  className?: string
}

/** How long the exit transition runs; also the fallback if transitionend never fires. */
const EXIT_MS = 750

/**
 * The "You are invited" screen.
 *
 * - Server / no-JS: an ordinary first screen (`data-state="inline"`), so the
 *   page is readable and the button simply sits above the content.
 * - Public mode after hydration: a modal gate (`role="dialog"`) that locks
 *   scrolling and takes focus. The tap is the user gesture browsers need for
 *   audio, so it also flips `opened` in context (MusicPlayer listens).
 * - Preview mode: stays inline; the button scrolls to the content.
 */
export function CoverGate({
  variant = "curtain",
  imageUrl,
  imageAlt = "",
  decor,
  crest,
  className,
}: CoverGateProps) {
  const { config, mode, guestName, opened, open, primeMusic, motion } =
    useInvitation()
  const hydrated = useHydrated()
  const [leaving, setLeaving] = useState(false)
  const [gone, setGone] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const gated = hydrated && mode === "public" && !opened

  useEffect(() => {
    if (!gated) return
    const root = document.documentElement
    root.classList.add("inv-scroll-lock")
    buttonRef.current?.focus({ preventScroll: true })
    return () => root.classList.remove("inv-scroll-lock")
  }, [gated])

  useEffect(() => {
    if (!leaving) return
    // Instant exit without motion; otherwise a safety net for transitionend.
    const id = window.setTimeout(
      () => setGone(true),
      motion === "full" ? EXIT_MS + 100 : 0
    )
    return () => window.clearTimeout(id)
  }, [leaving, motion])

  if (gone) return null

  const { texts, event, datetime, hosts } = config
  const handleOpen = () => {
    open()
    const content = document.getElementById("inv-content")
    if (mode === "public") {
      setLeaving(true)
      window.scrollTo({ top: 0 })
      content?.focus({ preventScroll: true })
    } else {
      content?.scrollIntoView({
        behavior: motion === "none" ? "auto" : "smooth",
        block: "start",
      })
    }
  }

  return (
    <div
      data-block="cover"
      data-state={gated ? "gated" : leaving ? "leaving" : "inline"}
      role={gated ? "dialog" : undefined}
      aria-modal={gated ? true : undefined}
      aria-labelledby={titleId}
      onTransitionEnd={(e) => {
        if (leaving && e.target === e.currentTarget) setGone(true)
      }}
      className={cn(
        "relative isolate z-50 flex min-h-svh flex-col overflow-hidden bg-inv-bg text-inv-fg",
        "transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.7,0,0.3,1)] motion-reduce:transition-none",
        (gated || leaving) && "fixed inset-0",
        leaving && "pointer-events-none -translate-y-full opacity-0",
        variant === "split" && "lg:grid lg:grid-cols-2",
        className
      )}
    >
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
        {decor && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
          >
            {decor}
          </div>
        )}
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
            {texts.headline || hostNames(hosts)}
          </h1>
          {variant !== "minimal" && (
            <p className="inv-anim-rise text-base text-inv-muted [--delay:0.3s]">
              {formatLongDate(datetime.start, datetime.timezone)}
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
          <InvButton
            ref={buttonRef}
            size="lg"
            className="inv-anim-rise mt-4 [--delay:0.45s]"
            onPointerDown={primeMusic}
            onClick={handleOpen}
          >
            {texts.coverButtonLabel}
          </InvButton>
        </div>
      </div>
    </div>
  )
}
