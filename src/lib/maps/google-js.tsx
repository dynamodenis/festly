import {
  APIProvider,
  ColorScheme,
  Map,
  Marker,
} from "@vis.gl/react-google-maps"
import { publicEnv } from "@/env.public"
import { cn } from "@/lib/utils"
import { googleDirectionsUrl } from "./directions"
import { MapFallback } from "./MapFallback"
import type { MapDisplayProvider, MapProps } from "./types"
import { hasCoords } from "./types"

function GoogleJsMap({ venue, hint, className }: MapProps) {
  const key = publicEnv.VITE_GOOGLE_MAPS_JS_KEY
  if (!key || !hasCoords(venue))
    return <MapFallback venue={venue} className={className} />
  const center = { lat: venue.lat, lng: venue.lng }
  return (
    <APIProvider apiKey={key}>
      <Map
        defaultCenter={center}
        defaultZoom={15}
        gestureHandling="cooperative"
        colorScheme={hint === "dark" ? ColorScheme.DARK : ColorScheme.LIGHT}
        className={cn("aspect-[4/3] w-full sm:aspect-[16/9]", className)}
      >
        <Marker position={center} title={venue.name} />
      </Map>
    </APIProvider>
  )
}

export const googleJsProvider: MapDisplayProvider = {
  id: "google-js",
  needsCoordinates: true,
  Map: GoogleJsMap,
  directionsUrl: googleDirectionsUrl,
}
export default googleJsProvider
