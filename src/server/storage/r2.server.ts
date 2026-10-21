// Cloudflare R2 through its S3-compatible endpoint, signed with aws4fetch
// (the small SigV4 signer listed in Cloudflare's R2 docs; no AWS SDK).
import { AwsClient } from "aws4fetch"
import type { StorageDriver, UploadTarget } from "./types"
import { UPLOAD_TTL_SECONDS } from "./types"

export type R2Config = {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  publicUrl: string
}

const encodeKey = (key: string) =>
  key.split("/").map(encodeURIComponent).join("/")

export function createR2Driver(
  config: R2Config,
  fetchImpl: typeof fetch = fetch
): StorageDriver {
  const client = new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    service: "s3",
    region: "auto",
  })
  const endpoint = `https://${config.accountId}.r2.cloudflarestorage.com/${config.bucket}`
  const objectUrl = (key: string) => `${endpoint}/${encodeKey(key)}`
  const publicBase = config.publicUrl.replace(/\/$/, "")

  return {
    id: "r2",

    async createUploadTarget({ key, mime }): Promise<UploadTarget> {
      const url = new URL(objectUrl(key))
      url.searchParams.set("X-Amz-Expires", String(UPLOAD_TTL_SECONDS))
      // Content-Type is signed, so the browser cannot upload a different type.
      const signed = await client.sign(
        new Request(url, { method: "PUT", headers: { "Content-Type": mime } }),
        { aws: { signQuery: true, allHeaders: true } }
      )
      return {
        url: signed.url,
        method: "PUT",
        headers: { "Content-Type": mime },
        expiresAt: new Date(
          Date.now() + UPLOAD_TTL_SECONDS * 1000
        ).toISOString(),
      }
    },

    async head(key) {
      const signed = await client.sign(objectUrl(key), { method: "HEAD" })
      const res = await fetchImpl(signed)
      if (res.status === 404) return null
      if (!res.ok) throw new Error(`R2 HEAD failed: ${res.status}`)
      return {
        bytes: Number(res.headers.get("content-length") ?? 0),
        mime: res.headers.get("content-type") ?? "application/octet-stream",
      }
    },

    async delete(key) {
      const signed = await client.sign(objectUrl(key), { method: "DELETE" })
      const res = await fetchImpl(signed)
      if (!res.ok && res.status !== 404)
        throw new Error(`R2 DELETE failed: ${res.status}`)
    },

    publicUrl: (key) => `${publicBase}/${encodeKey(key)}`,
  }
}
