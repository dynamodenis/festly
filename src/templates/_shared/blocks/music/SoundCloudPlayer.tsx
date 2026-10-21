import { ClientOnly } from "@tanstack/react-router"
import { ChevronDown, Music2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { useInvitation } from "../../context"
import type { MusicSource } from "../../schema"
import { loadWidgetApi, widgetSrc, type SCWidget } from "./soundcloud-widget"

type SoundCloudSource = Extract<MusicSource, { kind: "soundcloud" }>
type Props = { source: SoundCloudSource; startAt: number; loop: boolean }

/** How long to wait for the widget to report PLAY before asking for a tap. */
const START_GRACE_MS = 1500

/**
 * SoundCloud's own compact player, docked and visible (their terms require
 * visible credit; it never plays while hidden). The cover tap asks it to
 * play; iOS Safari will not pass that tap into the cross-origin iframe, so
 * after a short grace period the dock asks the guest to tap ▶ themselves.
 */
function Dock({ source, startAt, loop }: Props) {
  const { mode, opened, registerMusic, palette } = useInvitation()
  const frame = useRef<HTMLIFrameElement>(null)
  const widget = useRef<SCWidget | null>(null)
  const pendingStart = useRef(false)
  const graceTimer = useRef<number | undefined>(undefined)
  const [playing, setPlaying] = useState(false)
  const [needsTap, setNeedsTap] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [src] = useState(() => widgetSrc(source.trackId, palette.primary))

  useEffect(() => {
    let cancelled = false
    const iframe = frame.current
    if (!iframe) return
    loadWidgetApi()
      .then((SC) => {
        if (cancelled) return
        const w = SC.Widget(iframe)
        const E = SC.Widget.Events
        w.bind(E.READY, () => {
          widget.current = w
          if (pendingStart.current) {
            pendingStart.current = false
            w.play()
          }
        })
        w.bind(E.PLAY, () => {
          window.clearTimeout(graceTimer.current)
          setPlaying(true)
          setNeedsTap(false)
        })
        w.bind(E.PAUSE, () => setPlaying(false))
        w.bind(E.FINISH, () => {
          setPlaying(false)
          if (loop) {
            w.seekTo(startAt * 1000)
            w.play()
          }
        })
      })
      .catch(() => setNeedsTap(true))
    return () => {
      cancelled = true
      window.clearTimeout(graceTimer.current)
      widget.current = null
    }
  }, [loop, startAt])

  useEffect(
    () =>
      registerMusic({
        prime: () => {},
        start: () => {
          setCollapsed(false)
          if (widget.current) {
            if (startAt > 0) widget.current.seekTo(startAt * 1000)
            widget.current.play()
          } else {
            pendingStart.current = true
          }
          graceTimer.current = window.setTimeout(
            () => setNeedsTap(true),
            START_GRACE_MS
          )
        },
      }),
    [registerMusic, startAt]
  )

  const visible = mode !== "public" || opened

  const collapse = () => {
    widget.current?.pause() // minimized means paused: never a hidden player
    setCollapsed(true)
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 z-40 w-[min(22rem,calc(100vw-2rem))] transition-opacity duration-500",
        !visible && "pointer-events-none opacity-0"
      )}
      aria-hidden={!visible}
    >
      {collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-2 rounded-full border border-inv-line bg-inv-bg/95 px-3 py-2 text-xs text-inv-fg shadow-lg backdrop-blur hover:border-inv-primary focus-visible:ring-2 focus-visible:ring-inv-primary focus-visible:outline-none"
        >
          <Music2 className="size-4 text-inv-primary" aria-hidden="true" />
          <span className="max-w-48 truncate">{source.title}</span>
          <span className="text-inv-muted">· SoundCloud</span>
        </button>
      )}
      <div
        className={cn(
          "overflow-hidden rounded-2xl border border-inv-line bg-inv-bg/95 shadow-2xl backdrop-blur",
          collapsed && "hidden"
        )}
      >
        <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
          <p
            className={cn(
              "text-inv-muted",
              needsTap && !playing && "font-medium text-inv-primary"
            )}
          >
            {needsTap && !playing
              ? "Tap ▶ below for music"
              : playing
                ? "Now playing"
                : "Music"}
          </p>
          <button
            type="button"
            onClick={collapse}
            aria-label="Minimize and pause music"
            className="rounded-full p-1 text-inv-muted hover:bg-inv-surface hover:text-inv-fg focus-visible:ring-2 focus-visible:ring-inv-primary focus-visible:outline-none"
          >
            <ChevronDown className="size-4" aria-hidden="true" />
          </button>
        </div>
        <iframe
          ref={frame}
          title={`${source.title} by ${source.artist} on SoundCloud`}
          src={src}
          allow="autoplay"
          className="block h-[166px] w-full border-0"
        />
      </div>
    </div>
  )
}

export function SoundCloudPlayer(props: Props) {
  return (
    <ClientOnly fallback={null}>
      <Dock {...props} />
    </ClientOnly>
  )
}
