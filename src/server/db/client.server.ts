// Database client. node-postgres over TCP works with Neon's pooled endpoint
// and with any local Postgres. If Phase 8 picks Cloudflare Workers, swap this
// file to drizzle-orm/neon-http; nothing else imports the driver.
import { drizzle } from "drizzle-orm/node-postgres"
import type { NodePgDatabase } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { serverEnv } from "@/env.server"
import * as schema from "./schema"

export type Db = NodePgDatabase<typeof schema>

type Cache = { pool?: Pool; db?: Db }
// Survive Vite HMR in dev so each reload does not open a new pool.
const cache = ((globalThis as { __festlyDb?: Cache }).__festlyDb ??= {})

export function getDb(): Db {
  if (cache.db) return cache.db
  const url = serverEnv.DATABASE_URL
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and paste your Neon pooled connection string."
    )
  }
  cache.pool = new Pool({ connectionString: url, max: 5 })
  cache.db = drizzle(cache.pool, { schema, casing: "snake_case" })
  return cache.db
}

/** Close the pool (scripts and tests). */
export async function closeDb(): Promise<void> {
  await cache.pool?.end()
  cache.pool = undefined
  cache.db = undefined
}
