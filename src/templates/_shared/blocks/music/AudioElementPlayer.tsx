import { Music2, Pause } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { useInvitation } from "../../context"

type Props = { src: string; title?: string; startAt: number; loop: boolean }

/**
 * Library tracks and host uploads: one same-document <audio> element, the
 * only approach that starts reliably from the cover tap on every phone.
 * Created after mount (never during render, so SSR stays clean).
 */
export function AudioElementPlayer({ src, title, startAt, loop }: Props) {
  const { mode, opened, registerMusic } = useInvitation()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const started = useRef(false)
  const resumeOnShow = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [needsTap, setNeedsTap] = useState(false)

  useEffect(() => {
    const audio = new Audio()
    audio.preload = "none"
    audio.loop = loop
    audio.src = src
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onError = () => {
      setPlaying(false)
      setNeedsTap(false)
    }
    audio.addEventListener("play", onPlay)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("error", onError)
    audioRef.current = audio

    const play = () => {
      audio.muted = false
      if (!started.current) {
        started.current = true
        if (startAt > 0) audio.currentTime = startAt
      }
      audio
        .play()
        .then(() => setNeedsTap(false))
        .catch(() => setNeedsTap(true))
    }
    const unregister = registerMusic({
      // Muted play+pause on pointerdown "unlocks" the element on Samsung
      // Internet / Android Chrome, which can refuse unmuted play otherwise.
      prime: () => {
        if (started.current) return
        audio.muted = true
        audio
          .play()
          .then(() => {
            if (!started.current) audio.pause()
          })
          .catch(() => {})
      },
      start: play,
    })

    // Pause while the page is hidden; resume only if it was playing.
    const onVisibility = () => {
      if (document.hidden) {
        resumeOnShow.current = !audio.paused
        audio.pause()
      } else if (resumeOnShow.current) {
        audio.play().catch(() => setNeedsTap(true))
      }
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      unregister()
      document.removeEventListener("visibilitychange", onVisibility)
      audio.pause()
      audio.removeEventListener("play", onPlay)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("error", onError)
      audio.removeAttribute("src")
      audio.load()
      audioRef.current = null
    }
  }, [src, loop, startAt, registerMusic])

  // The chip appears once the guest is inside (always in previews).
  if (mode === "public" && !opened) return null

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.muted = false
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
      title={title}
      className={cn(
        "fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full border border-inv-line bg-inv-bg/90 px-3 py-2 text-xs text-inv-fg shadow-lg backdrop-blur transition-colors hover:border-inv-primary focus-visible:ring-2 focus-visible:ring-inv-primary focus-visible:outline-none",
        needsTap && !playing && "border-inv-primary"
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
      {playing ? "Playing" : needsTap ? "Tap to play" : "Music"}
    </button>
  )
}
