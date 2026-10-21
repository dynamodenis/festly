import { describe, expect, it } from "vitest"
import { getIn, pathKey, setIn } from "./set-in"

describe("setIn / getIn", () => {
  it("sets nested values without mutating the original", () => {
    const original = { a: { b: [1, { c: 2 }] }, x: 1 }
    const next = setIn(original, ["a", "b", 1, "c"], 3)
    expect(getIn(next, ["a", "b", 1, "c"])).toBe(3)
    expect(getIn(original, ["a", "b", 1, "c"])).toBe(2)
    expect(next.x).toBe(1)
    expect(next.a.b[0]).toBe(original.a.b[0])
  })

  it("creates missing containers and deletes keys set to undefined", () => {
    expect(setIn({}, ["seo", "title"], "Hi")).toEqual({ seo: { title: "Hi" } })
    expect(setIn({ a: 1, b: 2 }, ["b"], undefined)).toEqual({ a: 1 })
    expect(setIn({ list: [] as Array<string> }, ["list", 0], "x")).toEqual({
      list: ["x"],
    })
  })

  it("formats issue paths", () => {
    expect(pathKey(["hosts", 0, "name"])).toBe("hosts.0.name")
  })
})
