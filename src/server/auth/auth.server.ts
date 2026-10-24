// Better Auth instance: email + password and Google, sessions in Postgres via
// Drizzle (users / sessions / accounts / verifications). Built on first use
// so routes that never touch auth still boot without DATABASE_URL.
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { serverEnv, type ServerEnv } from "@/env.server"
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core"
import { getDb } from "@/server/db/client.server"
import * as schema from "@/server/db/schema"
import { sendEmail, type EmailSender } from "@/server/email/send.server"
import {
  resetPasswordEmail,
  verifyEmail,
} from "@/server/email/templates.server"

// Public on purpose: env validation refuses to start production without a
// real BETTER_AUTH_SECRET.
const DEV_SECRET = "festly-dev-only-auth-secret-never-use-in-production"

/** Any Drizzle Postgres database (node-postgres in the app, PGlite in tests). */
type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>

export function createAuth(db: AnyDb, env: ServerEnv, send: EmailSender) {
  const google =
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
        }
      : undefined

  return betterAuth({
    appName: "Festly",
    baseURL: env.APP_ORIGIN,
    secret: env.BETTER_AUTH_SECRET ?? DEV_SECRET,
    database: drizzleAdapter(db, { provider: "pg", schema, usePlural: true }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      // Sign-up lands straight in the editor; verification is asked for, not
      // required, so the first invitation is never blocked on an inbox.
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url }) => {
        await send(resetPasswordEmail(user.email, url))
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        await send(verifyEmail(user.email, url))
      },
    },
    socialProviders: google,
    // Signing in with Google on an address that already has a password joins
    // the two instead of failing (Google verifies the address).
    account: {
      accountLinking: { enabled: true, trustedProviders: ["google"] },
    },
    // Must stay last: lets auth calls inside server functions set cookies.
    plugins: [tanstackStartCookies()],
  })
}

export type Auth = ReturnType<typeof createAuth>

let instance: Auth | undefined
export function getAuth(): Auth {
  return (instance ??= createAuth(getDb(), serverEnv, sendEmail))
}

/** Which sign-in methods this deployment offers (for the sign-in page). */
export function authMethods(env: ServerEnv = serverEnv) {
  return { google: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) }
}
