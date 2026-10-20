import { useState } from "react"
import type { KeyboardEvent } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { useInvitation } from "../context"
import {
  PhotoButton,
  PhotoCarousel,
  TiltedPhoto,
  type GalleryEffect,
} from "../effects/GalleryFx"
import { Section, type BlockProps } from "./Section"

export type GalleryVariant = "grid" | "masonry" | "carousel" | "mosaic"

type GalleryProps = BlockProps & {
  variant?: GalleryVariant
  effect?: GalleryEffect
}

const layouts: Record<Exclude<GalleryVariant, "carousel">, string> = {
  grid: "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 [&>li]:aspect-[4/5]",
  masonry:
    "columns-2 gap-3 sm:columns-3 sm:gap-4 [&>li]:mb-3 [&>li]:break-inside-avoid sm:[&>li]:mb-4",
  // Editorial mosaic: the first photo spans a 2×2 block.
  mosaic:
    "grid auto-rows-[9rem] grid-cols-2 gap-3 sm:auto-rows-[12rem] sm:grid-cols-4 sm:gap-4 [&>li:first-child]:col-span-2 [&>li:first-child]:row-span-2",
}

/** Photo grid (or carousel) with an accessible, keyboard-navigable lightbox. */
export function Gallery({
  variant = "grid",
  effect = "none",
  eyebrow = "Moments",
  title = "Gallery",
  tone,
  className,
}: GalleryProps) {
  const { config, motion, palette } = useInvitation()
  const photos = config.gallery
  const [active, setActive] = useState<number | null>(null)
  const current = active === null ? undefined : photos[active]
  const count = photos.length

  const step = (delta: number) =>
    setActive((i) => (i === null ? i : (i + delta + count) % count))
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") step(1)
    if (event.key === "ArrowLeft") step(-1)
  }

  const grid = (
    <ul className={layouts[variant === "carousel" ? "grid" : variant]}>
      {photos.map((photo, i) => {
        const label = photo.alt
          ? `Open photo: ${photo.alt}`
          : `Open photo ${i + 1} of ${count}`
        const tile = {
          photo,
          label,
          onOpen: () => setActive(i),
          className: "h-full w-full",
        }
        return (
          <li key={`${photo.assetKey}-${i}`} className="relative">
            {effect === "tilted" ? (
              <TiltedPhoto {...tile} motion={motion} />
            ) : (
              <PhotoButton {...tile} />
            )}
          </li>
        )
      })}
    </ul>
  )

  return (
    <Section
      id="gallery"
      eyebrow={eyebrow}
      title={title}
      tone={tone}
      width="wide"
      className={className}
    >
      {variant === "carousel" ? (
        <PhotoCarousel
          photos={photos}
          motion={motion}
          mode={palette.mode}
          fallback={grid}
        />
      ) : (
        grid
      )}

      <Dialog
        open={current !== undefined}
        onOpenChange={(o) => !o && setActive(null)}
      >
        <DialogContent
          showCloseButton={false}
          onKeyDown={onKeyDown}
          className="max-w-5xl border-0 bg-transparent p-0 shadow-none sm:max-w-5xl"
        >
          <DialogTitle className="sr-only">
            {current?.alt || `Photo ${(active ?? 0) + 1} of ${count}`}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Use the left and right arrow keys to browse. Press Escape to close.
          </DialogDescription>
          {current && (
            <figure className="flex flex-col items-center gap-3">
              <img
                src={current.url}
                alt={current.alt ?? ""}
                className="max-h-[80svh] w-auto rounded-lg object-contain shadow-2xl"
              />
              <figcaption className="text-sm text-white/80">
                {current.alt && <span>{current.alt} · </span>}
                {(active ?? 0) + 1} / {count}
              </figcaption>
            </figure>
          )}
          {count > 1 && (
            <>
              <LightboxButton
                label="Previous photo"
                onClick={() => step(-1)}
                className="left-2 sm:-left-14"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </LightboxButton>
              <LightboxButton
                label="Next photo"
                onClick={() => step(1)}
                className="right-2 sm:-right-14"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </LightboxButton>
            </>
          )}
          <LightboxButton
            label="Close"
            onClick={() => setActive(null)}
            className="top-2 right-2 translate-y-0"
          >
            <X className="size-5" aria-hidden="true" />
          </LightboxButton>
        </DialogContent>
      </Dialog>
    </Section>
  )
}

function LightboxButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string
  onClick: () => void
  className?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2.5 text-white backdrop-blur transition-colors hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none",
        className
      )}
    >
      {children}
    </button>
  )
}
