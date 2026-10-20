import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

/**
 * `false` on the server and during hydration, `true` afterwards. Use it to
 * gate values that would otherwise differ between server and client markup
 * (timers, `window` sizes, media queries).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
