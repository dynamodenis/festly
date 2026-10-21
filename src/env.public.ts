// Public environment, safe on both server and client. Only VITE_* variables
// are exposed by Vite, so nothing secret may be declared here.
// Note: this is deliberately NOT named *.client.ts — TanStack Start's import
// protection forbids importing *.client.* from code that also runs on the
// server, and routes/loaders are isomorphic.
import { z } from "zod"

const booleanString = z
  .enum(["true", "false", "1", "0"])
  .optional()
  .transform((value) => value === "true" || value === "1")

const publicEnvSchema = z.object({
  VITE_APP_NAME: z.string().min(1).default("Festly"),
  /** Google Maps Embed API key (free, unlimited). Restrict by HTTP referrer in Google Cloud. */
  VITE_GOOGLE_MAPS_EMBED_KEY: z.string().optional(),
  /** Map display adapter (rule 11). google-embed needs no key. */
  VITE_MAP_DISPLAY_PROVIDER: z
    .enum(["google-embed", "google-js", "mapbox", "radar", "leaflet"])
    .default("google-embed"),
  /** Maps JavaScript API key (google-js). Restrict by HTTP referrer. */
  VITE_GOOGLE_MAPS_JS_KEY: z.string().optional(),
  /** Public token (mapbox). URL-restrict it in the Mapbox dashboard. */
  VITE_MAPBOX_TOKEN: z.string().optional(),
  /** Publishable key (radar), prj_live_pk_... or prj_test_pk_... */
  VITE_RADAR_PUBLISHABLE_KEY: z.string().optional(),
  /** Allow /dev/* routes in a production build (off by default). */
  VITE_ENABLE_DEV_ROUTES: booleanString,
})

export type PublicEnv = z.infer<typeof publicEnvSchema>

export function parsePublicEnv(
  source: Record<string, string | undefined>
): PublicEnv {
  const cleaned = Object.fromEntries(
    Object.entries(source).filter(([, value]) => value !== "")
  )
  const result = publicEnvSchema.safeParse(cleaned)
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n")
    throw new Error(`Invalid public environment:\n${issues}`)
  }
  return result.data
}

export const publicEnv: PublicEnv = parsePublicEnv({
  VITE_APP_NAME: import.meta.env.VITE_APP_NAME,
  VITE_GOOGLE_MAPS_EMBED_KEY: import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY,
  VITE_MAP_DISPLAY_PROVIDER: import.meta.env.VITE_MAP_DISPLAY_PROVIDER,
  VITE_GOOGLE_MAPS_JS_KEY: import.meta.env.VITE_GOOGLE_MAPS_JS_KEY,
  VITE_MAPBOX_TOKEN: import.meta.env.VITE_MAPBOX_TOKEN,
  VITE_RADAR_PUBLISHABLE_KEY: import.meta.env.VITE_RADAR_PUBLISHABLE_KEY,
  VITE_ENABLE_DEV_ROUTES: import.meta.env.VITE_ENABLE_DEV_ROUTES,
})
