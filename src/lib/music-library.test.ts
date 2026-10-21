import { describe, expect, it } from "vitest"
import {
  LIBRARY_FILE,
  MUSIC_LIBRARY,
  availableLibrary,
  libraryTrackUrl,
} from "./music-library"

describe("music library manifest", () => {
  it("has unique ids and storage-safe file names", () => {
    const ids = MUSIC_LIBRARY.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const t of MUSIC_LIBRARY) expect(t.file).toMatch(LIBRARY_FILE)
  })

  it("never offers generated placeholders in production", () => {
    expect(availableLibrary(true).some((t) => t.placeholder)).toBe(false)
    expect(availableLibrary(false)).toHaveLength(MUSIC_LIBRARY.length)
  })

  it("plays through the stable /media/library route", () => {
    expect(libraryTrackUrl({ file: "sketch-calm.wav" })).toBe(
      "/media/library/sketch-calm.wav"
    )
  })

  it("requires a credit and license for every real track", () => {
    for (const t of MUSIC_LIBRARY.filter((x) => !x.placeholder)) {
      expect(t.credit.length).toBeGreaterThan(0)
      expect(t.license.url).toMatch(/^https?:\/\//)
    }
  })
})
