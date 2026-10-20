import { Search, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Search box that keeps its own text and reports changes after a short
 * pause, so typing never fights URL updates. `/` focuses it.
 */
export function SearchField({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  const [text, setText] = useState(value)
  const input = useRef<HTMLInputElement>(null)

  // Follow external changes (back/forward, "clear filters").
  const [synced, setSynced] = useState(value)
  if (synced !== value) {
    setSynced(value)
    setText(value)
  }

  useEffect(() => {
    if (text === value) return
    const id = window.setTimeout(() => onChange(text), 200)
    return () => window.clearTimeout(id)
  }, [text, value, onChange])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing = target?.closest(
        "input, textarea, select, [contenteditable]"
      )
      if (event.key === "/" && !typing) {
        event.preventDefault()
        input.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-4 z-10 size-4 -translate-y-1/2 text-gold"
        aria-hidden="true"
      />
      <label htmlFor="template-search" className="sr-only">
        Search templates
      </label>
      <input
        ref={input}
        id="template-search"
        type="search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Search by name, style or colour…"
        autoComplete="off"
        maxLength={80}
        className="h-14 w-full rounded-full border border-gold/20 bg-umber/70 pr-20 pl-11 text-sm text-cream backdrop-blur transition-colors placeholder:text-sand/60 focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/30 focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {text ? (
        <button
          type="button"
          onClick={() => {
            setText("")
            onChange("")
            input.current?.focus()
          }}
          aria-label="Clear search"
          className="absolute top-1/2 right-3 z-10 grid size-7 -translate-y-1/2 place-items-center rounded-full text-sand hover:bg-gold/10 hover:text-cream focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : (
        <kbd className="pointer-events-none absolute top-1/2 right-4 z-10 hidden -translate-y-1/2 rounded border border-gold/20 px-1.5 text-xs text-sand sm:block">
          /
        </kbd>
      )}
    </div>
  )
}
