import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { MapContainer, Marker, TileLayer } from "react-leaflet"
import { cn } from "@/lib/utils"
import { googleDirectionsUrl } from "./directions"
import { MapFallback } from "./MapFallback"
import type { MapDisplayProvider, MapProps } from "./types"
import { hasCoords } from "./types"

// An inline SVG pin: Leaflet's default marker images break under bundlers.
const pin = L.divIcon({
  className: "",
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  html: '<svg viewBox="0 0 28 40" width="28" height="40"><path d="M14 0C6.3 0 0 6.2 0 13.9 0 24.3 14 40 14 40s14-15.7 14-26.1C28 6.2 21.7 0 14 0Z" fill="currentColor"/><circle cx="14" cy="14" r="5" fill="white"/></svg>',
})

function LeafletMap({ venue, hint, className }: MapProps) {
  if (!hasCoords(venue))
    return <MapFallback venue={venue} className={className} />
  const center: [number, number] = [venue.lat, venue.lng]
  return (
    <MapContainer
      center={center}
      zoom={15}
      scrollWheelZoom={false}
      className={cn(
        "z-0 aspect-[4/3] w-full text-inv-primary sm:aspect-[16/9]",
        hint === "dark" &&
          "[&_.leaflet-tile]:brightness-[0.65] [&_.leaflet-tile]:hue-rotate-180 [&_.leaflet-tile]:invert",
        className
      )}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center} icon={pin} title={venue.name} />
    </MapContainer>
  )
}

/** Keyless (OpenStreetMap tiles; follow the OSM tile usage policy at scale). */
export const leafletProvider: MapDisplayProvider = {
  id: "leaflet",
  needsCoordinates: true,
  Map: LeafletMap,
  directionsUrl: googleDirectionsUrl,
}
export default leafletProvider
