import { serverEnv, type ServerEnv } from "@/env.server"
import { createLocalDriver } from "./local.server"
import { createR2Driver } from "./r2.server"
import type { StorageDriver } from "./types"

const DEV_SECRET = "festly-local-storage-dev-secret"

/** R2 when fully configured; the local driver otherwise, outside production only. */
export function selectStorage(env: ServerEnv): StorageDriver {
  const {
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET,
    R2_PUBLIC_URL,
  } = env
  if (
    R2_ACCOUNT_ID &&
    R2_ACCESS_KEY_ID &&
    R2_SECRET_ACCESS_KEY &&
    R2_BUCKET &&
    R2_PUBLIC_URL
  ) {
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
      "Storage is not configured: set the R2_* variables (see .env.example)."
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

export type { StorageDriver } from "./types"
