// Drizzle schema (Postgres on Neon). jsonb columns are typed with the same Zod
// output types that templates render, so DB rows and components cannot drift.
import { sql } from "drizzle-orm"
import {
  boolean,
  check,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import type { InvitationConfigBase } from "../../templates/_shared/schema"
import { TEMPLATE_CATEGORIES } from "../../templates/types"

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())

/* ---------- enums ---------- */

export const invitationStatus = pgEnum("invitation_status", [
  "draft",
  "published",
  "archived",
])
export const mediaKind = pgEnum("media_kind", ["image", "audio"])
export const rsvpAttending = pgEnum("rsvp_attending", ["yes", "no", "maybe"])
export const templateCategory = pgEnum("template_category", TEMPLATE_CATEGORIES)

/* ---------- auth (Better Auth; usePlural maps user → users etc.) ---------- */

export const users = pgTable("users", {
  // Text ids: Better Auth issues string ids.
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  // Better Auth always sets it; nullable so pre-auth rows stay valid.
  name: text("name"),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
})

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)]
)

/** One row per sign-in method: "credential" (password hash) or "google". */
export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("accounts_user_idx").on(t.userId)]
)

/** Short-lived tokens: email verification, password reset. */
export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("verifications_identifier_idx").on(t.identifier)]
)

/* ---------- templates ---------- */

export const templatesMeta = pgTable("templates_meta", {
  /** "<category>/<slug>", matches TemplateMeta.id and the code registry. */
  id: text("id").primaryKey(),
  category: templateCategory("category").notNull(),
  name: text("name").notNull(),
  isPremium: boolean("is_premium").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  enabled: boolean("enabled").notNull().default(true),
})

/* ---------- invitations ---------- */

export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    templateId: text("template_id")
      .notNull()
      .references(() => templatesMeta.id),
    /** Null until first publish; unique once set. */
    slug: text("slug").unique(),
    status: invitationStatus("status").notNull().default("draft"),
    draftConfig: jsonb("draft_config").$type<InvitationConfigBase>().notNull(),
    publishedConfig: jsonb("published_config").$type<InvitationConfigBase>(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("invitations_owner_idx").on(t.ownerId),
    check(
      "invitations_slug_format",
      sql`${t.slug} IS NULL OR ${t.slug} ~ '^[a-z0-9](?:[a-z0-9-]{1,58})[a-z0-9]$'`
    ),
    check(
      "invitations_published_has_config",
      sql`${t.status} <> 'published' OR (${t.publishedConfig} IS NOT NULL AND ${t.slug} IS NOT NULL)`
    ),
  ]
)

/* ---------- media ---------- */

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    invitationId: uuid("invitation_id").references(() => invitations.id, {
      onDelete: "set null",
    }),
    kind: mediaKind("kind").notNull(),
    key: text("key").notNull().unique(),
    mime: text("mime").notNull(),
    bytes: integer("bytes").notNull(),
    width: integer("width"),
    height: integer("height"),
    durationSec: real("duration_sec"),
    createdAt: createdAt(),
  },
  (t) => [
    index("media_assets_owner_idx").on(t.ownerId),
    index("media_assets_invitation_idx").on(t.invitationId),
    check("media_assets_bytes_positive", sql`${t.bytes} > 0`),
  ]
)

/* ---------- guest responses ---------- */

export const rsvps = pgTable(
  "rsvps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    guestName: text("guest_name").notNull(),
    attending: rsvpAttending("attending").notNull(),
    partySize: integer("party_size").notNull().default(1),
    message: text("message"),
    contact: text("contact"),
    createdAt: createdAt(),
    /** Salted hashes only; raw IPs and user agents are never stored. */
    ipHash: text("ip_hash").notNull(),
    userAgentHash: text("user_agent_hash").notNull(),
  },
  (t) => [
    index("rsvps_invitation_idx").on(t.invitationId, t.createdAt),
    check("rsvps_party_size_range", sql`${t.partySize} BETWEEN 0 AND 20`),
  ]
)

export const wishes = pgTable(
  "wishes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    message: text("message").notNull(),
    /** Visible by default; owners hide unwanted wishes from the dashboard. */
    approved: boolean("approved").notNull().default(true),
    createdAt: createdAt(),
    ipHash: text("ip_hash").notNull(),
  },
  (t) => [index("wishes_invitation_idx").on(t.invitationId, t.createdAt)]
)

/* ---------- analytics ---------- */

export const pageViews = pgTable(
  "page_views",
  {
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    day: date("day", { mode: "string" }).notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.invitationId, t.day] })]
)

/* ---------- geocoding ---------- */

export const geocodeCache = pgTable("geocode_cache", {
  /** sha256 of the normalized query string. */
  queryHash: text("query_hash").primaryKey(),
  query: text("query").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  displayName: text("display_name").notNull(),
  createdAt: createdAt(),
})

/* ---------- guest list ---------- */

export const guests = pgTable(
  "guests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => invitations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    /** Unguessable token used in personal links (?to=<token>). */
    slugToken: text("slug_token").notNull().unique(),
    group: text("group"),
  },
  (t) => [index("guests_invitation_idx").on(t.invitationId)]
)

/* ---------- inferred row types ---------- */

export type User = typeof users.$inferSelect
export type TemplateMetaRow = typeof templatesMeta.$inferSelect
export type Invitation = typeof invitations.$inferSelect
export type NewInvitation = typeof invitations.$inferInsert
export type MediaAsset = typeof mediaAssets.$inferSelect
export type Rsvp = typeof rsvps.$inferSelect
export type Wish = typeof wishes.$inferSelect
export type Guest = typeof guests.$inferSelect
