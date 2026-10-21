import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react"
import { useId, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getIn, type Path } from "@/lib/set-in"
import { cn } from "@/lib/utils"
import type { MediaRef } from "@/templates/_shared/schema"
import { useEditor } from "./EditorContext"

/** One optional photo (host portrait, story photo, gift QR). */
export function ImageField({
  path,
  label,
  help,
  className,
}: {
  path: Path
  label: string
  help?: string
  className?: string
}) {
  const { config, set, uploadImage } = useEditor()
  const input = useRef<HTMLInputElement>(null)
  const altId = useId()
  const [busy, setBusy] = useState(false)
  const value = getIn(config, path) as MediaRef | undefined

  const pick = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    try {
      const ref = await uploadImage(file)
      set(path, { ...ref, alt: value?.alt })
    } catch (error) {
      toast.error("Upload failed", {
        description: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ""
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="text-sm font-medium">{label}</p>
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          aria-label={
            value
              ? `Replace ${label.toLowerCase()}`
              : `Upload ${label.toLowerCase()}`
          }
          className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-input bg-muted text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          {value ? (
            <img
              src={value.url}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <ImagePlus className="size-6" aria-hidden="true" />
          )}
          {busy && (
            <span className="absolute inset-0 grid place-items-center bg-background/70">
              <LoaderCircle
                className="size-6 animate-spin text-primary"
                aria-hidden="true"
              />
            </span>
          )}
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {value ? (
            <>
              <label htmlFor={altId} className="sr-only">
                Describe this photo
              </label>
              <Input
                id={altId}
                placeholder="Describe the photo (for screen readers)"
                value={value.alt ?? ""}
                maxLength={300}
                onChange={(e) =>
                  set([...path, "alt"], e.target.value || undefined)
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-start text-destructive"
                onClick={() => set(path, undefined)}
              >
                <Trash2 aria-hidden="true" /> Remove
              </Button>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              {help ??
                "JPEG, PNG, WebP or AVIF. Resized to 2400 px before upload."}
            </p>
          )}
        </div>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => pick(e.target.files?.[0])}
      />
    </div>
  )
}
