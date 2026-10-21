// Typed postMessage channel between a page and the template preview it hosts
// in an iframe (gallery palette switcher now, the Phase 4 editor later).
// Same-origin only; every message is validated on receipt.
import { useEffect, useRef } from "react"
import { z } from "zod"
import { MotionLevel } from "@/templates/_shared/schema"

export const PreviewMessage = z.discriminatedUnion("type", [
  /** Parent → preview: override theme fields without reloading. */
  z.object({
    type: z.literal("festly:theme"),
    paletteId: z.string().max(60).optional(),
    fontPairId: z.string().max(60).optional(),
    motionLevel: MotionLevel.optional(),
  }),
  /**
   * Parent → preview: replace the whole config (the editor). Validated by the
   * renderer (resolveConfig), so it is only shape-checked here.
   */
  z.object({
    type: z.literal("festly:config"),
    config: z.record(z.string(), z.unknown()),
  }),
  /** Parent → preview: "are you there?" (the preview answers `festly:ready`). */
  z.object({ type: z.literal("festly:ping") }),
  /** Preview → parent: the template has rendered and can take messages. */
  z.object({ type: z.literal("festly:ready"), templateId: z.string().max(80) }),
])
export type PreviewMessage = z.infer<typeof PreviewMessage>

export function postToWindow(
  target: Window | null | undefined,
  message: PreviewMessage
) {
  target?.postMessage(message, window.location.origin)
}

/**
 * Subscribe to validated preview messages from `source` (a frame's window
 * for the parent, `window.parent` for the preview). Foreign origins, other
 * windows and malformed payloads are ignored.
 */
export function usePreviewMessages(
  getSource: () => Window | null | undefined,
  onMessage: (message: PreviewMessage) => void
) {
  const handler = useRef(onMessage)
  const source = useRef(getSource)
  useEffect(() => {
    handler.current = onMessage
    source.current = getSource
  })
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      const expected = source.current()
      if (!expected || event.source !== expected) return
      const parsed = PreviewMessage.safeParse(event.data)
      if (parsed.success) handler.current(parsed.data)
    }
    window.addEventListener("message", listener)
    return () => window.removeEventListener("message", listener)
  }, [])
}
