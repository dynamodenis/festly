import { useServerFn } from "@tanstack/react-start"
import { useCallback } from "react"
import { audioDuration, prepareImage } from "@/lib/image-resize"
import { UPLOAD_RULES, checkUpload } from "@/lib/upload-policy"
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

/** sign → PUT straight to storage (bytes never touch a server fn) → confirm. */
export function useUploader(invitationId: string) {
  const createUploadUrl = useServerFn(createUploadUrlFn)
  const confirmUpload = useServerFn(confirmUploadFn)

  const put = useCallback(
    async (kind: "image" | "audio", blob: Blob) => {
      const verdict = checkUpload(kind, blob.type, blob.size)
      if (!verdict.ok) throw new Error(verdict.reason)
      const { key, upload } = await createUploadUrl({
        data: { kind, mime: blob.type, bytes: blob.size },
      })
      const res = await fetch(upload.url, {
        method: upload.method,
        headers: upload.headers,
        body: blob,
      })
      if (!res.ok) throw new Error(`Upload failed (${res.status})`)
      return key
    },
    [createUploadUrl]
  )

  const uploadImage = useCallback(
    async (file: File): Promise<UploadedImage> => {
      if (
        !(UPLOAD_RULES.image.mimes as ReadonlyArray<string>).includes(file.type)
      ) {
        throw new Error("Use a JPEG, PNG, WebP or AVIF photo.")
      }
      const prepared = await prepareImage(file)
      const key = await put("image", prepared.blob)
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
    },
    [put, confirmUpload, invitationId]
  )

  const uploadAudio = useCallback(
    async (file: File): Promise<UploadedAudio> => {
      const durationSec = await audioDuration(file)
      const key = await put("audio", file)
      const ref = await confirmUpload({
        data: { key, kind: "audio", invitationId, durationSec },
      })
      return { assetKey: ref.assetKey, url: ref.url, durationSec }
    },
    [put, confirmUpload, invitationId]
  )

  return { uploadImage, uploadAudio }
}
