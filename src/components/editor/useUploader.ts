import { useServerFn } from "@tanstack/react-start"
import { useCallback } from "react"
import { audioDuration, prepareImage } from "@/lib/image-resize"
import {
  UPLOAD_RULES,
  checkUpload,
  type UploadPurpose,
} from "@/lib/upload-policy"
import {
  minDuration,
  putWithProgress,
  type OnUploadProgress,
} from "@/lib/upload-request"
import {
  confirmUploadFn,
  createUploadUrlFn,
} from "@/server/media/media.functions"

export type UploadedImage = {
  assetKey: string
  url: string
  width?: number
  height?: number
}
export type UploadedAudio = {
  assetKey: string
  url: string
  durationSec?: number
}

/** Uploads always show their state for at least this long (no flicker). */
const MIN_VISIBLE_MS = 400

/**
 * sign → PUT straight to storage (bytes never touch a server fn) → confirm,
 * reporting each stage: resizing (photos), uploading n%, saving.
 */
export function useUploader(invitationId: string) {
  const createUploadUrl = useServerFn(createUploadUrlFn)
  const confirmUpload = useServerFn(confirmUploadFn)

  const put = useCallback(
    async (
      kind: "image" | "audio",
      purpose: UploadPurpose,
      blob: Blob,
      onProgress?: OnUploadProgress
    ) => {
      const verdict = checkUpload(kind, blob.type, blob.size)
      if (!verdict.ok) throw new Error(verdict.reason)
      onProgress?.({ stage: "uploading", percent: 0 })
      const { key, upload } = await createUploadUrl({
        data: { kind, purpose, mime: blob.type, bytes: blob.size },
      })
      await putWithProgress(upload, blob, (percent) =>
        onProgress?.({ stage: "uploading", percent })
      )
      onProgress?.({ stage: "saving" })
      return key
    },
    [createUploadUrl]
  )

  const uploadImage = useCallback(
    (
      file: File,
      purpose: Exclude<UploadPurpose, "music">,
      onProgress?: OnUploadProgress
    ): Promise<UploadedImage> =>
      minDuration(
        (async () => {
          if (
            !(UPLOAD_RULES.image.mimes as ReadonlyArray<string>).includes(
              file.type
            )
          ) {
            throw new Error("Use a JPEG, PNG, WebP or AVIF photo.")
          }
          onProgress?.({ stage: "resizing" })
          const prepared = await prepareImage(file)
          const key = await put("image", purpose, prepared.blob, onProgress)
          const ref = await confirmUpload({
            data: {
              key,
              kind: "image",
              invitationId,
              width: prepared.width,
              height: prepared.height,
            },
          })
          return {
            assetKey: ref.assetKey,
            url: ref.url,
            width: ref.width,
            height: ref.height,
          }
        })(),
        MIN_VISIBLE_MS
      ),
    [put, confirmUpload, invitationId]
  )

  const uploadAudio = useCallback(
    (file: File, onProgress?: OnUploadProgress): Promise<UploadedAudio> =>
      minDuration(
        (async () => {
          const durationSec = await audioDuration(file)
          const key = await put("audio", "music", file, onProgress)
          const ref = await confirmUpload({
            data: { key, kind: "audio", invitationId, durationSec },
          })
          return { assetKey: ref.assetKey, url: ref.url, durationSec }
        })(),
        MIN_VISIBLE_MS
      ),
    [put, confirmUpload, invitationId]
  )

  return { uploadImage, uploadAudio }
}
