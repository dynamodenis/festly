import { CalendarDays, Clock, MapPin, Shirt } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatLongDate, formatTimeRange, zoneLabel } from "@/lib/format-date"
import { useInvitation } from "../context"
import type { SubEvent } from "../schema"
import { Section, type BlockProps } from "./Section"

export type EventDetailsVariant = "cards" | "timeline" | "single"

type EventDetailsProps = BlockProps & {
  variant?: EventDetailsVariant
}

/** Schedule of sub-events (or the main event when none are set), venue and dress code. */
export function EventDetails({
  variant = "cards",
  eyebrow = "The details",
  title,
  tone,
  className,
}: EventDetailsProps) {
  const { config } = useInvitation()
  const { event, datetime, venue, texts } = config
  const tz = datetime.timezone
  const items: Array<SubEvent> =
    event.subEvents.length > 0
      ? event.subEvents
      : [{ label: event.title, start: datetime.start, end: datetime.end }]
  const layout = variant === "single" || items.length === 1 ? "single" : variant

  return (
    <Section
      id="event"
      tone={tone}
      eyebrow={eyebrow}
      title={title ?? event.title}
      intro={event.subtitle}
      className={className}
    >
      <ol
        className={cn(
          layout === "cards" && "grid gap-6 sm:grid-cols-2",
          layout === "timeline" &&
            "relative ml-3 border-l border-inv-line pl-8 [&>li]:relative [&>li]:pb-10 last:[&>li]:pb-0",
          layout === "single" && "mx-auto max-w-xl"
        )}
      >
        {items.map((item) => (
          <li
            key={item.label + item.start}
            className={cn(
              layout === "cards" &&
                "rounded-inv border border-inv-line bg-inv-surface p-6 sm:p-8",
              layout === "single" &&
                "rounded-inv border border-inv-line bg-inv-surface p-8 text-center"
            )}
          >
            {layout === "timeline" && (
              <span
                aria-hidden="true"
                className="absolute top-1.5 -left-[2.4rem] size-3 rounded-full bg-inv-primary ring-4 ring-inv-bg"
              />
            )}
            <h3 className="font-inv-display text-2xl">{item.label}</h3>
            <dl className="mt-4 flex flex-col gap-2 text-sm text-inv-muted">
              <div className="flex items-center gap-2">
                <CalendarDays
                  className="size-4 shrink-0 text-inv-primary"
                  aria-hidden="true"
                />
                <dt className="sr-only">Date</dt>
                <dd>{formatLongDate(item.start, tz)}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Clock
                  className="size-4 shrink-0 text-inv-primary"
                  aria-hidden="true"
                />
                <dt className="sr-only">Time</dt>
                <dd>
                  {formatTimeRange(item.start, item.end, tz)}{" "}
                  <span className="text-xs">({zoneLabel(item.start, tz)})</span>
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <MapPin
                  className="size-4 shrink-0 text-inv-primary"
                  aria-hidden="true"
                />
                <dt className="sr-only">Venue</dt>
                <dd>{item.venueRef ?? venue.name}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
      {texts.dressCode && (
        <p className="mt-10 flex items-center justify-center gap-2 text-sm text-inv-muted">
          <Shirt className="size-4 text-inv-primary" aria-hidden="true" />
          <span>
            Dress code: <span className="text-inv-fg">{texts.dressCode}</span>
          </span>
        </p>
      )}
    </Section>
  )
}
