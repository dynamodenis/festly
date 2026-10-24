import { useId } from "react"
import type { ReactNode } from "react"

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
  onOpen: () => void
}

/**
 * The closed envelope on the cover. Paper, folds and liner are mixed from the
 * palette (`.inv-env` in styles.css), so each theme gets its own stationery.
 * It only animates while the cover's `data-state` is `opening`; the CSS there
 * owns the timeline (seal breaks, flap folds back, letter slides out).
 *
 * Stacking: back (0) < flap once open (1) < letter (2) < pocket (3) <
 * address (4) < closed flap (5) < seal (6); the letter jumps to 7 once it is
 * out, so it comes forward over the pocket.
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
  onOpen,
}: CoverEnvelopeProps) {
  const pattern = `inv-env-liner-${useId().replace(/:/g, "")}`
  const liner = (
    <defs>
      <pattern
        id={pattern}
        width="6"
        height="6"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <rect width="6" height="6" className="fill-(--env-liner)" />
        <rect width="2.5" height="6" className="fill-(--env-liner-line)" />
      </pattern>
    </defs>
  )

  return (
    <div
      aria-hidden="true"
      onClick={onOpen}
      className="inv-env relative aspect-[7/5] w-[min(86vw,30rem,calc((100svh-21rem)*1.4))] min-w-64 cursor-pointer select-none"
    >
      <div className="inv-env-back inv-env-drop absolute inset-0 rounded-[calc(var(--inv-radius)*0.5)]" />

      <div className="inv-env-letter absolute inset-x-[5%] top-[4%] bottom-[4%] z-[2] flex flex-col overflow-hidden rounded-[calc(var(--inv-radius)*0.4)] border border-inv-line bg-inv-bg text-inv-fg shadow-[0_8px_24px_-12px_rgb(0_0_0/0.35)]">
        {imageUrl && (
          <img
            src={imageUrl}
            alt=""
            decoding="async"
            className="h-[52%] w-full object-cover"
          />
        )}
        <div className="relative flex flex-1 flex-col items-center justify-center gap-1.5 px-4 py-3 text-center">
          {!imageUrl && (
            <div className="inv-frame [--inv-frame-inset:0.6rem]" />
          )}
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
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full [transform:rotateX(180deg)] overflow-visible stroke-(--env-edge) [backface-visibility:hidden]"
          >
            {liner}
            <polygon
              points="0,100 100,100 50,0"
              fill={`url(#${pattern})`}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>

      <div className="absolute top-[52%] left-1/2 z-[6] -translate-x-1/2 -translate-y-1/2">
        <div className="inv-env-seal flex size-22 items-center justify-center rounded-full bg-inv-bg shadow-[0_6px_18px_-6px_rgb(0_0_0/0.45)] ring-1 ring-inv-primary/40 sm:size-26">
          {crest ? (
            <div className="scale-[0.72] sm:scale-[0.8]">{crest}</div>
          ) : (
            <div className="size-12 rounded-full bg-inv-primary ring-4 ring-inv-primary/25 ring-offset-2 ring-offset-inv-bg" />
          )}
        </div>
      </div>
    </div>
  )
}
