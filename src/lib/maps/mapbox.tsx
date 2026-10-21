import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useEffect, useRef } from "react"
import { publicEnv } from "@/env.public"
import { cn } from "@/lib/utils"
import { googleDirectionsUrl } from "./directions"
import { MapFallback } from "./MapFallback"
import type { MapDisplayProvider, MapProps } from "./types"
import { hasCoords } from "./types"

function MapboxMap({ venue, hint, className }: MapProps) {
  const box = useRef<HTMLDivElement>(null)
  const token = publicEnv.VITE_MAPBOX_TOKEN
  const lat = venue.lat
  const lng = venue.lng

  useEffect(() => {
    if (!box.current || !token || lat === undefined || lng === undefined) return
    const map = new mapboxgl.Map({
      container: box.current,
      accessToken: token,
      style:
        hint === "dark"
          ? "mapbox://styles/mapbox/dark-v11"
          : "mapbox://styles/mapbox/light-v11",
      center: [lng, lat],
      zoom: 14.5,
      cooperativeGestures: true,
    })
    new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map)
    return () => map.remove()
  }, [token, lat, lng, hint])

  if (!token || !hasCoords(venue))
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

export const mapboxProvider: MapDisplayProvider = {
  id: "mapbox",
  needsCoordinates: true,
  Map: MapboxMap,
  directionsUrl: googleDirectionsUrl,
}
export default mapboxProvider
