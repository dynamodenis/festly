import { ClientOnly } from "@tanstack/react-router"
import { Suspense, lazy } from "react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import type { MediaRef } from "../schema"
import type { EffectiveMotion } from "../theme/motion"

const TiltedCard = lazy(() => import("@/components/reactbits/TiltedCard"))
const Carousel = lazy(() => import("@/components/reactbits/Carousel"))

export type GalleryEffect = "tilted" | "carousel" | "none"

type PhotoButtonProps = {
  photo: MediaRef
  label: string
  onOpen: () => void
  className?: string
}

/** The plain, accessible photo tile: an image inside a real button. */
export function PhotoButton({
  photo,
  label,
  onOpen,
  className,
}: PhotoButtonProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={label}
      className={cn(
        "group block h-full w-full overflow-hidden rounded-inv focus-visible:ring-2 focus-visible:ring-inv-primary focus-visible:ring-offset-2 focus-visible:ring-offset-inv-bg focus-visible:outline-none",
        className
      )}
    >
      <img
        src={photo.url}
        alt=""
        width={photo.width}
        height={photo.height}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />
    </button>
  )
}

/**
 * A gallery tile that tilts toward the pointer at motion "full". TiltedCard
 * becomes its own `role="button"` when given `onClick`, so it replaces the
 * plain button instead of nesting a figure inside one.
 */
export function TiltedPhoto({
  photo,
  label,
  onOpen,
  motion,
  className,
}: PhotoButtonProps & { motion: EffectiveMotion }) {
  const plain = (
    <PhotoButton
      photo={photo}
      label={label}
      onOpen={onOpen}
      className={className}
    />
  )
  if (motion !== "full") return plain
  return (
    <ClientOnly fallback={plain}>
      <Suspense fallback={plain}>
        <TiltedCard
          imageSrc={photo.url}
          altText={label}
          captionText={label}
          containerHeight="100%"
          containerWidth="100%"
          imageHeight="100%"
          imageWidth="100%"
          rotateAmplitude={9}
          scaleOnHover={1.04}
          glare={0.25}
          showTooltip={false}
          radius="var(--inv-radius)"
          onClick={onOpen}
          className={className}
        />
      </Suspense>
    </ClientOnly>
  )
}

type CarouselProps = {
  photos: ReadonlyArray<MediaRef>
  motion: EffectiveMotion
  mode: "light" | "dark"
  /** Rendered on the server and whenever motion is not "full". */
  fallback: ReactNode
}

/** Swipeable photo carousel with a static grid as its fallback. */
export function PhotoCarousel({
  photos,
  motion,
  mode,
  fallback,
}: CarouselProps) {
  if (motion !== "full") return <>{fallback}</>
  return (
    <ClientOnly fallback={fallback}>
      <Suspense fallback={fallback}>
        <Carousel
          items={photos.map((p, i) => ({
            id: `${p.assetKey}-${i}`,
            image: p.url,
            alt: p.alt ?? "",
          }))}
          baseWidth="100%"
          aspectRatio={4 / 3}
          effect="tilt"
          indicator="dots"
          loop
          autoplay
          autoplayDelay={4200}
          pauseOnHover
          theme={mode}
          radius={24}
        />
      </Suspense>
    </ClientOnly>
  )
}
