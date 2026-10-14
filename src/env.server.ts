// Server-only environment. The `.server.ts` suffix makes TanStack Start refuse
// to bundle this file into client code, so secrets can live here later
// (DATABASE_URL, storage keys, auth secrets) once those providers are chosen.
import { z } from "zod"

const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  /** Public origin of this deployment, used for absolute URLs (OG images, share links). */
  APP_ORIGIN: z.url().default("http://localhost:3000"),
  /** Sent in the Nominatim User-Agent header (their usage policy requires a contact). */
  GEOCODE_CONTACT_EMAIL: z.email().optional(),
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
