import { ClientOnly } from "@tanstack/react-router"
import { Suspense, lazy } from "react"
import type { ComponentType, LazyExoticComponent } from "react"
import { publicEnv, type PublicEnv } from "@/env.public"
import { googleEmbedProvider } from "./google-embed"
import { MapFallback } from "./MapFallback"
import type { MapDisplayProvider, MapProps, MapProviderId } from "./types"

type Loader = () => Promise<{ default: MapDisplayProvider }>

/** Interactive adapters, imported only when selected (or on /dev/maps). */
const LOADERS: Record<Exclude<MapProviderId, "google-embed">, Loader> = {
  "google-js": () => import("./google-js"),
  mapbox: () => import("./mapbox"),
  radar: () => import("./radar"),
  leaflet: () => import("./leaflet"),
}

/** Which keys each adapter needs; a missing key falls back to google-embed. */
export function providerReady(
  id: MapProviderId,
  env: Pick<
    PublicEnv,
    | "VITE_GOOGLE_MAPS_JS_KEY"
    | "VITE_MAPBOX_TOKEN"
    | "VITE_RADAR_PUBLISHABLE_KEY"
  > = publicEnv
): boolean {
  switch (id) {
    case "google-js":
      return !!env.VITE_GOOGLE_MAPS_JS_KEY
    case "mapbox":
      return !!env.VITE_MAPBOX_TOKEN
    case "radar":
      return !!env.VITE_RADAR_PUBLISHABLE_KEY
    case "google-embed":
    case "leaflet":
      return true
  }
}

export function selectedMapProvider(env: PublicEnv = publicEnv): MapProviderId {
  const id = env.VITE_MAP_DISPLAY_PROVIDER
  if (providerReady(id, env)) return id
  console.warn(
    `[maps] ${id} selected but its key is missing; using google-embed`
  )
  return "google-embed"
}

type LazyMap = LazyExoticComponent<ComponentType<MapProps>>
const lazyMap = (loader: Loader): LazyMap =>
  lazy(async () => ({ default: (await loader()).default.Map }))

// Created once at module load so component identity is stable across renders.
const LAZY_MAPS: Record<Exclude<MapProviderId, "google-embed">, LazyMap> = {
  "google-js": lazyMap(LOADERS["google-js"]),
  mapbox: lazyMap(LOADERS.mapbox),
  radar: lazyMap(LOADERS.radar),
  leaflet: lazyMap(LOADERS.leaflet),
}

/**
 * Render a venue with an adapter: the iframe embed renders on the server;
 * interactive adapters load on the client behind the address-card fallback.
 */
export function VenueMap({
  provider = selectedMapProvider(),
  ...props
}: MapProps & { provider?: MapProviderId }) {
  if (provider === "google-embed") return <googleEmbedProvider.Map {...props} />
  const Lazy = LAZY_MAPS[provider]
  const fallback = (
    <MapFallback venue={props.venue} className={props.className} />
  )
  return (
    <ClientOnly fallback={fallback}>
      <Suspense fallback={fallback}>
        <Lazy {...props} />
      </Suspense>
    </ClientOnly>
  )
}
