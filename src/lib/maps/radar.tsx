import { createMapsPlugin } from "@radarlabs/plugin-maps"
import "@radarlabs/plugin-maps/dist/radar-maps.css"
import Radar from "radar-sdk-js"
import { useEffect, useRef } from "react"
import { publicEnv } from "@/env.public"
import { cn } from "@/lib/utils"
import { googleDirectionsUrl } from "./directions"
import { MapFallback } from "./MapFallback"
import type { MapDisplayProvider, MapProps } from "./types"
import { hasCoords } from "./types"

let initialized = false
function ensureRadar(key: string) {
  if (initialized) return
  Radar.registerPlugin(createMapsPlugin())
  Radar.initialize(key)
  initialized = true
}

function RadarMapView({ venue, hint, className }: MapProps) {
  const box = useRef<HTMLDivElement>(null)
  const key = publicEnv.VITE_RADAR_PUBLISHABLE_KEY
  const lat = venue.lat
  const lng = venue.lng

  useEffect(() => {
    if (!box.current || !key || lat === undefined || lng === undefined) return
    ensureRadar(key)
    const map = Radar.ui.map({
      container: box.current,
      style: hint === "dark" ? "radar-dark-v1" : "radar-light-v1",
      center: [lng, lat],
      zoom: 14,
    })
    Radar.ui.marker({}).setLngLat([lng, lat]).addTo(map)
    return () => map.remove()
  }, [key, lat, lng, hint])

  if (!key || !hasCoords(venue))
    return <MapFallback venue={venue} className={className} />
  return (
    <div
      ref={box}
      role="img"
      aria-label={`Map of ${venue.name}`}
      className={cn("aspect-[4/3] w-full sm:aspect-[16/9]", className)}
    />
  )
}

export const radarProvider: MapDisplayProvider = {
  id: "radar",
  needsCoordinates: true,
  Map: RadarMapView,
  directionsUrl: googleDirectionsUrl,
}
export default radarProvider
