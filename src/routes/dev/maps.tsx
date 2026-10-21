import { createFileRoute } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { useState } from "react"
import { publicEnv } from "@/env.public"
import { directionLinks } from "@/lib/maps/directions"
import { parseMapLink } from "@/lib/maps/parse-link"
import { VenueMap, providerReady } from "@/lib/maps/registry"
import {
  MAP_PROVIDER_IDS,
  type MapHint,
  type VenuePoint,
} from "@/lib/maps/types"
import { geocodeFn } from "@/server/geo/geo.functions"

export const Route = createFileRoute("/dev/maps")({
  head: () => ({ meta: [{ title: "Maps · Festly dev" }] }),
  component: MapsPage,
})

const VENUE: VenuePoint = {
  name: "The Old Mill Gardens",
  address: "Limuru Road, Nairobi, Kenya",
  placeName: "The Old Mill Gardens",
  lat: -1.2195,
  lng: 36.8073,
}

/** Rule 11 playground: one venue through every display adapter, plus geocoding. */
function MapsPage() {
  const [hint, setHint] = useState<MapHint>("light")
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">
        Rule 11 playground
      </p>
      <h1 className="mt-2 text-3xl font-semibold">Map adapters</h1>
      <p className="mt-2 text-muted-foreground">
        Selected for invitations:{" "}
        <code>{publicEnv.VITE_MAP_DISPLAY_PROVIDER}</code>. Adapters without a
        key show the address-card fallback.
      </p>
      <div className="mt-4 flex gap-2">
        {(["light", "dark"] as const).map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => setHint(h)}
            aria-pressed={hint === h}
            className="rounded border px-3 py-1 text-sm aria-pressed:bg-foreground aria-pressed:text-background"
          >
            {h}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {MAP_PROVIDER_IDS.map((id) => (
          <section
            key={id}
            className="inv-root overflow-hidden rounded-xl border"
            data-mode={hint}
          >
            <header className="flex items-center justify-between border-b px-4 py-2 text-sm">
              <code>{id}</code>
              <span
                className={
                  providerReady(id) ? "text-green-700" : "text-amber-700"
                }
              >
                {providerReady(id) ? "ready" : "key missing"}
              </span>
            </header>
            <div
              style={{
                ["--inv-surface" as string]:
                  hint === "dark" ? "#1c1b1a" : "#f5f5f4",
                ["--inv-primary" as string]: "#a8783a",
                ["--inv-muted" as string]: "#78716c",
              }}
            >
              <VenueMap provider={id} venue={VENUE} hint={hint} />
            </div>
          </section>
        ))}
      </div>

      <section className="mt-12 grid gap-8 md:grid-cols-2">
        <GeocodeDemo />
        <LinkDemo />
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">Directions</h2>
        <ul className="mt-3 flex flex-wrap gap-3 text-sm">
          {directionLinks(VENUE).map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

function GeocodeDemo() {
  const geocode = useServerFn(geocodeFn)
  const [query, setQuery] = useState("Karura Forest, Nairobi")
  const [output, setOutput] = useState("")
  const run = async () => {
    setOutput("…")
    try {
      setOutput(JSON.stringify(await geocode({ data: { query } }), null, 2))
    } catch (error) {
      setOutput(error instanceof Error ? error.message : String(error))
    }
  }
  return (
    <div>
      <h2 className="text-xl font-semibold">Geocode (server, cached)</h2>
      <div className="mt-3 flex gap-2">
        <label htmlFor="geo-q" className="sr-only">
          Query
        </label>
        <input
          id="geo-q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded border px-3 py-2"
        />
        <button
          type="button"
          onClick={run}
          className="rounded bg-foreground px-4 text-background"
        >
          Find
        </button>
      </div>
      <pre
        data-testid="geocode-output"
        className="mt-3 max-h-64 overflow-auto rounded bg-muted p-3 text-xs"
      >
        {output}
      </pre>
    </div>
  )
}

function LinkDemo() {
  const [link, setLink] = useState(
    "https://www.google.com/maps/place/Karura+Forest/@-1.24,36.83,15z/data=!3d-1.2405!4d36.8237"
  )
  return (
    <div>
      <h2 className="text-xl font-semibold">Paste a map link</h2>
      <label htmlFor="map-link" className="sr-only">
        Map link
      </label>
      <input
        id="map-link"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        className="mt-3 w-full rounded border px-3 py-2"
      />
      <pre className="mt-3 rounded bg-muted p-3 text-xs">
        {JSON.stringify(parseMapLink(link), null, 2)}
      </pre>
    </div>
  )
}
