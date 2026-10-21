// @vitest-environment node
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, describe, expect, it, vi } from "vitest"
import { parseServerEnv } from "@/env.server"
import { selectStorage } from "./index.server"
import {
  createLocalDriver,
  pathFor,
  readLocalObject,
  signUpload,
  verifyUpload,
  writeLocalObject,
} from "./local.server"
import { createR2Driver } from "./r2.server"

const r2Config = {
  accountId: "acc123",
  accessKeyId: "AKIDEXAMPLE",
  secretAccessKey: "secret",
  bucket: "festly",
  publicUrl: "https://media.example.com/",
}

describe("R2 driver", () => {
  it("presigns a PUT that binds the content type and expires in 10 minutes", async () => {
    const r2 = createR2Driver(r2Config)
    const target = await r2.createUploadTarget({
      key: "u/dev-user/image/a b.webp",
      mime: "image/webp",
      bytes: 10,
    })
    const url = new URL(target.url)
    expect(url.host).toBe("acc123.r2.cloudflarestorage.com")
    expect(url.pathname).toBe("/festly/u/dev-user/image/a%20b.webp")
    expect(url.searchParams.get("X-Amz-Expires")).toBe("600")
    expect(url.searchParams.get("X-Amz-Algorithm")).toBe("AWS4-HMAC-SHA256")
    expect(url.searchParams.get("X-Amz-SignedHeaders")).toContain(
      "content-type"
    )
    expect(url.searchParams.get("X-Amz-Signature")).toMatch(/^[0-9a-f]{64}$/)
    expect(target.headers).toEqual({ "Content-Type": "image/webp" })
    expect(target.method).toBe("PUT")
  })

  it("reads object metadata and treats 404 as missing", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        new Response(null, {
          status: 200,
          headers: { "content-length": "1234", "content-type": "image/webp" },
        })
      )
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
    const r2 = createR2Driver(r2Config, fetchMock)
    expect(await r2.head("u/x/image/1.webp")).toEqual({
      bytes: 1234,
      mime: "image/webp",
    })
    expect(await r2.head("u/x/image/2.webp")).toBeNull()
    const signed = fetchMock.mock.calls[0][0] as Request
    expect(signed.method).toBe("HEAD")
    expect(signed.headers.get("authorization")).toMatch(/^AWS4-HMAC-SHA256 /)
  })

  it("builds public URLs on the configured base", () => {
    expect(createR2Driver(r2Config).publicUrl("u/x/image/1.webp")).toBe(
      "https://media.example.com/u/x/image/1.webp"
    )
  })
})

describe("local driver", () => {
  const secret = "test-secret-1234567890"
  const upload = {
    key: "u/dev-user/image/1.webp",
    mime: "image/webp",
    bytes: 3,
    exp: Math.floor(Date.now() / 1000) + 60,
  }

  it("verifies its own signatures and rejects tampering or expiry", () => {
    const sig = signUpload(secret, upload)
    expect(verifyUpload(secret, upload, sig)).toBe(true)
    expect(verifyUpload(secret, { ...upload, bytes: 4 }, sig)).toBe(false)
    expect(verifyUpload(secret, { ...upload, mime: "image/png" }, sig)).toBe(
      false
    )
    expect(verifyUpload("other-secret-123456", upload, sig)).toBe(false)
    expect(verifyUpload(secret, upload, sig, (upload.exp + 1) * 1000)).toBe(
      false
    )
    expect(verifyUpload(secret, upload, "zz")).toBe(false)
  })

  it("never resolves a key outside its root", () => {
    expect(() => pathFor("/srv/storage", "../etc/passwd")).toThrow()
    expect(() => pathFor("/srv/storage", "u/../../x")).toThrow()
    expect(pathFor("/srv/storage", "u/a/b.webp")).toBe(
      "/srv/storage/u/a/b.webp"
    )
  })

  let root = ""
  afterAll(async () => {
    if (root) await rm(root, { recursive: true, force: true })
  })

  it("round-trips an object through write, head, read and delete", async () => {
    root = await mkdtemp(join(tmpdir(), "festly-storage-"))
    const driver = createLocalDriver({
      secret,
      origin: "http://localhost:3000",
      root,
    })
    await writeLocalObject(
      root,
      upload.key,
      upload.mime,
      new Uint8Array([1, 2, 3])
    )
    expect(await driver.head(upload.key)).toEqual({
      bytes: 3,
      mime: "image/webp",
    })
    expect((await readLocalObject(root, upload.key))?.body.length).toBe(3)
    await driver.delete(upload.key)
    expect(await driver.head(upload.key)).toBeNull()
    expect(driver.publicUrl(upload.key)).toBe(
      "http://localhost:3000/api/storage/file/u/dev-user/image/1.webp"
    )
    const target = await driver.createUploadTarget({
      key: upload.key,
      mime: upload.mime,
      bytes: 3,
    })
    expect(new URL(target.url).pathname).toBe("/api/storage/upload")
  })
})

describe("selectStorage", () => {
  it("uses R2 when fully configured", () => {
    const env = parseServerEnv({
      R2_ACCOUNT_ID: "a",
      R2_ACCESS_KEY_ID: "b",
      R2_SECRET_ACCESS_KEY: "c",
      R2_BUCKET: "d",
      R2_PUBLIC_URL: "https://pub.example.r2.dev",
    })
    expect(selectStorage(env).id).toBe("r2")
  })

  it("falls back to local in development and refuses in production", () => {
    expect(
      selectStorage(
        parseServerEnv({ NODE_ENV: "development", R2_BUCKET: "only-one" })
      ).id
    ).toBe("local")
    expect(() =>
      selectStorage(parseServerEnv({ NODE_ENV: "production" }))
    ).toThrow(/R2_/)
  })
})
