import { useEffect, useRef, useState } from "react"
import { DeviceFrame } from "@/components/gallery/DeviceFrame"
import type { DeviceId } from "@/lib/devices"
import { postToWindow, usePreviewMessages } from "@/lib/preview-bridge"
import { cn } from "@/lib/utils"
import type { EditorConfig } from "./EditorContext"

const THROTTLE_MS = 200

/** Live preview: the template in a device frame, fed by postMessage (no reloads). */
export function EditorPreview({
  templateId,
  config,
  device,
  className,
}: {
  templateId: string
  config: EditorConfig
  device: DeviceId
  className?: string
}) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [ready, setReady] = useState(false)
  const latest = useRef(config)
  useEffect(() => {
    latest.current = config
  })

  const send = () =>
    postToWindow(frame.current?.contentWindow, {
      type: "festly:config",
      config: latest.current,
    })

  usePreviewMessages(
    () => frame.current?.contentWindow,
    (message) => {
      if (message.type === "festly:ready") {
        setReady(true)
        send()
      }
    }
  )

  // Throttled: the first change goes out at once, then at most one update
  // per 200 ms while typing, plus a trailing one with the final state.
  const lastSent = useRef(0)
  useEffect(() => {
    if (!ready) return
    const wait = Math.max(0, lastSent.current + THROTTLE_MS - Date.now())
    const timer = window.setTimeout(() => {
      lastSent.current = Date.now()
      send()
    }, wait)
    return () => window.clearTimeout(timer)
  }, [config, ready])

  useEffect(() => {
    postToWindow(frame.current?.contentWindow, { type: "festly:ping" })
  }, [])

  return (
    <DeviceFrame device={device} className={className}>
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 z-10 grid place-items-center bg-umber transition-opacity duration-500",
          ready && "opacity-0"
        )}
      >
        <span className="size-10 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
      </div>
      <iframe
        ref={frame}
        src={`/preview/${templateId}`}
        title="Live preview of your invitation"
        className="h-full w-full border-0"
        onLoad={() =>
          postToWindow(frame.current?.contentWindow, { type: "festly:ping" })
        }
      />
    </DeviceFrame>
  )
}
