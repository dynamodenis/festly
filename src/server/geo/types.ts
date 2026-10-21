/** One shape for every geocoder (contract-tested in geocoders.test.ts). */
export type GeocodeResult = {
  lat: number
  lng: number
  /** Full formatted address. */
  displayName: string
  /** Short place name when the provider has one ("The Old Mill Gardens"). */
  placeName?: string
}

export type GeocodeProviderId = "nominatim" | "google" | "mapbox" | "radar"

export interface GeocodeProvider {
  id: GeocodeProviderId
  /** Up to `limit` candidates, best first; [] when nothing matches. */
  geocode: (
    query: string,
    opts: { limit: number; fetch: typeof fetch; signal?: AbortSignal }
  ) => Promise<Array<GeocodeResult>>
}

export class GeocodeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "GeocodeError"
  }
}

export const inRange = (lat: number, lng: number) =>
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  Math.abs(lat) <= 90 &&
  Math.abs(lng) <= 180
