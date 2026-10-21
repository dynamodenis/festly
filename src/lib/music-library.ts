/**
 * Festly's curated music library. Metadata lives in music-library.json (managed
 * by `pnpm music:add` / `pnpm music:placeholders`); the audio files live in
 * storage under `library/` and are played from the stable route
 * /media/library/<file>, which redirects to storage. Invitations store only the
 * track id, so files can move without touching saved configs.
 */
import { z } from "zod"
import data from "./music-library.json"

const LibraryTrackSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]{0,60}$/),
  title: z.string().min(1),
  artist: z.string().min(1),
  /** Short mood tags for the picker, e.g. ["calm", "romantic"]. */
  mood: z.array(z.string()),
  license: z.object({ name: z.string().min(1), url: z.url() }),
  /** Credit line shown on invitations that use this track (CC BY requires one). */
  credit: z.string().min(1),
  /** Where the track was obtained (audit trail for CREDITS.md). */
  sourceUrl: z.string().min(1),
  /** File name under library/ in storage. */
  file: z.string(),
  mime: z.string(),
  durationSec: z.number().positive().optional(),
  /** Generated development sketches; never offered in production. */
  placeholder: z.boolean().optional(),
})
export type LibraryTrack = z.infer<typeof LibraryTrackSchema>

/** Validated at import: a malformed manifest entry fails loudly, not at playback. */
export const MUSIC_LIBRARY: ReadonlyArray<LibraryTrack> = z
  .array(LibraryTrackSchema)
  .parse(data)

/** Tracks the editor may offer in this build. */
export function availableLibrary(
  isProd = import.meta.env.PROD
): ReadonlyArray<LibraryTrack> {
  return MUSIC_LIBRARY.filter((t) => !(isProd && t.placeholder))
}

export function libraryTrack(id: string): LibraryTrack | undefined {
  return MUSIC_LIBRARY.find((t) => t.id === id)
}

export function libraryTrackUrl(track: Pick<LibraryTrack, "file">): string {
  return `/media/library/${encodeURIComponent(track.file)}`
}

export const LIBRARY_FILE = /^[a-z0-9][a-z0-9-]{0,60}\.(mp3|m4a|ogg|wav)$/
