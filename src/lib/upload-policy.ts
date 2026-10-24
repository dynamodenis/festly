// What may be uploaded. Shared by the browser (pre-checks, resize targets)
// and the server (the authority). Sizes are bytes.
import { z } from "zod"

export const MediaKind = z.enum(["image", "audio"])
export type MediaKind = z.infer<typeof MediaKind>

/** What the upload is for; decides which media kind is allowed. */
export const UploadPurpose = z.enum([
  "portrait",
  "gallery",
  "story",
  "gift",
  "music",
])
export type UploadPurpose = z.infer<typeof UploadPurpose>

export const PURPOSE_KIND = {
  portrait: "image",
  gallery: "image",
  story: "image",
  gift: "image",
  music: "audio",
} as const satisfies Record<UploadPurpose, MediaKind>

export const UPLOAD_RULES = {
  image: {
    mimes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    maxBytes: 8 * 1024 * 1024,
  },
  audio: {
    mimes: ["audio/mpeg", "audio/mp4", "audio/ogg"],
    maxBytes: 10 * 1024 * 1024,
  },
} as const satisfies Record<
  MediaKind,
  { mimes: ReadonlyArray<string>; maxBytes: number }
>

/** Client-side resize target for photos (Phase 4 acceptance: 6 MB JPEG → ≤ 800 KB WebP). */
export const IMAGE_RESIZE = {
  maxEdge: 2400,
  mime: "image/webp",
  quality: 0.82,
  targetBytes: 800 * 1024,
} as const

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/ogg": "ogg",
}

export function extensionFor(mime: string): string {
  return EXT[mime] ?? "bin"
}

export type UploadCheck = { ok: true } | { ok: false; reason: string }

export function checkUpload(
  kind: MediaKind,
  mime: string,
  bytes: number
): UploadCheck {
  const rule = UPLOAD_RULES[kind]
  if (!(rule.mimes as ReadonlyArray<string>).includes(mime)) {
    return {
      ok: false,
      reason: `Unsupported ${kind} type (${mime || "unknown"}).`,
    }
  }
  if (!Number.isInteger(bytes) || bytes <= 0)
    return { ok: false, reason: "The file is empty." }
  if (bytes > rule.maxBytes) {
    return {
      ok: false,
      reason: `Too large: the limit is ${Math.round(rule.maxBytes / 1024 / 1024)} MB.`,
    }
  }
  return { ok: true }
}

/** Object keys are owner-scoped so a confirm can prove ownership by prefix. */
export function ownerPrefix(ownerId: string): string {
  return `useruploads/${ownerId.replace(/[^a-zA-Z0-9_-]/g, "_")}/`
}

/** useruploads/<ownerId>/<id>.<ext>: one flat folder per owner. */
export function newObjectKey(
  ownerId: string,
  mime: string,
  id: string
): string {
  return `${ownerPrefix(ownerId)}${id}.${extensionFor(mime)}`
}

/** Keys we generate: no traversal, no odd characters. */
export const ObjectKey = z
  .string()
  .max(300)
  .regex(/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_.-]+)+$/, "Invalid object key")
  .refine(
    (key) => !key.split("/").some((part) => part === ".." || part === "."),
    "Invalid object key"
  )
