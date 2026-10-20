import {
  AddToCalendar,
  Closing,
  Countdown,
  CoverGate,
  Divider,
  EventDetails,
  Footer,
  Gallery,
  GiftEnvelope,
  Hero,
  Hosts,
  MapSection,
  MusicPlayer,
  RsvpForm,
  Sections,
  StoryTimeline,
  Wishes,
} from "../../_shared/blocks"
import { useInvitation } from "../../_shared/context"
import { Flourishes, Monogram } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type IvoryGardenConfig } from "./schema"

/**
 * Ivory Garden: a classic garden wedding on textured paper.
 *
 * Signature details: a monogram crest on the cover and in the closing,
 * botanical flourishes in the corners, a double hairline frame around the
 * hero, silk drifting behind it, arch-framed portraits, a mosaic gallery of
 * tilting photo cards, and ivory/tinted bands alternating down the page.
 */
function IvoryGarden({
  config,
  mode,
}: {
  config: IvoryGardenConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const cover = config.hosts.at(0)?.photo ?? config.gallery.at(0)
  const crest = <Monogram hosts={config.hosts} />

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="split"
        imageUrl={cover?.url}
        imageAlt={cover?.alt}
        crest={crest}
        decor={<Flourishes className="opacity-80" />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0.5}
        />
        <div
          aria-hidden="true"
          className="inv-frame [--inv-frame-inset:1.25rem] sm:[--inv-frame-inset:2rem]"
        />
        <Flourishes className="m-4 size-20 opacity-60 sm:m-8 sm:size-28" />
        <Hero variant="classic" titleEffect={meta.effects.title}>
          <Divider />
          <p className="text-xs tracking-[0.35em] text-inv-muted uppercase">
            {config.venue.placeName ?? config.venue.name}
          </p>
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          hosts: (
            <Reveal motion={motion}>
              <Hosts
                variant="duo"
                portrait="arch"
                eyebrow="Together with their families"
                title="The couple"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown tone="tint" variant="boxes" eyebrow="Save the date" />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="cards" eyebrow="When & where" />
              <Divider />
            </Reveal>
          ),
          story: (
            <Reveal motion={motion}>
              <StoryTimeline
                variant="alternating"
                title="Our story"
                eyebrow="How it began"
              />
            </Reveal>
          ),
          gallery: (
            <Gallery
              tone="tint"
              variant="mosaic"
              effect={meta.effects.gallery}
              eyebrow="Moments"
              title="Our favourite frames"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="split" eyebrow="Getting there" />
            </Reveal>
          ),
          rsvp: <RsvpForm tone="tint" variant="card" />,
          wishes: (
            <Reveal motion={motion}>
              <Wishes variant="cards" title="Wishes for the couple" />
            </Reveal>
          ),
          gifts: (
            <Reveal motion={motion}>
              <GiftEnvelope variant="envelope" />
            </Reveal>
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="signature"
                crest={crest}
                decor={<Flourishes className="opacity-50" />}
              />
              <Footer />
            </>
          ),
        }}
      />

      <MusicPlayer />
    </div>
  )
}

export default defineTemplate({
  meta,
  schema,
  defaults,
  Component: IvoryGarden,
})
