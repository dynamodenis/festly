import { cn } from "@/lib/utils"
import { useNow } from "@/hooks/use-now"
import { countdownParts } from "@/lib/countdown"
import { formatLongDate } from "@/lib/format-date"
import { useInvitation } from "../context"
import { Section, type BlockProps } from "./Section"

export type CountdownVariant = "boxes" | "inline" | "ring"

type CountdownProps = BlockProps & {
  variant?: CountdownVariant
  doneLabel?: string
}

const UNITS = ["days", "hours", "minutes", "seconds"] as const

/**
 * Counts down to `datetime.start`. The server renders "--" placeholders so
 * hydration matches; the shared one-second clock (useNow) starts after mount.
 * Screen readers get one static sentence instead of a ticking region.
 */
export function Countdown({
  variant = "boxes",
  eyebrow = "Counting down",
  title,
  tone,
  doneLabel = "The day is here",
  className,
}: CountdownProps) {
  const { config } = useInvitation()
  const now = useNow()
  const { start, timezone } = config.datetime
  const parts = now === null ? null : countdownParts(Date.parse(start), now)
  const pad = (n: number) => String(n).padStart(2, "0")

  return (
    <Section
      id="countdown"
      eyebrow={eyebrow}
      title={title ?? formatLongDate(start, timezone)}
      tone={tone}
      width="narrow"
      className={className}
    >
      {parts?.done ? (
        <p className="text-center font-inv-display text-4xl text-inv-primary">
          {doneLabel}
        </p>
      ) : (
        <>
          <p className="sr-only">
            {parts
              ? `${parts.days} days to go.`
              : `Starts ${formatLongDate(start, timezone)}.`}
          </p>
          <dl
            aria-hidden="true"
            className={cn(
              variant === "inline"
                ? "grid grid-cols-4 divide-x divide-inv-line"
                : "grid grid-cols-4 gap-2 sm:gap-4"
            )}
          >
            {UNITS.map((unit) => (
              <div
                key={unit}
                className={cn(
                  "flex flex-col-reverse items-center gap-1 text-center",
                  variant === "boxes" &&
                    "rounded-inv border border-inv-line bg-inv-surface px-1 py-5 shadow-[0_1px_0_var(--inv-line)] sm:py-7",
                  variant === "ring" &&
                    "relative aspect-square justify-center rounded-full",
                  variant === "inline" && "px-1"
                )}
              >
                {variant === "ring" && (
                  <svg
                    viewBox="0 0 100 100"
                    className="absolute inset-0 -rotate-90"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      fill="none"
                      stroke="var(--inv-line)"
                      strokeWidth="3"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      fill="none"
                      stroke="var(--inv-primary)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      pathLength={100}
                      strokeDasharray={`${ringFill(unit, parts)} 100`}
                      className="transition-[stroke-dasharray] duration-700"
                    />
                  </svg>
                )}
                <dt className="text-[0.6rem] tracking-[0.22em] text-inv-muted uppercase sm:text-[0.65rem]">
                  {unit}
                </dt>
                <dd className="font-inv-display text-3xl leading-none tabular-nums sm:text-5xl">
                  {parts ? pad(parts[unit]) : "--"}
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </Section>
  )
}

/** Ring fill (0..100) for each unit relative to its own range. */
function ringFill(
  unit: (typeof UNITS)[number],
  parts: ReturnType<typeof countdownParts> | null
): number {
  if (!parts) return 0
  const max = { days: 365, hours: 24, minutes: 60, seconds: 60 }[unit]
  return Math.min(100, Math.round((parts[unit] / max) * 100))
}
