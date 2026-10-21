/** A signed, short-lived instruction for the browser to upload one object directly. */
export type UploadTarget = {
  url: string
  method: "PUT"
  /** Headers the browser must send exactly (they are part of the signature). */
  headers: Record<string, string>
  expiresAt: string
}

export type ObjectInfo = { bytes: number; mime: string }

/**
 * Object storage behind uploads. Bytes never pass through server functions:
 * the server signs, the browser PUTs, the server confirms with `head`.
 */
export interface StorageDriver {
  readonly id: "r2" | "local"
  createUploadTarget: (input: {
    key: string
    mime: string
    bytes: number
  }) => Promise<UploadTarget>
  head: (key: string) => Promise<ObjectInfo | null>
  delete: (key: string) => Promise<void>
  publicUrl: (key: string) => string
}

/** Presigned URLs live at most 10 minutes (build prompt, Phase 8 security). */
export const UPLOAD_TTL_SECONDS = 600
