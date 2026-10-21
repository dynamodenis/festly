import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MapProps } from "./types"

/** What every adapter shows on the server, without JS, or while loading. */
export function MapFallback({
  venue,
  className,
}: Pick<MapProps, "venue" | "className">) {
  return (
    <div
      className={cn(
        "flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 bg-inv-surface p-6 text-center sm:aspect-[16/9]",
        className
      )}
    >
      <MapPin className="size-6 text-inv-primary" aria-hidden="true" />
      <p className="font-medium">{venue.placeName ?? venue.name}</p>
      <p className="text-sm text-inv-muted">{venue.address}</p>
    </div>
  )
}
