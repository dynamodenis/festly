// @vitest-environment node
// Contract test (rule 11): every geocoder, fed its provider's real response
// format, must return the same GeocodeResult shape.
import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest"
import * as schema from "@/server/db/schema"
import { geocodeCached, normalizeQuery, queryHash } from "./geocode.server"
import {
  googleProvider,
  mapboxProvider,
  nominatimProvider,
  nominatimSlot,
  radarProvider,
  resetNominatimThrottle,
} from "./providers.server"
import { GeocodeError, type GeocodeProvider } from "./types"

const LAT = -1.2195
const LNG = 36.8073
const ADDRESS = "Limuru Road, Nairobi, Kenya"

const FIXTURES: Array<{
  name: string
  provider: GeocodeProvider
  body: unknown
  urlPrefix: string
}> = [
  {
    name: "nominatim",
    provider: nominatimProvider({
      userAgent: "Festly/test (dev@festly.local)",
      email: "dev@festly.local",
    }),
    urlPrefix: "https://nominatim.openstreetmap.org/search?",
    body: [
      {
        lat: String(LAT),
        lon: String(LNG),
        display_name: ADDRESS,
        name: "Old Mill",
      },
    ],
  },
  {
    name: "google",
    provider: googleProvider("g-key"),
    urlPrefix: "https://maps.googleapis.com/maps/api/geocode/json?",
    body: {
      status: "OK",
      results: [
        {
          formatted_address: ADDRESS,
          geometry: { location: { lat: LAT, lng: LNG } },
        },
      ],
    },
  },
  {
    name: "mapbox",
    provider: mapboxProvider("mb-token"),
    urlPrefix: "https://api.mapbox.com/search/geocode/v6/forward?",
    body: {
      features: [
        {
          geometry: { coordinates: [LNG, LAT] },
          properties: { full_address: ADDRESS, name: "Old Mill" },
        },
      ],
    },
  },
  {
    name: "radar",
    provider: radarProvider("prj_test_sk"),
    urlPrefix: "https://api.radar.io/v1/geocode/forward?",
    body: {
      addresses: [{ latitude: LAT, longitude: LNG, formattedAddress: ADDRESS }],
    },
  },
]

beforeEach(() => resetNominatimThrottle())

describe.each(FIXTURES)(
  "$name geocoder",
  ({ provider, body, urlPrefix, name }) => {
    it("returns the shared result shape", async () => {
      const fetchMock = vi.fn<typeof fetch>(async () => Response.json(body))
      const [result] = await provider.geocode("old mill limuru", {
        limit: 5,
        fetch: fetchMock,
      })
      expect(result).toMatchObject({ lat: LAT, lng: LNG, displayName: ADDRESS })
      expect(
        Object.keys(result).every((k) =>
          ["lat", "lng", "displayName", "placeName"].includes(k)
        )
      ).toBe(true)
      const [url, init] = fetchMock.mock.calls[0]
      expect(String(url).startsWith(urlPrefix)).toBe(true)
      if (name === "nominatim") {
        expect(new Headers(init?.headers).get("User-Agent")).toContain("Festly")
        expect(String(url)).toContain("format=jsonv2")
      }
    })

    it("reports rate limiting and failures as GeocodeError", async () => {
      const limited = vi.fn<typeof fetch>(
        async () => new Response(null, { status: 429 })
      )
      await expect(
        provider.geocode("x", { limit: 1, fetch: limited })
      ).rejects.toBeInstanceOf(GeocodeError)
    })
  }
)

describe("Nominatim throttle", () => {
  it("spaces calls at least one second apart", async () => {
    let clock = 10_000
    const waits: Array<number> = []
    const now = () => clock
    const wait = async (ms: number) => {
      waits.push(ms)
      clock += ms
    }
    await nominatimSlot(now, wait)
    clock += 200
    await nominatimSlot(now, wait)
    await nominatimSlot(now, wait)
    expect(waits).toEqual([800, 1000])
  })
})

describe("geocodeCached", () => {
  const client = new PGlite()
  const db = drizzle(client, { schema, casing: "snake_case" })
  beforeAll(async () => migrate(db, { migrationsFolder: "./drizzle" }), 30_000)
  afterAll(async () => client.close())

  it("hits the provider once, then serves the normalized query from cache", async () => {
    const provider = FIXTURES[1].provider
    const fetchMock = vi.fn<typeof fetch>(async () =>
      Response.json(FIXTURES[1].body)
    )
    const first = await geocodeCached(
      db,
      provider,
      "  The Old  Mill,  NAIROBI ",
      fetchMock
    )
    const second = await geocodeCached(
      db,
      provider,
      "the old mill, nairobi",
      fetchMock
    )
    expect(first.cached).toBe(false)
    expect(second).toEqual({
      cached: true,
      results: [{ lat: LAT, lng: LNG, displayName: ADDRESS }],
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("does not cache empty results", async () => {
    const provider = FIXTURES[1].provider
    const fetchMock = vi.fn<typeof fetch>(async () =>
      Response.json({ status: "ZERO_RESULTS", results: [] })
    )
    expect(
      (await geocodeCached(db, provider, "nowhere at all", fetchMock)).results
    ).toEqual([])
    expect(
      (await geocodeCached(db, provider, "nowhere at all", fetchMock)).cached
    ).toBe(false)
  })

  it("keys the cache by provider and normalized text", () => {
    expect(normalizeQuery("  A   B ")).toBe("a b")
    expect(queryHash("google", "A b")).toBe(queryHash("google", " a  B"))
    expect(queryHash("google", "a b")).not.toBe(queryHash("mapbox", "a b"))
  })
})
