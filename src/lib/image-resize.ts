// Browser-only: shrink photos before upload (Phase 4: a 6 MB JPEG must
// become ≤ 800 KB). Never import from server code.
import { IMAGE_RESIZE } from "./upload-policy"

export type PreparedImage = { blob: Blob; width: number; height: number }

async function encode(
  bitmap: ImageBitmap,
  width: number,
  height: number,
  mime: string,
  quality: number
): Promise<Blob> {
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas unavailable")
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(bitmap, 0, 0, width, height)
    return canvas.convertToBlob({ type: mime, quality })
  }
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas unavailable")
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(bitmap, 0, 0, width, height)
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Encoding failed"))),
      mime,
      quality
    )
  )
}

/**
 * Decode (respecting EXIF orientation), cap the long edge, encode WebP and
 * step quality, then size, down until it fits the target. Browsers that
 * cannot encode WebP (older Safari) fall back to JPEG.
 */
export async function prepareImage(
  file: Blob,
  opts: typeof IMAGE_RESIZE = IMAGE_RESIZE
): Promise<PreparedImage> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  })
  try {
    let scale = Math.min(
      1,
      opts.maxEdge / Math.max(bitmap.width, bitmap.height)
    )
    let quality: number = opts.quality
    let mime: string = opts.mime
    let result: PreparedImage | undefined
    for (let attempt = 0; attempt < 8; attempt++) {
      const width = Math.max(1, Math.round(bitmap.width * scale))
      const height = Math.max(1, Math.round(bitmap.height * scale))
      let blob = await encode(bitmap, width, height, mime, quality)
      if (blob.type !== mime) {
        mime = "image/jpeg"
        blob = await encode(bitmap, width, height, mime, quality)
      }
      result = { blob, width, height }
      if (blob.size <= opts.targetBytes) break
      if (quality > 0.6) quality = Math.round((quality - 0.1) * 100) / 100
      else scale *= 0.85
    }
    if (!result) throw new Error("Could not prepare the image")
    return result
  } finally {
    bitmap.close()
  }
}

/** Duration of an audio file in seconds (metadata only). */
export function audioDuration(file: Blob): Promise<number | undefined> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const audio = new Audio()
    const done = (value: number | undefined) => {
      URL.revokeObjectURL(url)
      resolve(value)
    }
    audio.preload = "metadata"
    audio.onloadedmetadata = () =>
      done(Number.isFinite(audio.duration) ? audio.duration : undefined)
    audio.onerror = () => done(undefined)
    audio.src = url
  })
}
