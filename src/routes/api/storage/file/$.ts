// Local storage driver only: serves uploaded files, with HTTP Range support
// (Safari will not play audio from a server that ignores Range).
import { createFileRoute } from "@tanstack/react-router"
import { ObjectKey } from "@/lib/upload-policy"
import { getStorage } from "@/server/storage/index.server"
import { LOCAL_ROOT, readLocalObject } from "@/server/storage/local.server"

export const Route = createFileRoute("/api/storage/file/$")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        if (getStorage().id !== "local")
          return new Response("Not found", { status: 404 })
        const key = decodeURIComponent(params._splat ?? "")
        if (!ObjectKey.safeParse(key).success)
          return new Response("Not found", { status: 404 })
        const object = await readLocalObject(LOCAL_ROOT, key)
        if (!object) return new Response("Not found", { status: 404 })

        const size = object.body.byteLength
        const headers: Record<string, string> = {
          "Content-Type": object.mime,
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=31536000, immutable",
        }
        const range = /^bytes=(\d*)-(\d*)$/.exec(
          request.headers.get("range") ?? ""
        )
        if (range) {
          const start = range[1]
            ? Number(range[1])
            : Math.max(0, size - Number(range[2]))
          const end =
            range[1] && range[2]
              ? Math.min(Number(range[2]), size - 1)
              : size - 1
          if (start > end || start >= size) {
            return new Response(null, {
              status: 416,
              headers: { "Content-Range": `bytes */${size}` },
            })
          }
          return new Response(object.body.subarray(start, end + 1), {
            status: 206,
            headers: {
              ...headers,
              "Content-Range": `bytes ${start}-${end}/${size}`,
              "Content-Length": String(end - start + 1),
            },
          })
        }
        return new Response(object.body, {
          headers: { ...headers, "Content-Length": String(size) },
        })
      },
    },
  },
})
