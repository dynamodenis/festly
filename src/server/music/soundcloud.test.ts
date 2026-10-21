// @vitest-environment node
import { describe, expect, it, vi } from "vitest"
import { MusicSource } from "@/templates/_shared/schema"
import {
  SoundCloudError,
  canonicalPermalink,
  parseOEmbed,
  resolveSoundCloud,
} from "./soundcloud.server"

// Shape of a real oEmbed response (soundcloud.com/oembed, fetched 2026-10-20).
const FIXTURE = {
  version: 1,
  type: "rich",
  provider_name: "SoundCloud",
  height: 400,
  width: "100%",
  title: "Flickermood by Forss",
  description: "From the Soulhack album",
  thumbnail_url:
    "https://i1.sndcdn.com/artworks-000067273316-smsiqx-t500x500.jpg",
  html: '<iframe width="100%" height="400" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?visual=true&url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F293&show_artwork=true"></iframe>',
  author_name: "Forss",
  author_url: "https://soundcloud.com/forss",
}

describe("SoundCloud oEmbed parsing", () => {
  it("extracts the stored reference", () => {
    const ref = parseOEmbed(
      FIXTURE,
      "https://soundcloud.com/forss/flickermood?utm_source=x"
    )
    expect(ref).toEqual({
      kind: "soundcloud",
      permalinkUrl: "https://soundcloud.com/forss/flickermood",
      trackId: "293",
      title: "Flickermood",
      artist: "Forss",
      artistUrl: "https://soundcloud.com/forss",
      artworkUrl: FIXTURE.thumbnail_url,
      previewOnly: false,
    })
    expect(MusicSource.safeParse(ref).success).toBe(true)
  })

  it("rejects playlists and payloads without a track", () => {
    const playlist = {
      ...FIXTURE,
      html: FIXTURE.html.replace("tracks%2F293", "playlists%2F42"),
    }
    expect(() =>
      parseOEmbed(playlist, "https://soundcloud.com/a/sets/b")
    ).toThrow(/playlist/)
    expect(() =>
      parseOEmbed({ ...FIXTURE, html: "" }, "https://soundcloud.com/a/b")
    ).toThrow(SoundCloudError)
  })

  it("canonicalizes mobile and tracking URLs", () => {
    expect(
      canonicalPermalink(
        "https://m.soundcloud.com/forss/flickermood/?si=abc#t=1"
      )
    ).toBe("https://soundcloud.com/forss/flickermood")
  })
})

describe("resolveSoundCloud", () => {
  it("follows short links, then calls oEmbed with the canonical URL", async () => {
    const fetchMock = vi.fn<typeof fetch>(async (input) => {
      const url = String(input instanceof Request ? input.url : input)
      if (url.startsWith("https://on.soundcloud.com/")) {
        const res = new Response(null, { status: 200 })
        Object.defineProperty(res, "url", {
          value: "https://soundcloud.com/forss/flickermood?si=1",
        })
        return res
      }
      expect(url).toBe(
        "https://soundcloud.com/oembed?format=json&url=" +
          encodeURIComponent("https://soundcloud.com/forss/flickermood")
      )
      return Response.json(FIXTURE)
    })
    const ref = await resolveSoundCloud(
      "https://on.soundcloud.com/AbCd",
      fetchMock
    )
    expect(ref.trackId).toBe("293")
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("rejects other hosts and explains 404s", async () => {
    await expect(
      resolveSoundCloud("https://evil.example/forss/x")
    ).rejects.toThrow(/soundcloud.com/)
    await expect(
      resolveSoundCloud("http://soundcloud.com/a/b")
    ).rejects.toThrow(/soundcloud.com/)
    const notFound = vi.fn<typeof fetch>(
      async () => new Response(null, { status: 404 })
    )
    await expect(
      resolveSoundCloud("https://soundcloud.com/a/b", notFound)
    ).rejects.toThrow(/private, removed/)
  })
})
