import { useState } from "react"
import type { AnimationEvent, ReactNode } from "react"
import { cn } from "@/lib/utils"
import type { Envelope } from "../schema"

type CoverEnvelopeProps = {
  /** Shown pressed into the wax seal (monogram, badge, rosette). */
  crest?: ReactNode
  /** "Dear {guestName}" written on the front of the envelope. */
  guestName?: string
  /** What the letter shows as it slides out. */
  eyebrow: string
  headline: string
  date: string
  imageUrl?: string
  /** Liner pattern, seal style and stamp (`theme.envelope`). */
  options: Envelope
  /** What the stamp shows, e.g. { month: "Jun", day: "12", year: "2027" }. */
  stampDate: { month: string; day: string; year: string }
  /**
   * Lift the flap for a moment whenever the liner changes, so an editor can
   * see a choice that otherwise only shows while the envelope opens. Turning
   * it off stops a peek in progress.
   */
  peekOnLinerChange?: boolean
  onOpen: () => void
}

/**
 * The closed envelope on the cover. Paper, folds and liner are mixed from the
 * palette (`.inv-env` in styles.css), so each theme gets its own stationery.
 * It only animates while the cover's `data-state` is `opening`; the CSS there
 * owns the timeline (seal breaks, flap folds back, letter slides out).
 *
 * Stacking: back (0) < flap once open (1) < letter (2) < pocket (3) <
 * address (4) < closed flap (5) < seal, stamp (6); the letter jumps to 7 once
 * it is out, so it comes forward over the pocket.
 *
 * `data-liner` and `data-seal` pick the stationery; `.inv-env-liner` paints
 * the liner on both the back and the inside of the flap.
 *
 * `data-peek` plays the editor's liner preview (flap up, hold, down). The
 * root is keyed by it, so every change replays the animation from the start.
 *
 * Decorative: the cover's button is the accessible control. Clicking the
 * envelope itself is a convenience for pointer users.
 */
export function CoverEnvelope({
  crest,
  guestName,
  eyebrow,
  headline,
  date,
  imageUrl,
  options,
  stampDate,
  peekOnLinerChange = false,
  onOpen,
}: CoverEnvelopeProps) {
  // Adjusted during render (not in an effect) so the peek starts with the
  // same paint as the new liner.
  const [peek, setPeek] = useState({
    liner: options.liner,
    count: 0,
    playing: false,
  })
  if (peek.liner !== options.liner) {
    setPeek({
      liner: options.liner,
      count: peekOnLinerChange ? peek.count + 1 : peek.count,
      playing: peekOnLinerChange,
    })
  } else if (peek.playing && !peekOnLinerChange) {
    // Cut short (the envelope is opening): must not replay on reseal.
    setPeek({ ...peek, playing: false })
  }
  // A dead photo link drops the photo instead of showing a broken icon.
  const [failedImage, setFailedImage] = useState<string>()
  const photo = imageUrl !== failedImage ? imageUrl : undefined

  const endPeek = (e: AnimationEvent<HTMLDivElement>) => {
    if (e.animationName === "inv-env-peek-flap")
      setPeek((p) => ({ ...p, playing: false }))
  }

  return (
    <div
      key={peek.count}
      aria-hidden="true"
      data-liner={options.liner}
      data-seal={options.seal}
      data-peek={peek.playing || undefined}
      onAnimationEnd={endPeek}
      onClick={onOpen}
      className="inv-env relative aspect-[7/5] w-[min(86vw,30rem,calc((100svh-21rem)*1.4))] min-w-64 cursor-pointer select-none"
    >
      <div className="inv-env-back inv-env-liner inv-env-drop absolute inset-0 overflow-hidden rounded-[calc(var(--inv-radius)*0.5)]" />

      <div className="inv-env-letter absolute inset-x-[5%] top-[4%] bottom-[4%] z-[2] flex flex-col overflow-hidden rounded-[calc(var(--inv-radius)*0.4)] border border-inv-line bg-inv-bg text-inv-fg shadow-[0_8px_24px_-12px_rgb(0_0_0/0.35)]">
        {photo && (
          <img
            src={photo}
            onError={() => setFailedImage(photo)}
            alt=""
            decoding="async"
            className="h-[52%] w-full object-cover"
          />
        )}
        <div className="relative flex flex-1 flex-col items-center justify-center gap-1.5 px-4 py-3 text-center">
          {!photo && <div className="inv-frame [--inv-frame-inset:0.6rem]" />}
          <span className="text-[0.55rem] font-medium tracking-[0.3em] text-inv-primary uppercase">
            {eyebrow}
          </span>
          <span className="font-inv-display text-xl leading-tight text-balance sm:text-2xl">
            {headline}
          </span>
          <span className="h-px w-10 bg-inv-primary/50" />
          <span className="text-[0.65rem] text-inv-muted">{date}</span>
        </div>
      </div>

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="inv-env-drop absolute inset-0 z-[3] size-full overflow-visible stroke-(--env-edge)"
      >
        <polygon
          points="0,0 52,52 0,100"
          className="fill-(--env-fold)"
          vectorEffect="non-scaling-stroke"
        />
        <polygon
          points="100,0 48,52 100,100"
          className="fill-(--env-fold)"
          vectorEffect="non-scaling-stroke"
        />
        <polygon
          points="0,100 50,46 100,100"
          className="fill-(--env-paper)"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {guestName && (
        <div className="inv-env-drop absolute inset-x-0 bottom-[6%] z-[4] flex flex-col items-center gap-0.5 text-center">
          <span className="text-[0.55rem] tracking-[0.3em] text-inv-muted uppercase">
            Dear
          </span>
          <span className="max-w-[70%] truncate font-inv-display text-lg sm:text-xl">
            {guestName}
          </span>
        </div>
      )}

      <div className="inv-env-flap-wrap absolute inset-x-0 top-0 z-[5] h-[52%] [perspective:1200px]">
        <div className="inv-env-flap relative size-full origin-top [transform-style:preserve-3d]">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full overflow-visible stroke-(--env-edge) [backface-visibility:hidden]"
          >
            <polygon
              points="0,0 100,0 50,100"
              className="fill-(--env-flap)"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="absolute inset-0 [transform:rotateX(180deg)] [backface-visibility:hidden]">
            <div className="inv-env-liner absolute inset-0 [clip-path:polygon(0_100%,100%_100%,50%_0)]" />
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 size-full overflow-visible fill-none stroke-(--env-edge)"
            >
              <polygon
                points="0,100 100,100 50,0"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="inv-env-peek-hide absolute top-[52%] left-1/2 z-[6] -translate-x-1/2 -translate-y-1/2">
        <div className="inv-env-seal relative flex size-22 items-center justify-center rounded-full bg-inv-bg shadow-[0_6px_18px_-6px_rgb(0_0_0/0.45)] ring-1 ring-inv-primary/40 sm:size-26">
          {crest ? (
            <div
              className={cn(
                "inv-env-crest",
                options.seal === "wax"
                  ? "scale-[0.64] sm:scale-[0.72]"
                  : "scale-[0.72] sm:scale-[0.8]"
              )}
            >
              {crest}
            </div>
          ) : (
            <div className="inv-env-crest size-12 rounded-full bg-inv-primary ring-4 ring-inv-primary/25 ring-offset-2 ring-offset-inv-bg" />
          )}
        </div>
      </div>

      {options.stamp && (
        <div className="inv-env-chrome inv-env-peek-hide absolute top-[5%] right-[3.5%] z-[6] w-[15%]">
          <div className="inv-env-stamp aspect-[4/5] rotate-[4deg] p-1 shadow-[0_2px_6px_-2px_rgb(0_0_0/0.35)]">
            <div className="flex size-full flex-col items-center justify-center border border-(--env-edge) bg-(--env-stamp) leading-none text-inv-primary">
              <span className="text-[0.45rem] tracking-[0.2em] uppercase sm:text-[0.55rem]">
                {stampDate.month}
              </span>
              <span className="font-inv-display text-lg sm:text-2xl">
                {stampDate.day}
              </span>
              <span className="text-[0.4rem] tracking-[0.15em] opacity-80 sm:text-[0.5rem]">
                {stampDate.year}
              </span>
            </div>
          </div>
          <svg
            viewBox="0 0 100 60"
            className="absolute top-[38%] right-[55%] w-[150%] fill-none stroke-(--env-edge) opacity-80"
          >
            <circle cx="70" cy="30" r="24" strokeWidth="1.6" />
            <circle cx="70" cy="30" r="18" strokeWidth="0.8" />
            {[18, 26, 34, 42].map((y) => (
              <path
                key={y}
                d={`M0 ${y} q 6 -4 12 0 t 12 0 t 12 0 t 12 0`}
                strokeWidth="1.4"
              />
            ))}
          </svg>
        </div>
      )}
    </div>
  )
}
