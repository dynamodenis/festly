// Browser side of Better Auth. Same origin as the app, so no baseURL.
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient()

/**
 * Where to go after signing in. Only same-site paths, so a crafted
 * `?redirect=https://evil.example` can never bounce users off-site.
 */
export function safeRedirect(
  target: string | undefined,
  fallback = "/dashboard"
) {
  if (!target || !target.startsWith("/") || target.startsWith("//")) {
    return fallback
  }
  if (target.startsWith("/\\")) return fallback
  return target
}
