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
  Hosts,
  MapSection,
  MusicPlayer,
  RsvpForm,
  Sections,
  StoryTimeline,
  Wishes,
} from "../../_shared/blocks"
import { useInvitation } from "../../_shared/context"
import { Seal, StarField } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { Diploma } from "./Diploma"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type CapAndGownConfig } from "./schema"

/**
 * Cap & Gown: midnight navy and gold foil, formal serif capitals.
 *
 * A seeded star field sits under a slow aurora; the "Class of" headline is
 * foil (a light sweep runs over it once JS loads); school and degree are a
 * framed diploma with a rotating rosette seal; the story becomes a numbered
 * milestones grid. The ornament is a four-point star.
 */
function CapAndGown({
  config,
  mode,
}: {
  config: CapAndGownConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const { graduation } = config
  const year = `'${String(graduation.classOf).slice(-2)}`
  const stars = <StarField seed={5} className="opacity-80" />

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="minimal"
        crest={<Seal label={year} caption="Class of" />}
        decor={stars}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="bold"
          opacity={0.45}
        />
        <StarField seed={9} className="opacity-70" />
        <Hero
          variant="poster"
          titleEffect={meta.effects.title}
          title={`Class of ${graduation.classOf}`}
          titleClassName="inv-foil tracking-[0.04em]"
          kicker={config.event.title}
        >
          <Diploma graduate={config.hosts[0].name} graduation={graduation} />
          <p className="mt-20 max-w-xl text-lg leading-relaxed text-pretty text-inv-muted">
            {config.texts.message}
          </p>
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          hosts: (
            <Reveal motion={motion}>
              <Hosts
                variant="spotlight"
                portrait="square"
                eyebrow="Celebrating"
              />
              <Divider />
            </Reveal>
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="cards" eyebrow="The day" />
            </Reveal>
          ),
          story: (
            <StoryTimeline
              tone="tint"
              variant="milestones"
              eyebrow="Milestones"
              title="The road here"
            />
          ),
          gallery: (
            <Reveal motion={motion}>
              <Gallery
                variant="masonry"
                effect={meta.effects.gallery}
                eyebrow="Snapshots"
                title="Along the way"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown
              tone="tint"
              variant="inline"
              eyebrow="Until the big day"
              doneLabel="Congratulations, graduate!"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="split" eyebrow="Lunch venue" />
            </Reveal>
          ),
          rsvp: (
            <Reveal motion={motion}>
              <RsvpForm variant="plain" title="Join us for lunch?" />
            </Reveal>
          ),
          wishes: (
            <Wishes
              tone="tint"
              variant="cards"
              title="Notes for the graduate"
            />
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="signature"
                crest={<Seal label={year} caption="Class of" />}
                decor={
                  <StarField seed={13} count={40} className="opacity-60" />
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
  Component: CapAndGown,
})
