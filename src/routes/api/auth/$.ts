// Better Auth's HTTP endpoints (sign-in, sign-up, OAuth callbacks, password
// reset, sessions) under /api/auth/*.
import { createFileRoute } from "@tanstack/react-router"
import { getAuth } from "@/server/auth/auth.server"

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => getAuth().handler(request),
      POST: ({ request }) => getAuth().handler(request),
    },
  },
})
