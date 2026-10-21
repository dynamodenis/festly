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
  /**
   * Until real auth lands (Phase 5), "Use this template" acts as a fixed dev
   * user. Always on outside production; set to "true" to allow it in a
   * production build (demos only, never a real deployment).
   */
  /**
   * Cloudflare R2 (object storage). When all five are set uploads go to R2;
   * otherwise development falls back to the local-disk driver (.storage/).
   */
  R2_ACCOUNT_ID: z.string().min(1).optional(),
  R2_ACCESS_KEY_ID: z.string().min(1).optional(),
  R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  R2_BUCKET: z.string().min(1).optional(),
  /** Public base URL of the bucket: an r2.dev URL or a custom domain. */
  R2_PUBLIC_URL: z.url({ protocol: /^https?$/ }).optional(),
  /** HMAC secret for the local storage driver's signed upload URLs (dev only). */
  STORAGE_SIGNING_SECRET: z.string().min(16).optional(),
  /** Geocoder (rule 11): nominatim (default, keyless) | google | mapbox | radar */
  GEOCODE_PROVIDER: z
    .enum(["nominatim", "google", "mapbox", "radar"])
    .default("nominatim"),
  GOOGLE_GEOCODING_KEY: z.string().min(1).optional(),
  MAPBOX_GEOCODING_TOKEN: z.string().min(1).optional(),
  RADAR_SECRET_KEY: z.string().min(1).optional(),
  ALLOW_DEV_USER: z
    .enum(["true", "false", "1", "0"])
    .optional()
    .transform((value) => value === "true" || value === "1"),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>

export function parseServerEnv(
  source: Record<string, string | undefined>
): ServerEnv {
  // `KEY=` lines in .env arrive as "", which should mean "not set".
  const cleaned = Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== "")
  )
  const result = serverEnvSchema.safeParse(cleaned)
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n")
    throw new Error(`Invalid server environment:\n${issues}`)
  }
  return result.data
}

export const serverEnv: ServerEnv = parseServerEnv(process.env)
