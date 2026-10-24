// pnpm db:claim-dev <email> — hand everything the pre-auth dev user owns
// (invitations, uploads) to a real account. Sign up in the app first.
import { eq } from "drizzle-orm"
import { closeDb, getDb } from "@/server/db/client.server"
import * as schema from "@/server/db/schema"
import { DEV_USER } from "@/server/db/seed"

const email = process.argv[2]?.trim().toLowerCase()
if (!email) {
  console.error("Usage: pnpm db:claim-dev <email of your account>")
  process.exit(1)
}
if (process.env.NODE_ENV === "production") {
  console.error("Refusing to run with NODE_ENV=production.")
  process.exit(1)
}

try {
  const db = getDb()
  const user = (
    await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, email))
  ).at(0)
  if (!user) {
    console.error(`No account for ${email}. Sign up in the app first.`)
    process.exit(1)
  }
  const moved = await db.transaction(async (tx) => {
    const invitations = await tx
      .update(schema.invitations)
      .set({ ownerId: user.id })
      .where(eq(schema.invitations.ownerId, DEV_USER.id))
      .returning({ id: schema.invitations.id })
    const media = await tx
      .update(schema.mediaAssets)
      .set({ ownerId: user.id })
      .where(eq(schema.mediaAssets.ownerId, DEV_USER.id))
      .returning({ id: schema.mediaAssets.id })
    return { invitations: invitations.length, media: media.length }
  })
  console.log(
    `Moved ${moved.invitations} invitations and ${moved.media} uploads to ${email}.`
  )
} finally {
  await closeDb()
}
