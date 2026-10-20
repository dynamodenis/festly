import { cn } from "@/lib/utils"

type Corner = "tl" | "tr" | "bl" | "br"

const flip: Record<Corner, string> = {
  tl: "",
  tr: "-scale-x-100",
  bl: "-scale-y-100",
  br: "-scale-100",
}
const place: Record<Corner, string> = {
  tl: "top-0 left-0",
  tr: "top-0 right-0",
  bl: "bottom-0 left-0",
  br: "bottom-0 right-0",
}

/** One botanical sprig drawn for the top-left corner; mirrored for the others. */
export function Flourish({
  corner = "tl",
  className,
}: {
  corner?: Corner
  className?: string
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 160"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      className={cn(
        "absolute size-28 text-inv-primary/70 sm:size-40",
        place[corner],
        flip[corner],
        className
      )}
    >
      <path d="M8 152C20 96 52 52 152 8" />
      <path d="M30 104c-14-4-22-14-22-28 14 2 22 12 22 28Z" />
      <path d="M48 78c-12-8-16-20-12-32 12 6 16 18 12 32Z" />
      <path d="M72 56c-8-12-8-24 0-34 8 10 8 22 0 34Z" />
      <path d="M100 36c-4-12 0-24 10-30 4 12 0 22-10 30Z" />
      <path d="M44 112c4-14 14-22 28-22-2 14-12 22-28 22Z" />
      <path d="M66 86c6-12 18-18 30-14-6 12-18 18-30 14Z" />
      <path d="M92 62c8-10 20-12 30-6-8 10-20 12-30 6Z" />
      <circle cx="128" cy="22" r="2.4" fill="currentColor" stroke="none" />
      <circle cx="20" cy="132" r="2" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** All four corners at once. */
export function Flourishes({ className }: { className?: string }) {
  return (
    <>
      {(["tl", "tr", "bl", "br"] as const).map((corner) => (
        <Flourish key={corner} corner={corner} className={className} />
      ))}
    </>
  )
}
