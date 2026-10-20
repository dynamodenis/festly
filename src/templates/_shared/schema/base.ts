// The shared, Zod-validated shape of every invitation. Templates extend it;
// the editor, server functions and the database (jsonb $type) all reuse it.
import { z } from "zod"

/* ---------- primitives ---------- */

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i
// oklch(L C H) or oklch(L C H / A); L as 0-1 or %, H in degrees.
const OKLCH =
  /^oklch\(\s*(?:0|1|0?\.\d+|1\.0+|\d{1,3}(?:\.\d+)?%)\s+\d*\.?\d+\s+\d*\.?\d+(?:deg)?\s*(?:\/\s*(?:0|1|0?\.\d+|\d{1,3}(?:\.\d+)?%)\s*)?\)$/i

/** Colors are hex or oklch only, so contrast checks and theming stay predictable. */
export const Color = z
  .string()
  .trim()
  .refine((value) => HEX.test(value) || OKLCH.test(value), {
    message: "Use a hex (#c9a05a) or oklch(...) color",
  })

/** http(s) only: blocks javascript:, data: and other schemes in user content. */
export const HttpUrl = z.url({
  protocol: /^https?$/,
  error: "Use an http(s) link",
})

/** ISO 8601 date-time with an explicit offset, e.g. 2027-06-12T15:00:00+03:00. */
export const IsoDateTime = z.iso.datetime({ offset: true })

/** IANA time zone such as "Africa/Nairobi", checked against the runtime's tz database. */
export const TimeZone = z.string().refine(
  (zone) => {
    try {
      new Intl.DateTimeFormat("en", { timeZone: zone })
      return true
    } catch {
      return false
    }
  },
  { message: "Use an IANA time zone, e.g. Africa/Nairobi" }
)

const text = (max: number) => z.string().trim().min(1).max(max)
const optionalText = (max: number) => z.string().trim().max(max).optional()

/* ---------- media ---------- */

export const MediaRef = z.object({
  /** Object-storage key; the source of truth (URLs can be re-signed or moved). */
  assetKey: text(512),
  url: HttpUrl,
  width: z.int().positive().optional(),
  height: z.int().positive().optional(),
  alt: optionalText(300),
})
export type MediaRef = z.infer<typeof MediaRef>

/* ---------- people & event ---------- */

export const HostRole = z.enum([
  "bride",
  "groom",
  "host",
  "graduate",
  "celebrant",
  "baby",
  "company",
  "other",
])

export const Host = z.object({
  name: text(120),
  shortName: optionalText(40),
  role: HostRole,
  photo: MediaRef.optional(),
  parentsLine: optionalText(200),
})

export const EventType = z.enum([
  "wedding",
  "birthday",
  "graduation",
  "baby_shower",
  "anniversary",
  "corporate",
  "engagement",
  "khitanan",
  "aqiqah",
  "other",
])
export type EventType = z.infer<typeof EventType>

const endsAfterStart = <T extends { start: string; end?: string }>(value: T) =>
  !value.end || Date.parse(value.end) > Date.parse(value.start)

export const SubEvent = z
  .object({
    label: text(80),
    start: IsoDateTime,
    end: IsoDateTime.optional(),
    /** Name of a secondary venue; omit to use the main venue. */
    venueRef: optionalText(120),
  })
  .refine(endsAfterStart, { message: "End must be after start", path: ["end"] })

export const Event = z.object({
  type: EventType,
  title: text(120),
  subtitle: optionalText(200),
  subEvents: z.array(SubEvent).max(10).default([]),
})

export const DateTime = z
  .object({
    start: IsoDateTime,
    end: IsoDateTime.optional(),
    timezone: TimeZone,
  })
  .refine(endsAfterStart, { message: "End must be after start", path: ["end"] })

/**
 * Provider-agnostic venue (rule 11): coordinates and address only. Map embeds
 * and directions links are derived at render time by the chosen adapter.
 */
export const Venue = z
  .object({
    name: text(120),
    address: text(300),
    placeName: optionalText(200),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    notes: optionalText(500),
  })
  .refine((v) => (v.lat === undefined) === (v.lng === undefined), {
    message: "Provide both latitude and longitude, or neither",
    path: ["lng"],
  })

/* ---------- design ---------- */

export const MotionLevel = z.enum(["full", "reduced", "none"])

export const CustomPalette = z.object({
  primary: Color,
  secondary: Color,
  accent: Color,
  background: Color,
  foreground: Color,
})

export const Theme = z.object({
  /** Preset palette id; `custom` overrides it when present. */
  paletteId: text(60),
  custom: CustomPalette.optional(),
  fontPairId: text(60),
  motionLevel: MotionLevel.default("full"),
  ornament: optionalText(60),
})

export const Music = z.object({
  enabled: z.boolean().default(false),
  source: z
    .discriminatedUnion("kind", [
      z.object({ kind: z.literal("library"), trackId: text(80) }),
      z.object({ kind: z.literal("upload"), assetKey: text(512) }),
    ])
    .optional(),
  startAtSec: z.number().min(0).max(600).optional(),
  loop: z.boolean().default(true),
})

/* ---------- content ---------- */

export const Texts = z.object({
  coverTitle: text(120),
  coverButtonLabel: text(40),
  headline: text(160),
  message: text(2000),
  dressCode: optionalText(200),
  rsvpPrompt: text(300),
  rsvpDeadline: IsoDateTime.optional(),
  closing: text(500),
  footerNote: optionalText(300),
})

export const StoryItem = z.object({
  date: optionalText(60),
  title: text(120),
  body: text(1500),
  photo: MediaRef.optional(),
})

export const Gifts = z.object({
  enabled: z.boolean().default(false),
  accounts: z
    .array(z.object({ bank: text(80), holder: text(120), number: text(60) }))
    .max(10)
    .default([]),
  ewallets: z
    .array(
      z.object({ provider: text(60), holder: text(120), number: text(60) })
    )
    .max(10)
    .default([]),
  qrImage: MediaRef.optional(),
  registryLinks: z
    .array(z.object({ label: text(80), url: HttpUrl }))
    .max(10)
    .default([]),
})

export const SectionId = z.enum([
  "hero",
  "hosts",
  "event",
  "countdown",
  "story",
  "gallery",
  "map",
  "rsvp",
  "wishes",
  "gifts",
  "calendar",
  "closing",
])
export type SectionId = z.infer<typeof SectionId>

export const Features = z.object({
  countdown: z.boolean().default(true),
  rsvp: z.boolean().default(true),
  wishes: z.boolean().default(true),
  gallery: z.boolean().default(true),
  story: z.boolean().default(false),
  gifts: z.boolean().default(false),
  calendar: z.boolean().default(true),
  map: z.boolean().default(true),
  music: z.boolean().default(false),
})

export const Seo = z.object({
  title: optionalText(70),
  description: optionalText(200),
  ogImage: MediaRef.optional(),
})

export const MAX_GALLERY = 30

/* ---------- the whole invitation ---------- */

export const InvitationConfigBase = z.object({
  hosts: z.array(Host).min(1).max(8),
  event: Event,
  datetime: DateTime,
  venue: Venue,
  theme: Theme,
  music: Music.default({ enabled: false, loop: true }),
  texts: Texts,
  gallery: z
    .array(MediaRef)
    .max(MAX_GALLERY, { message: `At most ${MAX_GALLERY} photos` })
    .default([]),
  story: z.array(StoryItem).max(20).default([]),
  gifts: Gifts.default({
    enabled: false,
    accounts: [],
    ewallets: [],
    registryLinks: [],
  }),
  features: Features.default({
    countdown: true,
    rsvp: true,
    wishes: true,
    gallery: true,
    story: false,
    gifts: false,
    calendar: true,
    map: true,
    music: false,
  }),
  sectionsOrder: z
    .array(SectionId)
    .min(1)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: "Each section can appear only once",
    }),
  seo: Seo.default({}),
})

/** Parsed (output) type: defaults applied. This is what is stored and rendered. */
export type InvitationConfigBase = z.infer<typeof InvitationConfigBase>
/** Input type: what a form or API caller may send before defaults are applied. */
export type InvitationConfigBaseInput = z.input<typeof InvitationConfigBase>

/* ---------- derived types for blocks and the theme layer ---------- */

export type Host = z.infer<typeof Host>
export type SubEvent = z.infer<typeof SubEvent>
export type Venue = z.infer<typeof Venue>
export type MotionLevel = z.infer<typeof MotionLevel>
export type CustomPalette = z.infer<typeof CustomPalette>
export type Theme = z.infer<typeof Theme>
export type Music = z.infer<typeof Music>
export type Texts = z.infer<typeof Texts>
export type StoryItem = z.infer<typeof StoryItem>
export type Gifts = z.infer<typeof Gifts>
export type Features = z.infer<typeof Features>
