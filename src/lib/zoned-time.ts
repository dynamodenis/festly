// Convert between ISO instants (with offset) and wall-clock "YYYY-MM-DDTHH:mm"
// in a given IANA time zone, so date inputs show the event's local time no
// matter where the host is editing from.

const pad = (n: number) => String(n).padStart(2, "0")

/** Offset of `timeZone` at instant `ms`, in minutes east of UTC. */
export function zoneOffsetMinutes(timeZone: string, ms: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(ms))
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value)
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second")
  )
  return Math.round((asUtc - Math.floor(ms / 1000) * 1000) / 60000)
}

function formatOffset(minutes: number): string {
  const sign = minutes >= 0 ? "+" : "-"
  const abs = Math.abs(minutes)
  return `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
}

/** ISO instant → "YYYY-MM-DDTHH:mm" as seen in `timeZone`. */
export function toZonedInput(iso: string, timeZone: string): string {
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) return ""
  const local = new Date(ms + zoneOffsetMinutes(timeZone, ms) * 60000)
  return `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}T${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`
}

/** "YYYY-MM-DDTHH:mm" in `timeZone` → ISO with that zone's offset at that moment. */
export function fromZonedInput(local: string, timeZone: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(local)
  if (!m) return null
  const wall = Date.UTC(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    Number(m[4]),
    Number(m[5])
  )
  // Two passes settle the offset across DST transitions.
  let offset = zoneOffsetMinutes(timeZone, wall)
  offset = zoneOffsetMinutes(timeZone, wall - offset * 60000)
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00${formatOffset(offset)}`
}

/** Every IANA zone the runtime knows (falls back to a short list). */
export function timeZones(): Array<string> {
  try {
    return Intl.supportedValuesOf("timeZone")
  } catch {
    return [
      "UTC",
      "Africa/Nairobi",
      "Africa/Lagos",
      "Europe/London",
      "America/New_York",
      "Asia/Jakarta",
    ]
  }
}
