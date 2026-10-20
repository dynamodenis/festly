/** Locale- and zone-aware formatting for invitation dates. All inputs are ISO strings with offsets. */

export type DateParts = {
  weekday: string
  day: string
  month: string
  year: string
  time: string
}

const cache = new Map<string, Intl.DateTimeFormat>()
function fmt(locale: string, options: Intl.DateTimeFormatOptions) {
  const key = locale + JSON.stringify(options)
  let f = cache.get(key)
  if (!f) {
    f = new Intl.DateTimeFormat(locale, options)
    cache.set(key, f)
  }
  return f
}

export function formatLongDate(
  iso: string,
  timeZone: string,
  locale = "en"
): string {
  return fmt(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(new Date(iso))
}

export function formatTime(
  iso: string,
  timeZone: string,
  locale = "en"
): string {
  return fmt(locale, { hour: "numeric", minute: "2-digit", timeZone }).format(
    new Date(iso)
  )
}

export function formatTimeRange(
  start: string,
  end: string | undefined,
  timeZone: string,
  locale = "en"
): string {
  const from = formatTime(start, timeZone, locale)
  return end ? `${from} – ${formatTime(end, timeZone, locale)}` : from
}

export function dateParts(
  iso: string,
  timeZone: string,
  locale = "en"
): DateParts {
  const parts = fmt(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  }).formatToParts(new Date(iso))
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ""
  const dayPeriod = get("dayPeriod")
  return {
    weekday: get("weekday"),
    day: get("day"),
    month: get("month"),
    year: get("year"),
    time: `${get("hour")}:${get("minute")}${dayPeriod ? " " + dayPeriod : ""}`,
  }
}

/** Short zone label such as "EAT" or "GMT+3" for the given instant. */
export function zoneLabel(iso: string, timeZone: string, locale = "en") {
  return (
    fmt(locale, { timeZoneName: "short", timeZone })
      .formatToParts(new Date(iso))
      .find((p) => p.type === "timeZoneName")?.value ?? timeZone
  )
}
