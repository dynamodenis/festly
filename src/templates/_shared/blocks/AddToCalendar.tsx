import { CalendarPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { googleCalendarUrl, icsPath } from "@/lib/calendar"
import { useInvitation } from "../context"
import { InvLink } from "./ui"

type AddToCalendarProps = {
  className?: string
  /** Render as a section with its own id, or inline (inside a hero/closing). */
  asSection?: boolean
}

/** Google Calendar link plus the `/ics/$slug` download once a slug exists. */
export function AddToCalendar({
  className,
  asSection = true,
}: AddToCalendarProps) {
  const { config, slug } = useInvitation()
  const { event, datetime, venue, texts } = config
  const google = googleCalendarUrl({
    title: event.title,
    start: datetime.start,
    end: datetime.end,
    timezone: datetime.timezone,
    location: `${venue.name}, ${venue.address}`,
    description: texts.message,
  })

  const links = (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-2",
        className
      )}
    >
      <InvLink
        href={google}
        target="_blank"
        rel="noreferrer noopener"
        variant="outline"
        size="sm"
      >
        <CalendarPlus className="size-3.5" aria-hidden="true" />
        Google Calendar
      </InvLink>
      {slug && (
        <InvLink href={icsPath(slug)} variant="outline" size="sm" download>
          <CalendarPlus className="size-3.5" aria-hidden="true" />
          Apple / Outlook (.ics)
        </InvLink>
      )}
    </div>
  )

  if (!asSection) return links
  return (
    <section id="calendar" data-section="calendar" className="px-6 py-8">
      <h2 className="sr-only">Add to calendar</h2>
      {links}
    </section>
  )
}
