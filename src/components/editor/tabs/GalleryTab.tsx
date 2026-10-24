import { ImagePlus, LoaderCircle, Trash2 } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { describeProgress, type UploadProgress } from "@/lib/upload-request"
import { MAX_GALLERY } from "@/templates/_shared/schema"
import { useEditor } from "../EditorContext"
import { SortableList } from "../Sortable"
import { Group, ToggleField } from "../fields"

export function GalleryTab() {
  const { config, set, uploadImage } = useEditor()
  const input = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<{
    done: number
    total: number
    current: UploadProgress | null
  } | null>(null)
  const photos = config.gallery
  const room = MAX_GALLERY - photos.length

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return
    const batch = [...files].slice(0, room)
    if (files.length > room)
      toast(
        `Only ${room} more photo${room === 1 ? "" : "s"} fit (max ${MAX_GALLERY}).`
      )
    setProgress({ done: 0, total: batch.length, current: null })
    let succeeded = 0
    let added = [...photos]
    for (const file of batch) {
      try {
        const ref = await uploadImage(file, "gallery", (current) =>
          setProgress((p) => (p ? { ...p, current } : p))
        )
        added = [...added, ref]
        set(["gallery"], added)
        succeeded++
      } catch (error) {
        toast.error(`${file.name} failed`, {
          description: error instanceof Error ? error.message : String(error),
        })
      }
      setProgress((p) => (p ? { ...p, done: p.done + 1, current: null } : p))
    }
    setProgress(null)
    if (succeeded > 0) {
      toast.success(
        `${succeeded} photo${succeeded === 1 ? "" : "s"} added to the gallery`
      )
    }
    if (input.current) input.current.value = ""
  }

  return (
    <>
      <Group
        title="Gallery"
        description={`Up to ${MAX_GALLERY} photos. Drag to reorder; the first one leads.`}
        action={
          <Button
            type="button"
            onClick={() => input.current?.click()}
            disabled={room <= 0 || progress !== null}
          >
            {progress ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : (
              <ImagePlus aria-hidden="true" />
            )}
            {progress
              ? `Photo ${Math.min(progress.done + 1, progress.total)}/${progress.total} · ${describeProgress(progress.current) || "Starting…"}`
              : "Add photos"}
          </Button>
        }
      >
        <ToggleField path={["features", "gallery"]} label="Show gallery" />
        {photos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            No photos yet.
          </p>
        ) : (
          <SortableList
            items={photos}
            getId={(p) => p.assetKey}
            onReorder={(next) => set(["gallery"], next)}
            layout="grid"
            className="grid grid-cols-2 gap-3 sm:grid-cols-3"
          >
            {(photo, handle, index) => (
              <div className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="relative aspect-square">
                  <img
                    src={photo.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 rounded-md bg-background/80 backdrop-blur">
                    {handle}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-sm"
                    aria-label={`Remove photo ${index + 1}`}
                    className="absolute top-1.5 right-1.5 bg-background/80 backdrop-blur"
                    onClick={() =>
                      set(
                        ["gallery"],
                        photos.filter((_, i) => i !== index)
                      )
                    }
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
                <label htmlFor={`alt-${index}`} className="sr-only">
                  Describe photo {index + 1}
                </label>
                <Input
                  id={`alt-${index}`}
                  placeholder="Describe the photo"
                  value={photo.alt ?? ""}
                  maxLength={300}
                  onChange={(e) =>
                    set(["gallery", index, "alt"], e.target.value || undefined)
                  }
                  className="h-8 rounded-none border-0 border-t text-xs"
                />
              </div>
            )}
          </SortableList>
        )}
      </Group>
      <input
        ref={input}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        data-testid="gallery-input"
        onChange={(e) => addFiles(e.target.files)}
      />
    </>
  )
}
