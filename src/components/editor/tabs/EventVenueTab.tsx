import { useServerFn } from "@tanstack/react-start"
import { Crosshair, LoaderCircle, MapPin, Search } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { isShortMapLink, parseMapLink } from "@/lib/maps/parse-link"
import { VenueMap } from "@/lib/maps/registry"
import { geocodeFn, parseMapsLinkFn } from "@/server/geo/geo.functions"
import type { SubEvent } from "@/templates/_shared/schema"
import { useEditor } from "../EditorContext"
import { ListEditor } from "../ListEditor"
import { DateTimeField, Group, NumberField, TextField } from "../fields"

type Candidate = {
  lat: number
  lng: number
  displayName: string
  placeName?: string
}

function LocationTools() {
  const { config, set } = useEditor()
  const geocode = useServerFn(geocodeFn)
  const parseLink = useServerFn(parseMapsLinkFn)
  const venue = config.venue
  const [busy, setBusy] = useState<"find" | "link" | null>(null)
  const [candidates, setCandidates] = useState<Array<Candidate>>([])
  const [link, setLink] = useState("")

  const place = (c: { lat: number; lng: number; placeName?: string }) => {
    set(["venue", "lat"], Number(c.lat.toFixed(6)))
    set(["venue", "lng"], Number(c.lng.toFixed(6)))
    if (c.placeName && !venue.placeName)
      set(["venue", "placeName"], c.placeName)
    setCandidates([])
  }

  const find = async () => {
    const query = [venue.name, venue.address].filter(Boolean).join(", ")
    if (query.length < 3) return toast("Add the venue name or address first.")
    setBusy("find")
    try {
      const { results } = await geocode({ data: { query } })
      if (results.length === 0)
        toast("No match. Try a fuller address, or paste a map link.")
      else if (results.length === 1) place(results[0])
      else setCandidates(results)
    } catch (error) {
      toast.error("Search failed", {
        description: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setBusy(null)
    }
  }

  const useLink = async () => {
    const local = parseMapLink(link)
    if (local) return place(local)
    if (!isShortMapLink(link))
      return toast("No coordinates found in that link.")
    setBusy("link")
    try {
      const parsed = await parseLink({ data: { url: link } })
      if (parsed) place(parsed)
      else toast("No coordinates found in that link.")
    } catch (error) {
      toast.error("Could not open that link", {
        description: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={find}
          disabled={busy !== null}
        >
          {busy === "find" ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <Search aria-hidden="true" />
          )}
          Find on map
        </Button>
      </div>
      {candidates.length > 0 && (
        <ul
          aria-label="Matching places"
          className="flex flex-col gap-1 rounded-xl border border-border p-1"
        >
          {candidates.map((c) => (
            <li key={`${c.lat},${c.lng}`}>
              <button
                type="button"
                onClick={() => place(c)}
                className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                {c.displayName}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="map-link" className="text-sm font-medium">
          Or paste a Google Maps link
        </label>
        <div className="flex gap-2">
          <Input
            id="map-link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://maps.app.goo.gl/…"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={useLink}
            disabled={!link || busy !== null}
          >
            {busy === "link" ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <Crosshair aria-hidden="true" />
            )}
            Use
          </Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          path={["venue", "lat"]}
          label="Latitude"
          step="any"
          min={-90}
          max={90}
          optional
        />
        <NumberField
          path={["venue", "lng"]}
          label="Longitude"
          step="any"
          min={-180}
          max={180}
          optional
        />
      </div>
      <div
        className="inv-root overflow-hidden rounded-xl border border-border"
        data-mode="light"
      >
        <VenueMap venue={venue} hint="light" />
      </div>
    </div>
  )
}

export function EventVenueTab() {
  return (
    <>
      <Group title="Venue">
        <TextField
          path={["venue", "name"]}
          label="Venue name"
          maxLength={120}
        />
        <TextField
          path={["venue", "address"]}
          label="Address"
          maxLength={300}
        />
        <TextField
          path={["venue", "placeName"]}
          label="Place name on maps"
          optional
          maxLength={200}
        />
        <TextField
          path={["venue", "notes"]}
          label="Notes for guests"
          optional
          multiline
          rows={2}
          maxLength={500}
          placeholder="Parking is available at the main gate."
        />
      </Group>
      <Group
        title="Location"
        description="Coordinates give guests an exact pin and directions."
      >
        <LocationTools />
      </Group>
      <Group
        title="Programme"
        description="Ceremony, reception, cake… Leave empty to show just the main event."
      >
        <ListEditor<SubEvent>
          path={["event", "subEvents"]}
          max={10}
          addLabel="Add part"
          itemLabel={(s, i) => s.label || `Part ${i + 1}`}
          create={() => ({
            label: "New part",
            start: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
          })}
        >
          {(_, p) => (
            <>
              <TextField path={[...p, "label"]} label="Name" maxLength={80} />
              <TextField
                path={[...p, "venueRef"]}
                label="Different venue"
                optional
                maxLength={120}
              />
              <DateTimeField path={[...p, "start"]} label="Starts" />
              <DateTimeField path={[...p, "end"]} label="Ends" optional />
            </>
          )}
        </ListEditor>
      </Group>
    </>
  )
}
