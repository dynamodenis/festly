// Who is making this request: the Better Auth session from the request
// cookies. Every server function goes through `requireUserId`, so ownership
// checks downstream only ever see a real user id.
import { getRequestHeaders } from "@tanstack/react-start/server"
import { serverEnv } from "@/env.server"
import { SIGN_IN_REQUIRED } from "@/lib/auth-errors"
import type { Db } from "@/server/db/client.server"
import { users } from "@/server/db/schema"
import { DEV_USER } from "@/server/db/seed"
import { getAuth } from "./auth.server"

export class UnauthorizedError extends Error {
  constructor(message = SIGN_IN_REQUIRED) {
    super(message)
    this.name = "UnauthorizedError"
  }
}

export type CurrentUser = {
  id: string
  email: string
  name: string | null
  image: string | null
}

/** Opt-in fallback for local demos and scripts (ALLOW_DEV_USER=true). */
export function devUserAllowed(env = serverEnv): boolean {
  return env.ALLOW_DEV_USER
}

/** The signed-in user, or null. */
export async function currentUser(db: Db): Promise<CurrentUser | null> {
  const session = await getAuth().api.getSession({
    headers: getRequestHeaders(),
  })
  if (session) {
    const { id, email, name, image } = session.user
    return { id, email, name, image: image ?? null }
  }
  if (devUserAllowed()) {
    await db.insert(users).values(DEV_USER).onConflictDoNothing()
    return { ...DEV_USER, image: null }
  }
  return null
}

/** The signed-in user's id; throws UnauthorizedError when nobody is. */
export async function requireUserId(db: Db): Promise<string> {
  const user = await currentUser(db)
  if (!user) throw new UnauthorizedError()
  return user.id
}
