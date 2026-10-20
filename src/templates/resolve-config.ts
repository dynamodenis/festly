import type { z } from "zod"
import { deepMerge } from "@/lib/deep-merge"
import type { InvitationConfigBase } from "./_shared/schema"
import type { TemplateModule } from "./types"

export type ResolvedConfig = {
  config: InvitationConfigBase
  /** Why the raw config was not used as-is; `null` when it parsed cleanly. */
  issues: ReadonlyArray<z.core.$ZodIssue> | null
  source: "config" | "merged-defaults" | "defaults"
}

/**
 * Parse an invitation config with the template's schema. A config that fails
 * (older shape, missing template-specific fields) is merged over the template
 * defaults and parsed again, so a stale row still renders. Failures are
 * logged, never thrown: a published page must not 500 over a bad field.
 */
export function resolveConfig(
  module: TemplateModule,
  raw: unknown
): ResolvedConfig {
  const direct = module.schema.safeParse(raw)
  if (direct.success) {
    return { config: direct.data, issues: null, source: "config" }
  }
  console.warn(
    `[templates] config for "${module.meta.id}" failed validation; merging defaults`,
    direct.error.issues
  )
  const merged = module.schema.safeParse(deepMerge(module.defaults, raw))
  if (merged.success) {
    return {
      config: merged.data,
      issues: direct.error.issues,
      source: "merged-defaults",
    }
  }
  console.error(
    `[templates] merged config for "${module.meta.id}" still invalid; using defaults`,
    merged.error.issues
  )
  return {
    config: module.defaults,
    issues: merged.error.issues,
    source: "defaults",
  }
}
