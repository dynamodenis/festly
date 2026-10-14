import { CalendarDays, MapPin, Music2 } from "lucide-react"
import { cn } from "@/lib/utils"

type InvitationCardProps = {
  className?: string
}

/** A sample invitation drawn in CSS, shown inside the hero phone. */
export function InvitationCard({ className }: InvitationCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col items-center overflow-hidden rounded-[2rem] bg-[radial-gradient(ellipse_at_top,#3a2a1b_0%,#1a120c_60%)] px-6 pt-10 pb-6 text-center text-cream",
        className
      )}
    >
      <Ornament className="w-28 text-gold" />
      <p className="mt-5 text-[0.6rem] tracking-[0.35em] text-sand uppercase">
        Together with their families
      </p>
      <h3 className="mt-3 font-display text-4xl leading-tight">
        Amara
        <span className="block font-display text-2xl text-gold italic">
          &amp;
        </span>
        Kofi
      </h3>
      <p className="mt-4 text-[0.65rem] tracking-[0.3em] text-sand uppercase">
        request the pleasure of your company
      </p>

      <div className="mt-6 grid w-full grid-cols-4 gap-1.5">
        {[
          ["84", "days"],
          ["12", "hrs"],
          ["30", "min"],
          ["09", "sec"],
        ].map(([value, label]) => (
          <div
            key={label}
            className="rounded-lg border border-gold/20 bg-ink/50 py-2"
          >
            <div className="nums text-lg text-gold-soft">{value}</div>
            <div className="text-[0.55rem] tracking-widest text-sand uppercase">
              {label}
            </div>
          </div>
        ))}
      </div>

      <ul className="mt-6 w-full space-y-2 text-left text-xs text-cream/80">
        <li className="flex items-center gap-2">
          <CalendarDays className="size-3.5 text-gold" aria-hidden="true" />
          Saturday, 12 June 2027 · 3 PM
        </li>
        <li className="flex items-center gap-2">
          <MapPin className="size-3.5 text-gold" aria-hidden="true" />
          The Old Mill Gardens
        </li>
        <li className="flex items-center gap-2">
          <Music2 className="size-3.5 text-gold" aria-hidden="true" />
          Our song is playing
        </li>
      </ul>

      <div className="mt-auto w-full rounded-full bg-gold py-2.5 text-xs font-medium tracking-[0.2em] text-ink uppercase">
        RSVP
      </div>
    </div>
  )
}

export function Ornament({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className={className}
      aria-hidden="true"
    >
      <path d="M0 10h44M76 10h44" />
      <path d="M60 2l8 8-8 8-8-8z" />
      <circle cx="60" cy="10" r="2" fill="currentColor" />
      <circle cx="46" cy="10" r="1.2" fill="currentColor" />
      <circle cx="74" cy="10" r="1.2" fill="currentColor" />
    </svg>
  )
}
