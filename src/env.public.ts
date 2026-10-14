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
  /** Allow /dev/* routes in a production build (off by default). */
  VITE_ENABLE_DEV_ROUTES: booleanString,
})

export type PublicEnv = z.infer<typeof publicEnvSchema>

export function parsePublicEnv(
  source: Record<string, string | undefined>
): PublicEnv {
  const result = publicEnvSchema.safeParse(source)
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
  VITE_ENABLE_DEV_ROUTES: import.meta.env.VITE_ENABLE_DEV_ROUTES,
})
