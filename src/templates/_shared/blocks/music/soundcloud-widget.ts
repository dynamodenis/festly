// Minimal typings and a one-time loader for SoundCloud's Widget API
// (https://developers.soundcloud.com/docs/api/html5-widget).

export type SCWidget = {
  bind: (event: string, handler: () => void) => void
  unbind: (event: string) => void
  play: () => void
  pause: () => void
  seekTo: (ms: number) => void
  setVolume: (volume: number) => void
}

type SCGlobal = {
  Widget: ((iframe: HTMLIFrameElement) => SCWidget) & {
    Events: Record<"READY" | "PLAY" | "PAUSE" | "FINISH" | "ERROR", string>
  }
}

declare global {
  interface Window {
    SC?: SCGlobal
  }
}

let loading: Promise<SCGlobal> | undefined

export function loadWidgetApi(): Promise<SCGlobal> {
  if (window.SC) return Promise.resolve(window.SC)
  loading ??= new Promise<SCGlobal>((resolve, reject) => {
    const script = document.createElement("script")
    script.src = "https://w.soundcloud.com/player/api.js"
    script.async = true
    script.onload = () =>
      window.SC
        ? resolve(window.SC)
        : reject(new Error("SoundCloud API missing"))
    script.onerror = () => {
      loading = undefined
      reject(new Error("Could not load the SoundCloud player"))
    }
    document.head.appendChild(script)
  })
  return loading
}

export function widgetSrc(trackId: string, color: string): string {
  const params = new URLSearchParams({
    url: `https://api.soundcloud.com/tracks/${trackId}`,
    color: color.startsWith("#") ? color.slice(1) : color,
    auto_play: "false",
    hide_related: "true",
    show_comments: "false",
    show_user: "true",
    show_reposts: "false",
    show_teaser: "false",
    visual: "false",
  })
  return `https://w.soundcloud.com/player/?${params.toString()}`
}
