// Server-only environment. The `.server.ts` suffix makes TanStack Start refuse
// to bundle this file into client code, so secrets (DATABASE_URL, and later
// storage keys and auth secrets) can live here.
import { z } from "zod"

export const R2_KEYS = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
  "R2_PUBLIC_URL",
] as const

const serverEnvSchema = z
  .object({
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
     * Where uploads go. `r2`: Cloudflare R2 (all R2_* required). `local`:
     * .storage/ on this machine (development only). Unset: R2 when fully
     * configured, otherwise local in development.
     */
    STORAGE_DRIVER: z.enum(["local", "r2"]).optional(),
    /** Cloudflare R2. Set all five, or none (see docs/STORAGE.md). */
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
    /**
     * Better Auth: signs session cookies and tokens. Required in production;
     * generate with `openssl rand -base64 32`. Development falls back to a
     * fixed, public value.
     */
    BETTER_AUTH_SECRET: z.string().min(32).optional(),
    /** Google sign-in (OAuth client, "Web application"). Set both or neither. */
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    /** Resend API key. Without it, development prints emails to the server log. */
    RESEND_API_KEY: z.string().min(1).optional(),
    /** Sender, e.g. "Festly <hello@yourdomain.com>" (domain verified in Resend). */
    EMAIL_FROM: z.string().min(3).optional(),
    /**
     * When nobody is signed in, act as a fixed dev user instead of refusing.
     * Off unless set to "true"; for local demos and scripts, never a real
     * deployment.
     */
    ALLOW_DEV_USER: z
      .enum(["true", "false", "1", "0"])
      .optional()
      .transform((value) => value === "true" || value === "1"),
  })
  .superRefine((env, ctx) => {
    // Storage must be unambiguous: fail at startup, naming what is missing.
    const missing = R2_KEYS.filter((key) => !env[key])
    const partial = missing.length > 0 && missing.length < R2_KEYS.length
    if (env.STORAGE_DRIVER === "r2" || partial) {
      for (const key of missing) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message:
            env.STORAGE_DRIVER === "r2"
              ? "required when STORAGE_DRIVER=r2"
              : "R2 is partly configured; set all five R2_* variables or none",
        })
      }
    }
    if (!!env.GOOGLE_CLIENT_ID !== !!env.GOOGLE_CLIENT_SECRET) {
      ctx.addIssue({
        code: "custom",
        path: [
          env.GOOGLE_CLIENT_ID ? "GOOGLE_CLIENT_SECRET" : "GOOGLE_CLIENT_ID",
        ],
        message:
          "set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET, or neither",
      })
    }
    if (env.NODE_ENV === "production") {
      for (const key of [
        "BETTER_AUTH_SECRET",
        "RESEND_API_KEY",
        "EMAIL_FROM",
      ] as const) {
        if (!env[key]) {
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: "required in production",
          })
        }
      }
    }
    if (env.STORAGE_DRIVER === "local" && env.NODE_ENV === "production") {
      ctx.addIssue({
        code: "custom",
        path: ["STORAGE_DRIVER"],
        message: "local storage is for development only; use r2 in production",
      })
    }
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
