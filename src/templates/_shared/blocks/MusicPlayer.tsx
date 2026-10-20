import { useEffect, useRef, useState } from "react"
import { Music2, Pause } from "lucide-react"
import { cn } from "@/lib/utils"
import { libraryTrack } from "@/lib/music-library"
import { useInvitation } from "../context"

type MusicPlayerProps = { className?: string }

/**
 * Floating music toggle. One HTMLAudioElement, created in an effect (never
 * during render). Autoplay is attempted only after the cover's tap; a rejected
 * `play()` turns the chip into "Tap to play" instead of throwing.
 */
export function MusicPlayer({ className }: MusicPlayerProps) {
  const { config, opened, mode } = useInvitation()
  const { music } = config
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const autoTried = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [needsTap, setNeedsTap] = useState(false)
  const [failed, setFailed] = useState(false)

  const src =
    music.enabled && music.source?.kind === "library"
      ? libraryTrack(music.source.trackId)?.src
      : undefined

  useEffect(() => {
    if (!src) return
    const audio = new Audio(src)
    audio.loop = music.loop
    audio.preload = "none"
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onError = () => {
      setPlaying(false)
      setFailed(true)
    }
    const onMeta = () => {
      if (music.startAtSec) audio.currentTime = music.startAtSec
    }
    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("loadedmetadata", onMeta)
    audio.addEventListener("error", onError)
    audioRef.current = audio
    return () => {
      audio.pause()
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("loadedmetadata", onMeta)
      audio.removeEventListener("error", onError)
      audio.src = ""
      audioRef.current = null
    }
  }, [src, music.loop, music.startAtSec])

  useEffect(() => {
    // The cover tap is the user gesture browsers require. Public mode only.
    if (!opened || mode !== "public" || autoTried.current) return
    const audio = audioRef.current
    if (!audio) return
    autoTried.current = true
    audio.play().catch(() => setNeedsTap(true))
  }, [opened, mode])

  // A missing or broken file hides the chip rather than offering dead controls.
  if (!src || failed) return null

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio
        .play()
        .then(() => setNeedsTap(false))
        .catch(() => setNeedsTap(true))
    } else {
      audio.pause()
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? "Pause music" : "Play music"}
      className={cn(
        "fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full border border-inv-line bg-inv-bg/90 px-3 py-2 text-xs text-inv-fg shadow-lg backdrop-blur transition-colors hover:border-inv-primary focus-visible:ring-2 focus-visible:ring-inv-primary focus-visible:outline-none",
        className
      )}
    >
      {playing ? (
        <Pause className="size-4 text-inv-primary" aria-hidden="true" />
      ) : (
        <Music2
          className={cn("size-4 text-inv-primary", needsTap && "animate-pulse")}
          aria-hidden="true"
        />
      )}
      {needsTap && !playing ? "Tap to play" : playing ? "Playing" : "Music"}
    </button>
  )
}
