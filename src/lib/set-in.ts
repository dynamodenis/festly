export type Path = ReadonlyArray<string | number>

/** Read a nested value. */
export function getIn(obj: unknown, path: Path): unknown {
  let cur = obj
  for (const key of path) {
    if (cur === null || typeof cur !== "object") return undefined
    cur = (cur as Record<string | number, unknown>)[key]
  }
  return cur
}

/**
 * Immutable nested set: copies only the objects/arrays along the path.
 * `undefined` deletes object keys (so optional fields disappear, not "").
 */
export function setIn<T>(obj: T, path: Path, value: unknown): T {
  if (path.length === 0) return value as T
  const [head, ...rest] = path
  const source = (obj ?? (typeof head === "number" ? [] : {})) as Record<
    string | number,
    unknown
  >
  const next = setIn(source[head], rest, value)
  if (Array.isArray(source)) {
    const copy = [...source]
    copy[head as number] = next
    return copy as T
  }
  const copy = { ...source }
  if (next === undefined && rest.length === 0) delete copy[head]
  else copy[head] = next
  return copy as T
}

/** Path → "hosts.0.name", for matching Zod issue paths. */
export const pathKey = (path: ReadonlyArray<PropertyKey>) =>
  path.map(String).join(".")
