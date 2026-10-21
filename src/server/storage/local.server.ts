// Development storage on local disk (.storage/). Mirrors the R2 flow: the
// server signs a short-lived URL, the browser PUTs to /api/storage/upload,
// files are served from /api/storage/file/<key>. Never used in production.
import { createHmac, timingSafeEqual } from "node:crypto"
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import type { StorageDriver, UploadTarget } from "./types"
import { UPLOAD_TTL_SECONDS } from "./types"

export const LOCAL_ROOT = resolve(".storage")

export type LocalConfig = { secret: string; origin: string; root?: string }

export type SignedUpload = {
  key: string
  mime: string
  bytes: number
  exp: number
}

export function signUpload(secret: string, u: SignedUpload): string {
  return createHmac("sha256", secret)
    .update(`${u.key}\n${u.mime}\n${u.bytes}\n${u.exp}`)
    .digest("hex")
}

export function verifyUpload(
  secret: string,
  u: SignedUpload,
  sig: string,
  now = Date.now()
): boolean {
  if (u.exp * 1000 < now) return false
  const expected = Buffer.from(signUpload(secret, u), "hex")
  const given = Buffer.from(sig, "hex")
  return expected.length === given.length && timingSafeEqual(expected, given)
}

/** Resolve a key inside the root; throws on any path escape. */
export function pathFor(root: string, key: string): string {
  const full = resolve(root, key)
  if (!full.startsWith(root + "/")) throw new Error("Invalid key")
  return full
}

export async function writeLocalObject(
  root: string,
  key: string,
  mime: string,
  body: Uint8Array
) {
  const file = pathFor(root, key)
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, body)
  await writeFile(
    `${file}.meta.json`,
    JSON.stringify({ mime, bytes: body.byteLength })
  )
}

export async function readLocalObject(root: string, key: string) {
  const file = pathFor(root, key)
  try {
    const meta = JSON.parse(await readFile(`${file}.meta.json`, "utf8")) as {
      mime: string
    }
    return { body: await readFile(file), mime: meta.mime }
  } catch {
    return null
  }
}

export function createLocalDriver(config: LocalConfig): StorageDriver {
  const root = config.root ?? LOCAL_ROOT
  const origin = config.origin.replace(/\/$/, "")
  return {
    id: "local",

    async createUploadTarget({ key, mime, bytes }): Promise<UploadTarget> {
      const exp = Math.floor(Date.now() / 1000) + UPLOAD_TTL_SECONDS
      const sig = signUpload(config.secret, { key, mime, bytes, exp })
      const qs = new URLSearchParams({
        key,
        mime,
        bytes: String(bytes),
        exp: String(exp),
        sig,
      })
      return {
        url: `${origin}/api/storage/upload?${qs.toString()}`,
        method: "PUT",
        headers: { "Content-Type": mime },
        expiresAt: new Date(exp * 1000).toISOString(),
      }
    },

    async head(key) {
      try {
        const file = pathFor(root, key)
        const meta = JSON.parse(
          await readFile(`${file}.meta.json`, "utf8")
        ) as { mime: string }
        return { bytes: (await stat(file)).size, mime: meta.mime }
      } catch {
        return null
      }
    },

    async delete(key) {
      const file = pathFor(root, key)
      await rm(file, { force: true })
      await rm(`${file}.meta.json`, { force: true })
    },

    publicUrl: (key) =>
      `${origin}/api/storage/file/${key.split("/").map(encodeURIComponent).join("/")}`,
  }
}

export { join }
