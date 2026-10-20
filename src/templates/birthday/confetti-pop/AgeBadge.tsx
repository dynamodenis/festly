import { cn } from "@/lib/utils"

/**
 * Confetti Pop's signature: the age as a big sticker. A dashed ring spins
 * around it (CSS, gated by motion level) and a starburst sits behind.
 */
export function AgeBadge({
  age,
  size = "lg",
  className,
}: {
  age: number
  size?: "lg" | "sm"
  className?: string
}) {
  const lg = size === "lg"
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        className={cn(
          "relative grid place-items-center",
          lg ? "size-48 sm:size-56" : "size-24"
        )}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="absolute inset-0 text-inv-secondary"
        >
          <path
            fill="currentColor"
            d="M50 0l7 15 15-8 1 17 17 1-8 15 15 7-15 7 8 15-17 1-1 17-15-8-7 15-7-15-15 8-1-17-17-1 8-15L0 50l15-7-8-15 17-1 1-17 15 8Z"
          />
        </svg>
        <div
          aria-hidden="true"
          className="inv-anim-spin absolute inset-[13%] rounded-full border-2 border-dashed border-inv-accent [--d:24s]"
        />
        <span
          aria-hidden="true"
          className={cn(
            "relative grid -rotate-6 place-items-center rounded-full bg-inv-primary font-inv-display font-extrabold text-inv-bg shadow-[0_18px_40px_-14px_var(--inv-primary)]",
            lg ? "size-32 text-7xl sm:size-36 sm:text-8xl" : "size-16 text-3xl"
          )}
        >
          {age}
        </span>
      </div>
      {lg && (
        <p className="rotate-[-2deg] rounded-full bg-inv-accent px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-inv-bg uppercase">
          <span className="sr-only">Turning {age}: </span>years of awesome
        </p>
      )}
    </div>
  )
}
