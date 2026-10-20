import { Skeleton } from "@/components/ui/skeleton"

/** Shown while a template chunk loads. Neutral colors: the palette is not known yet. */
export function TemplateRendererSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading invitation"
      className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-6"
    >
      <Skeleton className="h-3 w-32 rounded-full" />
      <Skeleton className="h-14 w-full max-w-md" />
      <Skeleton className="h-4 w-full max-w-sm" />
      <Skeleton className="h-4 w-2/3 max-w-xs" />
      <Skeleton className="mt-4 h-11 w-44 rounded-full" />
    </div>
  )
}
