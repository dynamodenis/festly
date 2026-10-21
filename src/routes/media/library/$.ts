// Stable URL for library tracks: /media/library/<file> → storage public URL.
// Invitations reference track ids; this indirection lets files move freely.
import { createFileRoute } from "@tanstack/react-router"
import { LIBRARY_FILE } from "@/lib/music-library"
import { getStorage } from "@/server/storage/index.server"

export const Route = createFileRoute("/media/library/$")({
  server: {
    handlers: {
      GET: ({ params }) => {
        const file = decodeURIComponent(params._splat ?? "")
        if (!LIBRARY_FILE.test(file))
          return new Response("Not found", { status: 404 })
        return new Response(null, {
          status: 302,
          headers: {
            Location: getStorage().publicUrl(`library/${file}`),
            "Cache-Control": "public, max-age=3600",
          },
        })
      },
    },
  },
})
