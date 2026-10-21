// Pull coordinates (and a place name when present) out of a pasted map link.
// Pure, so it runs in the editor instantly; short links are expanded by the
// server first (parseMapsLinkFn) because they need a network redirect.

export type ParsedMapLink = { lat: number; lng: number; placeName?: string }

const num = (s: string | null | undefined) =>
  s === null || s === undefined || s === "" ? NaN : Number(s)
const valid = (lat: number, lng: number) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  Math.abs(lat) <= 90 &&
  Math.abs(lng) <= 180

const PAIR = /(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)/

export const SHORT_LINK_HOSTS = new Set(["maps.app.goo.gl", "goo.gl"])

export function isShortMapLink(raw: string): boolean {
  try {
    const url = new URL(raw)
    return (
      SHORT_LINK_HOSTS.has(url.hostname) &&
      (url.hostname !== "goo.gl" || url.pathname.startsWith("/maps"))
    )
  } catch {
    return false
  }
}

export function parseMapLink(raw: string): ParsedMapLink | null {
  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    // A bare "lat, lng" pair also counts.
    const m = PAIR.exec(raw.trim())
    if (m && m.index === 0) {
      const lat = num(m[1])
      const lng = num(m[2])
      return valid(lat, lng) ? { lat, lng } : null
    }
    return null
  }

  const decoded = decodeURIComponent(url.pathname)
  const placeName =
    /\/place\/([^/@]+)/.exec(decoded)?.[1]?.replace(/\+/g, " ").trim() ||
    undefined

  // Exact pin first: data=!3d<lat>!4d<lng> (the marker, not the viewport).
  const pin = /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/.exec(url.href)
  if (pin && valid(num(pin[1]), num(pin[2])))
    return { lat: num(pin[1]), lng: num(pin[2]), placeName }

  for (const key of ["q", "query", "ll", "destination", "center", "daddr"]) {
    const m = PAIR.exec(url.searchParams.get(key) ?? "")
    if (m && valid(num(m[1]), num(m[2])))
      return { lat: num(m[1]), lng: num(m[2]), placeName }
  }

  // Viewport centre: /@<lat>,<lng>,<zoom>z
  const at = /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/.exec(decoded)
  if (at && valid(num(at[1]), num(at[2])))
    return { lat: num(at[1]), lng: num(at[2]), placeName }

  // Apple Maps / OSM style.
  const mlat = num(url.searchParams.get("mlat"))
  const mlon = num(url.searchParams.get("mlon"))
  if (valid(mlat, mlon)) return { lat: mlat, lng: mlon, placeName }
  return null
}
