import {
  AddToCalendar,
  Closing,
  Countdown,
  CoverGate,
  Divider,
  EventDetails,
  Footer,
  Gallery,
  Hero,
  MapSection,
  MusicPlayer,
  RsvpForm,
  Sections,
  Wishes,
} from "../../_shared/blocks"
import { useInvitation } from "../../_shared/context"
import { ConfettiField } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { AgeBadge } from "./AgeBadge"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type ConfettiPopConfig } from "./schema"

/**
 * Confetti Pop: candy colours, chunky rounded type, confetti everywhere.
 *
 * Two confetti layers: a seeded SVG field that renders on the server (so the
 * page is festive without JS, WebGL or motion) and, at motion "full", WebGL
 * particles falling over it. The age is a spinning sticker badge; bands
 * alternate between plain and tinted with wave dividers between them.
 */
function ConfettiPop({
  config,
  mode,
}: {
  config: ConfettiPopConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="curtain"
        crest={<AgeBadge age={config.age} size="sm" />}
        decor={<ConfettiField seed={3} count={38} />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="confetti"
          opacity={0.8}
        />
        <ConfettiField seed={21} count={28} className="opacity-70" />
        <Hero
          variant="classic"
          titleEffect={meta.effects.title}
          titleClassName="font-extrabold tracking-tight"
        >
          <AgeBadge age={config.age} className="mt-6" />
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          countdown: (
            <Countdown
              tone="tint"
              variant="ring"
              eyebrow="Party starts in"
              doneLabel="It's party time!"
            />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="timeline" eyebrow="The plan" />
              <Divider />
            </Reveal>
          ),
          gallery: (
            <Gallery
              tone="tint"
              variant="carousel"
              effect={meta.effects.gallery}
              eyebrow={`${config.hosts[0].shortName ?? config.hosts[0].name} so far`}
              title="A few favourites"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="card" eyebrow="Find us" />
            </Reveal>
          ),
          rsvp: <RsvpForm tone="tint" variant="card" title="Are you coming?" />,
          wishes: (
            <Reveal motion={motion}>
              <Wishes variant="stream" title="Birthday wishes" />
            </Reveal>
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="banner"
                decor={
                  <ConfettiField seed={42} count={30} className="opacity-60" />
                }
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
  Component: ConfettiPop,
  fieldsUi: [
    {
      path: ["age"],
      label: "Age being celebrated",
      type: "number",
      min: 1,
      max: 150,
      help: "Shown as the big badge.",
    },
  ],
})
