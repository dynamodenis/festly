import type { FC } from "react"
import type { z } from "zod"
import type { EventType, InvitationConfigBase } from "./_shared/schema"

export const TEMPLATE_CATEGORIES = [
  "wedding",
  "birthday",
  "graduation",
  "baby_shower",
  "anniversary",
  "corporate",
  "other",
] as const
export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number]

export type BackgroundEffect =
  "aurora" | "silk" | "particles" | "iridescence" | "waves" | "none"

export interface TemplateMeta {
  /** "<category>/<slug>", e.g. "wedding/ivory-garden". */
  id: string
  name: string
  category: TemplateCategory
  tags: Array<string>
  description: string
  /** Path under /public, e.g. "/thumbs/wedding-ivory-garden.webp". */
  thumbnail: string
  isPremium: boolean
  supportedEventTypes: Array<EventType>
  defaultPaletteId: string
  defaultFontPairId: string
  effects: {
    background?: BackgroundEffect
    title?: string
    gallery?: string
  }
}

export type TemplateMode = "preview" | "public"

/** Any template schema must produce at least the shared base config. */
export type TemplateSchema = z.ZodType<InvitationConfigBase>

export interface TemplateModule<
  TSchema extends TemplateSchema = TemplateSchema,
> {
  meta: TemplateMeta
  schema: TSchema
  defaults: z.infer<TSchema>
  Component: FC<{ config: z.infer<TSchema>; mode: TemplateMode }>
}
