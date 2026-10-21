import { describe, expect, it } from "vitest"
import {
  ObjectKey,
  checkUpload,
  newObjectKey,
  ownerPrefix,
} from "./upload-policy"

describe("upload policy", () => {
  it("accepts allowed types within limits", () => {
    expect(checkUpload("image", "image/jpeg", 6 * 1024 * 1024)).toEqual({
      ok: true,
    })
    expect(checkUpload("audio", "audio/mpeg", 9 * 1024 * 1024)).toEqual({
      ok: true,
    })
  })

  it("rejects wrong types, empty and oversized files", () => {
    expect(checkUpload("image", "image/gif", 10).ok).toBe(false)
    expect(checkUpload("image", "audio/mpeg", 10).ok).toBe(false)
    expect(checkUpload("image", "image/png", 0).ok).toBe(false)
    expect(checkUpload("image", "image/png", 8 * 1024 * 1024 + 1).ok).toBe(
      false
    )
    expect(checkUpload("audio", "audio/mpeg", 10 * 1024 * 1024 + 1).ok).toBe(
      false
    )
  })

  it("builds owner-scoped keys that pass validation", () => {
    const key = newObjectKey("dev-user", "image", "image/webp", "abc-123")
    expect(key).toBe("u/dev-user/image/abc-123.webp")
    expect(key.startsWith(ownerPrefix("dev-user"))).toBe(true)
    expect(ObjectKey.safeParse(key).success).toBe(true)
  })

  it("rejects traversal and malformed keys", () => {
    for (const bad of [
      "../etc/passwd",
      "u/x/../y",
      "u//x",
      "/abs/key",
      "u/x/a b.jpg",
      "single",
    ]) {
      expect(ObjectKey.safeParse(bad).success).toBe(false)
    }
  })
})
