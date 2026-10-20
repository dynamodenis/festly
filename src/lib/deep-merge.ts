type Plain = Record<string, unknown>

const isPlain = (value: unknown): value is Plain =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype

/**
 * Recursively merge `patch` over `base`. Objects merge key by key; arrays and
 * primitives in `patch` replace the base value; `undefined` keeps the base.
 * Used to fill a partial or outdated config from a template's defaults.
 */
export function deepMerge<T>(base: T, patch: unknown): T {
  if (!isPlain(base) || !isPlain(patch)) {
    return (patch === undefined ? base : patch) as T
  }
  const out: Plain = { ...base }
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue
    out[key] =
      isPlain(value) && isPlain(out[key]) ? deepMerge(out[key], value) : value
  }
  return out as T
}
