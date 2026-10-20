import { useSyncExternalStore } from "react"

type Listener = () => void
const listeners = new Set<Listener>()
let timer: ReturnType<typeof setInterval> | undefined

function subscribe(listener: Listener) {
  listeners.add(listener)
  timer ??= setInterval(() => listeners.forEach((l) => l()), 1000)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0 && timer) {
      clearInterval(timer)
      timer = undefined
    }
  }
}

// Whole seconds, so every subscriber sees the same snapshot within a tick.
const getSnapshot = () => Math.floor(Date.now() / 1000) * 1000
const getServerSnapshot = () => null

/**
 * Current time in ms, ticking once per second. `null` on the server and
 * during hydration so countdowns render a static placeholder first.
 * One shared interval serves every subscriber.
 */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
