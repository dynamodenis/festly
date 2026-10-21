// pnpm db:local [--port 55433]
//
// An in-memory Postgres for local testing: PGlite behind a Postgres
// wire-protocol socket, with the real migrations and the seed applied.
// Point a dev server at it without touching Neon:
//   DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55433/postgres pnpm dev --port 3100
// Data is discarded when the process exits.
import { PGlite } from "@electric-sql/pglite"
import { PGLiteSocketServer } from "@electric-sql/pglite-socket"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import * as schema from "../src/server/db/schema"
import { seed } from "../src/server/db/seed"

const args = process.argv.slice(2)
const portArg = args.indexOf("--port")
const port = portArg === -1 ? 55433 : Number(args[portArg + 1])

const client = await PGlite.create()
const db = drizzle(client, { schema, casing: "snake_case" })
await migrate(db, { migrationsFolder: "./drizzle" })
await seed(db)

const server = new PGLiteSocketServer({
  db: client,
  port,
  host: "127.0.0.1",
  maxConnections: 10,
})
await server.start()
console.log(
  `Local Postgres (PGlite) ready on 127.0.0.1:${port} — migrated and seeded`
)
console.log(
  `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:${port}/postgres`
)

const stop = async () => {
  await server.stop()
  await client.close()
  process.exit(0)
}
process.on("SIGINT", stop)
process.on("SIGTERM", stop)
