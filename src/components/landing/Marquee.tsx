const EVENTS = [
  "Weddings",
  "Birthdays",
  "Graduations",
  "Baby showers",
  "Anniversaries",
  "Engagements",
  "Galas",
  "Reunions",
  "Housewarmings",
]

export function Marquee() {
  const items = [...EVENTS, ...EVENTS]
  return (
    <div className="relative overflow-hidden border-y border-gold/10 bg-umber/50 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)] py-6">
      <ul
        className="flex w-max animate-marquee items-center gap-10"
        aria-label="Events Festly is made for"
      >
        {items.map((event, i) => (
          <li
            key={`${event}-${i}`}
            aria-hidden={i >= EVENTS.length}
            className="flex items-center gap-10 font-display text-2xl whitespace-nowrap text-cream/70 italic"
          >
            {event}
            <span className="text-sm text-gold not-italic">✦</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
