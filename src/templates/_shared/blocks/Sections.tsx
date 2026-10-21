import { Fragment } from "react"
import type { ReactNode } from "react"
import type { Features, InvitationConfigBase, SectionId } from "../schema"

/** Sections that only render when their feature flag is on. */
export const FEATURE_FOR: Partial<Record<SectionId, keyof Features>> = {
  countdown: "countdown",
  story: "story",
  gallery: "gallery",
  map: "map",
  rsvp: "rsvp",
  wishes: "wishes",
  gifts: "gifts",
  calendar: "calendar",
}

export function isSectionEnabled(
  id: SectionId,
  config: Pick<InvitationConfigBase, "features" | "gallery" | "story" | "gifts">
): boolean {
  const flag = FEATURE_FOR[id]
  if (flag && !config.features[flag]) return false
  if (id === "gallery" && config.gallery.length === 0) return false
  if (id === "story" && config.story.length === 0) return false
  if (id === "gifts" && !config.gifts.enabled) return false
  return true
}

export type SectionMap = Partial<Record<SectionId, ReactNode>>

/**
 * Renders a template's section map in the invitation's `sectionsOrder`,
 * skipping disabled features and empty content. Templates stay declarative.
 */
export function Sections({
  config,
  sections,
}: {
  config: InvitationConfigBase
  sections: SectionMap
}) {
  return (
    <>
      {config.sectionsOrder
        .filter((id) => isSectionEnabled(id, config) && sections[id])
        .map((id) => (
          <Fragment key={id}>{sections[id]}</Fragment>
        ))}
    </>
  )
}
