import { Monitor, Smartphone, Tablet } from "lucide-react"
import { cn } from "@/lib/utils"
import { DEVICES, DEVICE_IDS, type DeviceId } from "@/lib/devices"

const ICONS = { mobile: Smartphone, tablet: Tablet, desktop: Monitor }

/** Segmented control for the preview device; a radio group for assistive tech. */
export function DeviceToggle({
  value,
  onChange,
  className,
}: {
  value: DeviceId
  onChange: (device: DeviceId) => void
  className?: string
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Preview device"
      className={cn(
        "inline-flex rounded-full border border-gold/20 bg-umber/70 p-1 backdrop-blur",
        className
      )}
    >
      {DEVICE_IDS.map((id) => {
        const Icon = ICONS[id]
        const active = id === value
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(id)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium tracking-wide transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none",
              active ? "bg-gold text-ink" : "text-sand hover:text-cream"
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">{DEVICES[id].label}</span>
            <span className="sr-only sm:hidden">{DEVICES[id].label}</span>
          </button>
        )
      })}
    </div>
  )
}
