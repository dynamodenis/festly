import { defineConfig } from "drizzle-kit"

// Node 20.12+ reads .env natively; ignore a missing file (CI sets real env).
try {
  process.loadEnvFile(".env")
} catch {
  // no .env file
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
  strict: true,
  verbose: true,
})
