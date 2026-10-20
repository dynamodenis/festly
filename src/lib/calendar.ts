/** Calendar link builders. Pure string work so they are testable and SSR-safe. */

export type CalendarEvent = {
  title: string
  start: string
  end?: string
  timezone: string
  location?: string
  description?: string
}

const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000

/** UTC "basic" format Google and ICS both accept: 20270612T120000Z. */
export function toUtcStamp(iso: string): string {
  return new Date(iso)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "")
}

export function endOrDefault(start: string, end?: string): string {
  return end ?? new Date(Date.parse(start) + DEFAULT_DURATION_MS).toISOString()
}

export function googleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toUtcStamp(event.start)}/${toUtcStamp(endOrDefault(event.start, event.end))}`,
    ctz: event.timezone,
  })
  if (event.location) params.set("location", event.location)
  if (event.description) params.set("details", event.description)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** Path served by the app (Phase 6 implements the route). */
export function icsPath(slug: string): string {
  return `/ics/${encodeURIComponent(slug)}`
}
