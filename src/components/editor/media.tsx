import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react"
import { useId, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getIn, type Path } from "@/lib/set-in"
import type { UploadPurpose } from "@/lib/upload-policy"
import { describeProgress, type UploadProgress } from "@/lib/upload-request"
import { cn } from "@/lib/utils"
import type { MediaRef } from "@/templates/_shared/schema"
import { useEditor } from "./EditorContext"

/** One optional photo (host portrait, story photo, gift QR). */
export function ImageField({
  path,
  purpose,
  label,
  help,
  className,
}: {
  path: Path
  /** What the photo is for; the server checks it is an image upload. */
  purpose: Exclude<UploadPurpose, "music">
  label: string
  help?: string
  className?: string
}) {
  const { config, set, uploadImage } = useEditor()
  const input = useRef<HTMLInputElement>(null)
  const altId = useId()
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const busy = progress !== null
  const value = getIn(config, path) as MediaRef | undefined

  const pick = async (file: File | undefined) => {
    if (!file) return
    setProgress({ stage: "resizing" })
    try {
      const ref = await uploadImage(file, purpose, setProgress)
      set(path, { ...ref, alt: value?.alt })
      toast.success(`${label} uploaded`)
    } catch (error) {
      toast.error("Upload failed", {
        description: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setProgress(null)
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
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-background/80">
              <LoaderCircle
                className="size-6 animate-spin text-primary"
                aria-hidden="true"
              />
              {progress.stage === "uploading" && (
                <span className="nums text-[0.65rem] text-foreground">
                  {progress.percent ?? 0}%
                </span>
              )}
            </span>
          )}
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p
            role="status"
            aria-live="polite"
            className="text-xs text-primary empty:hidden"
          >
            {describeProgress(progress)}
          </p>
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

/** A small set of photos (dress code inspiration): add several, remove, describe. */
export function ImageListField({
  path,
  purpose,
  label,
  max,
  help,
}: {
  path: Path
  purpose: Exclude<UploadPurpose, "music">
  label: string
  max: number
  help?: string
}) {
  const { config, set, uploadImage } = useEditor()
  const input = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<{
    done: number
    total: number
    current: UploadProgress | null
  } | null>(null)
  const photos = (getIn(config, path) as Array<MediaRef> | undefined) ?? []
  const room = max - photos.length

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return
    const batch = [...files].slice(0, room)
    if (files.length > room)
      toast(`Only ${room} more photo${room === 1 ? "" : "s"} fit (max ${max}).`)
    setProgress({ done: 0, total: batch.length, current: null })
    let added = [...photos]
    for (const file of batch) {
      try {
        const ref = await uploadImage(file, purpose, (current) =>
          setProgress((p) => (p ? { ...p, current } : p))
        )
        added = [...added, ref]
        set(path, added)
      } catch (error) {
        toast.error(`${file.name} failed`, {
          description: error instanceof Error ? error.message : String(error),
        })
      }
      setProgress((p) => (p ? { ...p, done: p.done + 1, current: null } : p))
    }
    setProgress(null)
    if (input.current) input.current.value = ""
  }

  const remove = (index: number) => {
    const next = photos.filter((_, i) => i !== index)
    set(path, next.length > 0 ? next : undefined)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">
          {label}{" "}
          <span className="nums font-normal text-muted-foreground">
            {photos.length}/{max}
          </span>
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => input.current?.click()}
          disabled={room <= 0 || progress !== null}
        >
          {progress ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus aria-hidden="true" />
          )}
          {progress
            ? `${Math.min(progress.done + 1, progress.total)}/${progress.total} · ${describeProgress(progress.current) || "Starting…"}`
            : "Add photos"}
        </Button>
      </div>
      {photos.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {help ?? "JPEG, PNG, WebP or AVIF. Resized to 2400 px before upload."}
        </p>
      ) : (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((photo, index) => (
            <li
              key={photo.assetKey}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="relative aspect-[3/4]">
                <img
                  src={photo.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-sm"
                  aria-label={`Remove ${label.toLowerCase()} photo ${index + 1}`}
                  className="absolute top-1.5 right-1.5 bg-background/80 backdrop-blur"
                  onClick={() => remove(index)}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
              <label htmlFor={`${purpose}-alt-${index}`} className="sr-only">
                Describe photo {index + 1}
              </label>
              <Input
                id={`${purpose}-alt-${index}`}
                placeholder="Describe"
                value={photo.alt ?? ""}
                maxLength={300}
                onChange={(e) =>
                  set([...path, index, "alt"], e.target.value || undefined)
                }
                className="h-8 rounded-none border-0 border-t text-xs"
              />
            </li>
          ))}
        </ul>
      )}
      <input
        ref={input}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => addFiles(e.target.files)}
      />
    </div>
  )
}
