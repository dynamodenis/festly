import { libraryTrack, libraryTrackUrl } from "@/lib/music-library"
import { useInvitation } from "../context"
import { AudioElementPlayer } from "./music/AudioElementPlayer"
import { SoundCloudPlayer } from "./music/SoundCloudPlayer"

/**
 * Picks the player for the invitation's music source. Library tracks and
 * uploads use our own audio element; SoundCloud uses its visible widget.
 */
export function MusicPlayer() {
  const { config } = useInvitation()
  const { music } = config
  const source = music.enabled ? music.source : undefined
  if (!source) return null
  const startAt = music.startAtSec ?? 0

  switch (source.kind) {
    case "soundcloud":
      return (
        <SoundCloudPlayer source={source} startAt={startAt} loop={music.loop} />
      )
    case "upload":
      return (
        <AudioElementPlayer
          src={source.url}
          title={source.title}
          startAt={startAt}
          loop={music.loop}
        />
      )
    case "library": {
      const track = libraryTrack(source.trackId)
      if (!track) return null
      return (
        <AudioElementPlayer
          src={libraryTrackUrl(track)}
          title={`${track.title} — ${track.artist}`}
          startAt={startAt}
          loop={music.loop}
        />
      )
    }
  }
}

/** Credit line for the footer (CC BY library tracks and SoundCloud require one). */
export function MusicCredit({ className }: { className?: string }) {
  const { config } = useInvitation()
  const source = config.music.enabled ? config.music.source : undefined
  if (!source || source.kind === "upload") return null
  if (source.kind === "soundcloud") {
    return (
      <p className={className}>
        Music:{" "}
        <a
          href={source.permalinkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-4 hover:underline"
        >
          {source.title}
        </a>{" "}
        by{" "}
        {source.artistUrl ? (
          <a
            href={source.artistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline"
          >
            {source.artist}
          </a>
        ) : (
          source.artist
        )}{" "}
        on SoundCloud
      </p>
    )
  }
  const track = libraryTrack(source.trackId)
  if (!track) return null
  return (
    <p className={className}>
      {track.credit}
      {" · "}
      <a
        href={track.license.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline-offset-4 hover:underline"
      >
        {track.license.name}
      </a>
    </p>
  )
}
