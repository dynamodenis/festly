// pnpm db:seed — run the idempotent seed against DATABASE_URL.
import { closeDb, getDb } from "@/server/db/client.server"
import { seed } from "@/server/db/seed"

if (
  process.env.NODE_ENV === "production" &&
  !process.argv.includes("--force")
) {
  console.error(
    "Refusing to seed with NODE_ENV=production. Pass --force to override."
  )
  process.exit(1)
}

try {
  const result = await seed(getDb())
  console.log(
    `Seeded ${result.templates} templates and ${result.invitations} sample invitation.`
  )
} finally {
  await closeDb()
}
