// Local storage driver only: receives the browser's signed PUT (stands in
// for R2's presigned endpoint during development).
import { createFileRoute } from "@tanstack/react-router"
import { serverEnv } from "@/env.server"
import { ObjectKey, checkUpload, type MediaKind } from "@/lib/upload-policy"
import { getStorage } from "@/server/storage/index.server"
import {
  LOCAL_ROOT,
  verifyUpload,
  writeLocalObject,
} from "@/server/storage/local.server"

const SECRET_FALLBACK = "festly-local-storage-dev-secret"

export const Route = createFileRoute("/api/storage/upload")({
  server: {
    handlers: {
      PUT: async ({ request }) => {
        if (getStorage().id !== "local")
          return new Response("Not found", { status: 404 })
        const q = new URL(request.url).searchParams
        const key = q.get("key") ?? ""
        const mime = q.get("mime") ?? ""
        const bytes = Number(q.get("bytes"))
        const exp = Number(q.get("exp"))
        const sig = q.get("sig") ?? ""
        const secret = serverEnv.STORAGE_SIGNING_SECRET ?? SECRET_FALLBACK

        if (
          !ObjectKey.safeParse(key).success ||
          !verifyUpload(secret, { key, mime, bytes, exp }, sig)
        ) {
          return new Response("Invalid or expired upload URL", { status: 403 })
        }
        if (request.headers.get("content-type") !== mime) {
          return new Response("Content-Type does not match the signed type", {
            status: 400,
          })
        }
        const kind: MediaKind =
          key.split("/")[2] === "audio" ? "audio" : "image"
        const body = new Uint8Array(await request.arrayBuffer())
        const verdict = checkUpload(kind, mime, body.byteLength)
        if (!verdict.ok || body.byteLength > bytes) {
          return new Response(
            verdict.ok ? "Larger than signed" : verdict.reason,
            { status: 413 }
          )
        }
        await writeLocalObject(LOCAL_ROOT, key, mime, body)
        return new Response(null, { status: 200 })
      },
    },
  },
})
