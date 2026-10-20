// Server-only environment. The `.server.ts` suffix makes TanStack Start refuse
// to bundle this file into client code, so secrets (DATABASE_URL, and later
// storage keys and auth secrets) can live here.
import { z } from "zod"

const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  /** Public origin of this deployment, used for absolute URLs (OG images, share links). */
  APP_ORIGIN: z.url().default("http://localhost:3000"),
  /** Sent in the Nominatim User-Agent header (their usage policy requires a contact). */
  GEOCODE_CONTACT_EMAIL: z.email().optional(),
  /**
   * Postgres connection string. On Neon use the pooled URL (host contains
   * "-pooler") with sslmode=require. Optional so pages that never touch the
   * database still boot; `getDb()` throws a clear error when it is missing.
   */
  DATABASE_URL: z
    .url({
      protocol: /^postgres(ql)?$/,
      error: "DATABASE_URL must be a postgres:// or postgresql:// URL",
    })
    .optional(),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>

export function parseServerEnv(
  source: Record<string, string | undefined>
): ServerEnv {
  const result = serverEnvSchema.safeParse(source)
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n")
    throw new Error(`Invalid server environment:\n${issues}`)
  }
  return result.data
}

export const serverEnv: ServerEnv = parseServerEnv(process.env)
