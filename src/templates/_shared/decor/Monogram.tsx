import { cn } from "@/lib/utils"
import type { Host } from "../schema"

/** First letters of the first two hosts, e.g. "A K". */
export function monogramLetters(hosts: ReadonlyArray<Host>): Array<string> {
  return hosts
    .slice(0, 2)
    .map((h) => (h.shortName ?? h.name).trim().charAt(0).toUpperCase())
    .filter(Boolean)
}

/**
 * Wedding-style crest: initials in the display face inside a double ring with
 * a tiny ampersand. Decorative; the names appear in text elsewhere.
 */
export function Monogram({
  hosts,
  className,
}: {
  hosts: ReadonlyArray<Host>
  className?: string
}) {
  const [a, b] = monogramLetters(hosts)
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex size-24 items-center justify-center text-inv-primary sm:size-28",
        className
      )}
    >
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="50" cy="50" r="48" strokeWidth="0.8" />
        <circle
          cx="50"
          cy="50"
          r="44"
          strokeWidth="0.4"
          strokeDasharray="1 2.2"
        />
      </svg>
      <span className="font-inv-display text-3xl leading-none sm:text-4xl">
        {a}
        {b && (
          <>
            <span className="mx-0.5 align-middle text-base italic opacity-70">
              &amp;
            </span>
            {b}
          </>
        )}
      </span>
    </div>
  )
}
