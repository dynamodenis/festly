import { R2_KEYS, serverEnv, type ServerEnv } from "@/env.server"
import { createLocalDriver } from "./local.server"
import { createR2Driver } from "./r2.server"
import type { StorageDriver } from "./types"

const DEV_SECRET = "festly-local-storage-dev-secret"

/**
 * STORAGE_DRIVER=r2 → R2 (env validation already guaranteed every key).
 * STORAGE_DRIVER=local → local disk (development only).
 * Unset → R2 when fully configured, otherwise local in development.
 */
export function selectStorage(env: ServerEnv): StorageDriver {
  const complete = R2_KEYS.every((key) => !!env[key])
  const wantR2 =
    env.STORAGE_DRIVER === "r2" ||
    (env.STORAGE_DRIVER === undefined && complete)

  if (wantR2) {
    const {
      R2_ACCOUNT_ID,
      R2_ACCESS_KEY_ID,
      R2_SECRET_ACCESS_KEY,
      R2_BUCKET,
      R2_PUBLIC_URL,
    } = env
    if (
      !R2_ACCOUNT_ID ||
      !R2_ACCESS_KEY_ID ||
      !R2_SECRET_ACCESS_KEY ||
      !R2_BUCKET ||
      !R2_PUBLIC_URL
    ) {
      throw new Error(
        `Storage is set to R2 but missing: ${R2_KEYS.filter((k) => !env[k]).join(", ")}`
      )
    }
    return createR2Driver({
      accountId: R2_ACCOUNT_ID,
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
      bucket: R2_BUCKET,
      publicUrl: R2_PUBLIC_URL,
    })
  }
  if (env.NODE_ENV === "production") {
    throw new Error(
      "Storage is not configured: set STORAGE_DRIVER=r2 and the R2_* variables (docs/STORAGE.md)."
    )
  }
  return createLocalDriver({
    secret: env.STORAGE_SIGNING_SECRET ?? DEV_SECRET,
    origin: env.APP_ORIGIN,
  })
}

let cached: StorageDriver | undefined
export function getStorage(): StorageDriver {
  cached ??= selectStorage(serverEnv)
  return cached
}

export type StorageInfo = { driver: StorageDriver["id"] }

/** Which driver is active (the editor shows a badge for local storage). */
export function storageInfo(): StorageInfo {
  return { driver: getStorage().id }
}

export type { StorageDriver } from "./types"
