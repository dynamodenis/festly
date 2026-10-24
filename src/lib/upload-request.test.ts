import { describe, expect, it } from "vitest"
import {
  UploadNetworkError,
  describeProgress,
  minDuration,
  putWithProgress,
} from "./upload-request"

/** A scriptable XMLHttpRequest stand-in. */
class FakeXhr {
  status = 0
  responseText = ""
  headers: Record<string, string> = {}
  method = ""
  url = ""
  body: unknown = null
  upload: { onprogress: ((e: ProgressEvent) => void) | null } = {
    onprogress: null,
  }
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  constructor(private readonly script: (xhr: FakeXhr) => void) {}
  open(method: string, url: string) {
    this.method = method
    this.url = url
  }
  setRequestHeader(name: string, value: string) {
    this.headers[name] = value
  }
  abort() {}
  send(body: unknown) {
    this.body = body
    this.script(this)
  }
}

function fakeXhr(script: (xhr: FakeXhr) => void) {
  const created: Array<FakeXhr> = []
  const create = () => {
    const xhr = new FakeXhr(script)
    created.push(xhr)
    return xhr as never
  }
  return { create, created }
}

const target = {
  url: "https://bucket.test/k",
  method: "PUT" as const,
  headers: { "Content-Type": "image/webp" },
}
const progress = (loaded: number, total: number) =>
  ({ lengthComputable: true, loaded, total }) as ProgressEvent

describe("putWithProgress", () => {
  it("sends the signed headers and reports progress to 100%", async () => {
    const seen: Array<number> = []
    const { create, created } = fakeXhr((xhr) => {
      xhr.upload.onprogress?.(progress(25, 100))
      xhr.upload.onprogress?.(progress(80, 100))
      xhr.status = 200
      xhr.onload?.()
    })
    await putWithProgress(target, new Blob(["x"]), (p) => seen.push(p), create)
    expect(created[0].method).toBe("PUT")
    expect(created[0].headers["Content-Type"]).toBe("image/webp")
    expect(seen).toEqual([25, 80, 100])
  })

  it("explains storage rejections and network (CORS) failures", async () => {
    const rejected = fakeXhr((xhr) => {
      xhr.status = 403
      xhr.responseText = "SignatureDoesNotMatch"
      xhr.onload?.()
    })
    await expect(
      putWithProgress(target, new Blob(["x"]), undefined, rejected.create)
    ).rejects.toThrow(/403.*SignatureDoesNotMatch/)
    const offline = fakeXhr((xhr) => xhr.onerror?.())
    await expect(
      putWithProgress(target, new Blob(["x"]), undefined, offline.create)
    ).rejects.toBeInstanceOf(UploadNetworkError)
  })
})

describe("minDuration", () => {
  it("waits for the minimum even when the work is instant", async () => {
    const waits: Array<number> = []
    const value = await minDuration(
      Promise.resolve(7),
      400,
      async (t) => void waits.push(t)
    )
    expect(value).toBe(7)
    expect(waits).toEqual([400])
  })

  it("still rejects with the original error", async () => {
    await expect(
      minDuration(Promise.reject(new Error("boom")), 1)
    ).rejects.toThrow("boom")
  })
})

describe("describeProgress", () => {
  it("labels each stage", () => {
    expect(describeProgress({ stage: "resizing" })).toBe("Resizing…")
    expect(describeProgress({ stage: "uploading", percent: 42 })).toBe(
      "Uploading 42%"
    )
    expect(describeProgress({ stage: "saving" })).toBe("Saving…")
    expect(describeProgress(null)).toBe("")
  })
})
