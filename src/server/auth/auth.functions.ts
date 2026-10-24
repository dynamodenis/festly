// Session reads for routes. Safe to import from route files: the build swaps
// handlers for RPC stubs in the client bundle.
import { createServerFn } from "@tanstack/react-start"
import { getDb } from "@/server/db/client.server"
import { authMethods } from "./auth.server"
import { currentUser } from "./current-user.server"

/** The signed-in user (or null) plus which sign-in methods are configured. */
export const getSessionFn = createServerFn({ method: "GET" }).handler(
  async () => ({
    user: await currentUser(getDb()),
    methods: authMethods(),
  })
)
