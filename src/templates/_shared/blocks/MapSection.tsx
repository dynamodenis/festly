import { MapPin, Navigation } from "lucide-react"
import { cn } from "@/lib/utils"
import { directionLinks } from "@/lib/maps/directions"
import { VenueMap } from "@/lib/maps/registry"
import { useInvitation } from "../context"
import { Section, type BlockProps } from "./Section"
import { InvLink } from "./ui"

export type MapVariant = "embed" | "card" | "split"

type MapSectionProps = BlockProps & {
  variant?: MapVariant
}

/**
 * Venue map. The embed iframe is lazy-loaded by the browser and carries a
 * title and referrer policy; the address card with Google/Waze/Apple links is
 * always rendered so the venue is reachable without the iframe (rule 11).
 */
export function MapSection({
  variant = "embed",
  eyebrow = "Where",
  title,
  tone,
  className,
}: MapSectionProps) {
  const { config, palette } = useInvitation()
  const { venue } = config
  const links = directionLinks(venue)
  const showEmbed = variant !== "card"

  const card = (
    <div className="flex flex-col gap-4 rounded-inv border border-inv-line bg-inv-surface p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <MapPin
          className="mt-1 size-5 shrink-0 text-inv-primary"
          aria-hidden="true"
        />
        <div>
          <h3 className="font-inv-display text-2xl">
            {venue.placeName ?? venue.name}
          </h3>
          <p className="mt-1 text-inv-muted">{venue.address}</p>
          {venue.notes && (
            <p className="mt-3 text-sm text-inv-muted">{venue.notes}</p>
          )}
        </div>
      </div>
      <ul className="flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.label}>
            <InvLink
              href={link.href}
              target="_blank"
              rel="noreferrer noopener"
              variant="outline"
              size="sm"
            >
              <Navigation className="size-3.5" aria-hidden="true" />
              {link.label}
            </InvLink>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <Section
      id="map"
      tone={tone}
      eyebrow={eyebrow}
      title={title ?? venue.name}
      width={variant === "split" ? "wide" : "regular"}
      className={className}
    >
      <div
        className={cn(
          variant === "split" &&
            "grid items-start gap-6 lg:grid-cols-[1fr_1.4fr]"
        )}
      >
        {variant === "split" && card}
        {showEmbed && (
          <div className="overflow-hidden rounded-inv border border-inv-line bg-inv-surface">
            <VenueMap venue={venue} hint={palette.mode} />
          </div>
        )}
        {variant !== "split" && (
          <div className={cn(showEmbed && "mt-6")}>{card}</div>
        )}
      </div>
    </Section>
  )
}
