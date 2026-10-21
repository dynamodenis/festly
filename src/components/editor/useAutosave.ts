import { useServerFn } from "@tanstack/react-start"
import { useCallback, useEffect, useRef, useState } from "react"
import { saveDraftFn } from "@/server/invitations/invitations.functions"
import type { EditorConfig } from "./EditorContext"

export type SaveState =
  "saved" | "dirty" | "saving" | "invalid" | "conflict" | "error"

const DEBOUNCE_MS = 1500

type Failure = { kind: "conflict" | "error"; config: EditorConfig }

/**
 * Debounced autosave with optimistic concurrency. The status is derived from
 * (current config, last saved config, validity, in-flight, failure) rather
 * than stored, so it can never drift. Only valid configs are sent; the
 * server re-validates. A conflict pauses saving until the user decides.
 */
export function useAutosave(opts: {
  id: string
  config: EditorConfig
  valid: boolean
  initialUpdatedAt: string
}) {
  const save = useServerFn(saveDraftFn)
  const [savedConfig, setSavedConfig] = useState(opts.config)
  const [saving, setSaving] = useState(false)
  const [failure, setFailure] = useState<Failure | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState(opts.initialUpdatedAt)
  const base = useRef(opts.initialUpdatedAt)
  const latest = useRef(opts.config)
  const savedRef = useRef(opts.config)
  const inFlight = useRef(false)

  useEffect(() => {
    latest.current = opts.config
  })

  // A conflict blocks until resolved; an ordinary error only for the config that failed.
  const failed =
    failure && (failure.kind === "conflict" || failure.config === opts.config)
      ? failure.kind
      : null
  const state: SaveState =
    failed ??
    (saving
      ? "saving"
      : opts.config === savedConfig
        ? "saved"
        : opts.valid
          ? "dirty"
          : "invalid")

  const flush = useCallback(
    async (force = false) => {
      if (inFlight.current) return
      const snapshot = latest.current
      if (!force && snapshot === savedRef.current) return
      inFlight.current = true
      setSaving(true)
      try {
        const result = await save({
          data: {
            id: opts.id,
            config: snapshot,
            baseUpdatedAt: base.current,
            force,
          },
        })
        base.current = result.updatedAt
        savedRef.current = snapshot
        setSavedConfig(snapshot)
        setLastSavedAt(result.updatedAt)
        setFailure(null)
      } catch (error) {
        const message = error instanceof Error ? error.message : ""
        setFailure({
          kind: message.startsWith("conflict:") ? "conflict" : "error",
          config: snapshot,
        })
      } finally {
        inFlight.current = false
        setSaving(false)
      }
    },
    [save, opts.id]
  )

  // Save once edits pause (also picks up edits made during a save).
  useEffect(() => {
    if (state !== "dirty") return
    const timer = window.setTimeout(() => void flush(), DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [state, opts.config, flush])

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (latest.current !== savedRef.current) event.preventDefault()
    }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [])

  /** After publish the row's version moves; adopt it so the next save does not conflict. */
  const adoptVersion = useCallback((updatedAt: string) => {
    base.current = updatedAt
    setLastSavedAt(updatedAt)
  }, [])

  return { state, lastSavedAt, flush, adoptVersion }
}
