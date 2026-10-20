import { describe, expect, it } from "vitest"
import { deepMerge } from "./deep-merge"

describe("deepMerge", () => {
  it("merges nested objects and replaces arrays", () => {
    const base = { a: 1, nested: { x: 1, y: 2 }, list: [1, 2, 3] }
    const out = deepMerge(base, { nested: { y: 9 }, list: [7] })
    expect(out).toEqual({ a: 1, nested: { x: 1, y: 9 }, list: [7] })
    expect(base.nested.y).toBe(2)
  })

  it("ignores undefined and keeps unknown extra keys", () => {
    expect(deepMerge({ a: 1, b: 2 }, { a: undefined, c: 3 })).toEqual({
      a: 1,
      b: 2,
      c: 3,
    })
  })

  it("returns the patch for non-object inputs", () => {
    expect(deepMerge(1, 2)).toBe(2)
    expect(deepMerge({ a: 1 }, null)).toBeNull()
    expect(deepMerge({ a: 1 }, undefined)).toEqual({ a: 1 })
  })
})
