import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { DEVICES, type DeviceId } from "@/lib/devices"

const BEZEL: Record<DeviceId, number> = { mobile: 14, tablet: 18, desktop: 0 }
const CHROME = 40 // desktop browser bar height

/**
 * Draws a phone, tablet or browser window at the device's real CSS size and
 * scales the whole thing to fit its container, so the page inside lays out
 * exactly as on that device. Children are the screen (usually an iframe).
 */
export function DeviceFrame({
  device,
  className,
  children,
}: {
  device: DeviceId
  className?: string
  children: ReactNode
}) {
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState<number | null>(null)
  const { width, height } = DEVICES[device]
  const bezel = BEZEL[device]
  const outerW = width + bezel * 2
  const outerH = height + bezel * 2 + (device === "desktop" ? CHROME : 0)

  useEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => {
      const { width: cw, height: ch } = el.getBoundingClientRect()
      setScale(Math.min(1, cw / outerW, ch / outerH))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [outerW, outerH])

  return (
    <div
      ref={box}
      className={cn(
        "relative flex min-w-0 items-start justify-center overflow-hidden",
        className
      )}
    >
      <div
        data-device={device}
        className="transition-opacity duration-500"
        style={{
          width: outerW * (scale ?? 0.5),
          height: outerH * (scale ?? 0.5),
          opacity: scale === null ? 0 : 1,
        }}
      >
        <div
          className={cn(
            "relative origin-top-left overflow-hidden bg-[#0b0806] shadow-[0_40px_120px_-40px_rgba(201,160,90,0.45),0_0_0_1px_rgba(201,160,90,0.25)] transition-[border-radius] duration-500",
            device === "mobile" && "rounded-[3.25rem]",
            device === "tablet" && "rounded-[2.5rem]",
            device === "desktop" && "rounded-xl"
          )}
          style={{
            width: outerW,
            height: outerH,
            padding: bezel,
            transform: `scale(${scale ?? 0.5})`,
          }}
        >
          {device === "desktop" && (
            <div
              aria-hidden="true"
              className="flex items-center gap-2 border-b border-white/10 bg-[#1b140e] px-4"
              style={{ height: CHROME }}
            >
              <span className="size-3 rounded-full bg-[#ff5f57]" />
              <span className="size-3 rounded-full bg-[#febc2e]" />
              <span className="size-3 rounded-full bg-[#28c840]" />
              <span className="mx-auto w-1/3 rounded-md bg-white/5 py-1 text-center text-xs text-white/40">
                festly.app
              </span>
            </div>
          )}
          <div
            className={cn(
              "relative overflow-hidden bg-white",
              device === "mobile" && "rounded-[2.5rem]",
              device === "tablet" && "rounded-[1.75rem]"
            )}
            style={{ width, height }}
          >
            {children}
            {device === "mobile" && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-2.5 left-1/2 h-7 w-28 -translate-x-1/2 rounded-full bg-black"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
