// Resolve a pasted SoundCloud link into the reference we store, using
// SoundCloud's public oEmbed endpoint (no API key, no audio fetched).
// See reports/Background music catalogs for invitations.md.

export class SoundCloudError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "SoundCloudError"
  }
}

const HOSTS = new Set([
  "soundcloud.com",
  "www.soundcloud.com",
  "m.soundcloud.com",
  "on.soundcloud.com",
])

export function isSoundCloudLink(raw: string): boolean {
  try {
    const url = new URL(raw.trim())
    return url.protocol === "https:" && HOSTS.has(url.hostname)
  } catch {
    return false
  }
}

export type OEmbed = {
  title?: string
  author_name?: string
  author_url?: string
  thumbnail_url?: string
  html?: string
}

export type SoundCloudTrackRef = {
  kind: "soundcloud"
  permalinkUrl: string
  trackId: string
  title: string
  artist: string
  artistUrl?: string
  artworkUrl?: string
  previewOnly: boolean
}

/** Canonical https://soundcloud.com/<artist>/<track> without query or tracking params. */
export function canonicalPermalink(raw: string): string {
  const url = new URL(raw)
  url.hostname = "soundcloud.com"
  url.search = ""
  url.hash = ""
  url.pathname = url.pathname.replace(/\/+$/, "")
  return url.toString()
}

/** Turn an oEmbed payload into a stored track reference, or explain why not. */
export function parseOEmbed(
  data: OEmbed,
  permalink: string
): SoundCloudTrackRef {
  const src = /src="([^"]+)"/.exec(data.html ?? "")?.[1]
  const player = src ? new URL(src.replaceAll("&amp;", "&")) : null
  const api = player?.searchParams.get("url") ?? ""
  if (/\/playlists\//.test(api))
    throw new SoundCloudError(
      "That is a playlist. Paste a link to a single track."
    )
  const trackId = /\/tracks\/(\d+)/.exec(api)?.[1]
  if (!trackId)
    throw new SoundCloudError("Could not find a playable track at that link.")

  const artist = (data.author_name ?? "").trim() || "SoundCloud artist"
  const rawTitle = (data.title ?? "").trim()
  const suffix = ` by ${artist}`
  const title = rawTitle.endsWith(suffix)
    ? rawTitle.slice(0, -suffix.length)
    : rawTitle || "Untitled"
  const https = (u?: string) => (u && u.startsWith("https://") ? u : undefined)

  return {
    kind: "soundcloud",
    permalinkUrl: canonicalPermalink(permalink),
    trackId,
    title: title.slice(0, 200),
    artist: artist.slice(0, 200),
    artistUrl: https(data.author_url),
    artworkUrl: https(data.thumbnail_url),
    previewOnly: false,
  }
}

/** Follow short links, then ask oEmbed. Network calls are injectable for tests. */
export async function resolveSoundCloud(
  raw: string,
  fetchImpl: typeof fetch = fetch
) {
  if (!isSoundCloudLink(raw))
    throw new SoundCloudError(
      "Paste a link that starts with https://soundcloud.com/"
    )
  let permalink = raw.trim()
  const signal = () => AbortSignal.timeout(8000)

  if (new URL(permalink).hostname === "on.soundcloud.com") {
    const res = await fetchImpl(permalink, {
      method: "HEAD",
      redirect: "follow",
      signal: signal(),
    })
    if (
      !isSoundCloudLink(res.url) ||
      new URL(res.url).hostname === "on.soundcloud.com"
    ) {
      throw new SoundCloudError(
        "That short link did not lead to a SoundCloud track."
      )
    }
    permalink = res.url
  }

  const endpoint = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(canonicalPermalink(permalink))}`
  const res = await fetchImpl(endpoint, {
    headers: { Accept: "application/json" },
    signal: signal(),
  })
  if (res.status === 404)
    throw new SoundCloudError(
      "That track is private, removed, or does not allow embedding."
    )
  if (!res.ok)
    throw new SoundCloudError("SoundCloud did not respond. Please try again.")
  return parseOEmbed((await res.json()) as OEmbed, permalink)
}
