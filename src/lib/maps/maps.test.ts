import { describe, expect, it, vi } from "vitest"
import { appleMapsUrl, googleDirectionsUrl, wazeUrl } from "./directions"
import { googleEmbedUrl } from "./google-embed"

const withCoords = {
  name: "The Old Mill Gardens",
  address: "Limuru Road, Nairobi, Kenya",
  lat: -1.2195,
  lng: 36.8073,
}
const addressOnly = { name: "Town Hall", address: "1 Main St, Springfield" }

describe("direction links", () => {
  it("prefer coordinates when present", () => {
    expect(googleDirectionsUrl(withCoords)).toContain(
      "destination=-1.2195%2C36.8073"
    )
    expect(wazeUrl(withCoords)).toContain("ll=-1.2195,36.8073")
    expect(appleMapsUrl(withCoords)).toContain("ll=-1.2195,36.8073")
  })

  it("fall back to a text query", () => {
    expect(googleDirectionsUrl(addressOnly)).toContain(
      encodeURIComponent("Town Hall, 1 Main St, Springfield")
    )
    expect(wazeUrl(addressOnly)).toContain("q=Town%20Hall")
  })
})

describe("googleEmbedUrl", () => {
  it("uses the Embed API when a key is given", () => {
    const url = new URL(googleEmbedUrl(withCoords, "abc"))
    expect(url.pathname).toBe("/maps/embed/v1/place")
    expect(url.searchParams.get("key")).toBe("abc")
    expect(url.searchParams.get("q")).toBe("-1.2195,36.8073")
  })

  it("uses the keyless embed otherwise", () => {
    const url = new URL(googleEmbedUrl(addressOnly, undefined))
    expect(url.hostname).toBe("maps.google.com")
    expect(url.searchParams.get("output")).toBe("embed")
  })
})

describe("map provider registry", () => {
  it("falls back to google-embed when the selected adapter has no key", async () => {
    const { providerReady, selectedMapProvider } = await import("./registry")
    const { parsePublicEnv } = await import("@/env.public")
    const env = parsePublicEnv({ VITE_MAP_DISPLAY_PROVIDER: "mapbox" })
    expect(providerReady("leaflet", env)).toBe(true)
    expect(providerReady("mapbox", env)).toBe(false)
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    expect(selectedMapProvider(env)).toBe("google-embed")
    expect(
      selectedMapProvider(
        parsePublicEnv({
          VITE_MAP_DISPLAY_PROVIDER: "mapbox",
          VITE_MAPBOX_TOKEN: "pk.x",
        })
      )
    ).toBe("mapbox")
    warn.mockRestore()
  })
})
