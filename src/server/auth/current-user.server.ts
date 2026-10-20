// Who is making this request. Phase 5 replaces the body with a real session
// lookup; every caller already goes through `requireUserId`, so the swap is
// local to this file.
import { serverEnv } from "@/env.server"
import type { Db } from "@/server/db/client.server"
import { users } from "@/server/db/schema"
import { DEV_USER } from "@/server/db/seed"

export class UnauthorizedError extends Error {
  constructor(message = "Please sign in to continue.") {
    super(message)
    this.name = "UnauthorizedError"
  }
}

export function devUserAllowed(env = serverEnv): boolean {
  return env.NODE_ENV !== "production" || env.ALLOW_DEV_USER
}

/** The current user's id, creating the dev user row on first use. */
export async function requireUserId(db: Db): Promise<string> {
  if (!devUserAllowed()) throw new UnauthorizedError()
  await db.insert(users).values(DEV_USER).onConflictDoNothing()
  return DEV_USER.id
}
