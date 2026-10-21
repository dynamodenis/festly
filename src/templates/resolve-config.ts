import type { z } from "zod"
import { deepMerge } from "@/lib/deep-merge"
import { getIn, setIn } from "@/lib/set-in"
import type { InvitationConfigBase } from "./_shared/schema"
import type { TemplateModule } from "./types"

export type ResolvedConfig = {
  config: InvitationConfigBase
  /** Why the raw config was not used as-is; `null` when it parsed cleanly. */
  issues: ReadonlyArray<z.core.$ZodIssue> | null
  /**
   * config: parsed as-is · merged-defaults: missing fields filled from the
   * template defaults · repaired: only the failing fields replaced ·
   * defaults: unusable, the template's sample content is shown.
   */
  source: "config" | "merged-defaults" | "repaired" | "defaults"
}

const logged = new Set<string>()

/** Log each distinct problem once per page load (the editor re-resolves on every keystroke). */
function logOnce(
  level: "warn" | "error",
  templateId: string,
  message: string,
  issues: ReadonlyArray<z.core.$ZodIssue>
) {
  const key = `${level}:${templateId}:${issues.map((i) => i.path.join(".")).join("|")}`
  if (logged.has(key)) return
  logged.add(key)
  console[level](`[templates] "${templateId}": ${message}`, issues)
}

/**
 * Replace just the failing paths with the template default (or drop them
 * when the default has nothing there), so one bad field never discards the
 * rest. A few rounds cover issues that only surface after a fix.
 */
function repair(
  module: TemplateModule,
  value: unknown,
  issues: ReadonlyArray<z.core.$ZodIssue>
) {
  let current = value
  let pending = issues
  for (let round = 0; round < 4; round++) {
    for (const issue of pending) {
      const path = issue.path as Array<string | number>
      if (path.length === 0) return null
      const fallback = getIn(module.defaults, path)
      if (fallback !== undefined) {
        current = setIn(current, path, fallback)
        continue
      }
      // No default here: drop the nearest enclosing list item, else the field.
      let listAt = -1
      for (let i = path.length - 1; i > 0; i--) {
        if (Array.isArray(getIn(current, path.slice(0, i)))) {
          listAt = i
          break
        }
      }
      if (listAt > 0) {
        const listPath = path.slice(0, listAt)
        const list = getIn(current, listPath) as Array<unknown>
        current = setIn(
          current,
          listPath,
          list.filter((_, i) => i !== path[listAt])
        )
      } else {
        current = setIn(current, path, undefined)
      }
    }
    const parsed = module.schema.safeParse(current)
    if (parsed.success) return parsed.data
    pending = parsed.error.issues
  }
  return null
}

/**
 * Parse an invitation config with the template's schema. Failures are
 * logged, never thrown: a published page must not 500 over a bad field, and
 * the editor preview must not jump to sample content when one field is
 * briefly empty.
 */
export function resolveConfig(
  module: TemplateModule,
  raw: unknown
): ResolvedConfig {
  const direct = module.schema.safeParse(raw)
  if (direct.success)
    return { config: direct.data, issues: null, source: "config" }

  const mergedInput = deepMerge(module.defaults, raw)
  const merged = module.schema.safeParse(mergedInput)
  if (merged.success) {
    logOnce(
      "warn",
      module.meta.id,
      "filled missing fields from defaults",
      direct.error.issues
    )
    return {
      config: merged.data,
      issues: direct.error.issues,
      source: "merged-defaults",
    }
  }

  const repaired = repair(module, mergedInput, merged.error.issues)
  if (repaired) {
    logOnce(
      "warn",
      module.meta.id,
      "replaced invalid fields with defaults",
      merged.error.issues
    )
    return { config: repaired, issues: merged.error.issues, source: "repaired" }
  }

  logOnce(
    "error",
    module.meta.id,
    "config unusable; showing defaults",
    merged.error.issues
  )
  return {
    config: module.defaults,
    issues: merged.error.issues,
    source: "defaults",
  }
}
