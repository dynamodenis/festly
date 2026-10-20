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
export type TitleEffectId = "split" | "blur" | "shiny" | "none"
export type GalleryEffectId = "tilted" | "carousel" | "none"
export const ORNAMENTS = [
  "leaf",
  "line",
  "dots",
  "wave",
  "star",
  "diamond",
] as const
/** Divider style. `theme.ornament` can override the template's default. */
export type OrnamentKind = (typeof ORNAMENTS)[number]

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
  /** Corner radius the template is designed around; becomes `--inv-radius`. */
  radius?: string
  /** Default divider style; `theme.ornament` overrides it per invitation. */
  ornament?: OrnamentKind
  /** Paper-grain overlay on the whole page. */
  grain?: boolean
  effects: {
    background?: BackgroundEffect
    title?: TitleEffectId
    gallery?: GalleryEffectId
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

/**
 * Erases a template's extended schema type so modules with different
 * extensions can share one registry. Safe because the renderer always parses
 * `config` with the module's own schema before calling its Component.
 */
export function defineTemplate<TSchema extends TemplateSchema>(
  module: TemplateModule<TSchema>
): TemplateModule {
  return module
}
